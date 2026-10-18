import { excludeSeenLinks } from "./filters";
import { composeDigest, MIN_ITEMS } from "./compose";
import { fetchWeeklyTechNews } from "./fetch-feeds";
import { fetchGithubTrending } from "./fetch-github";
import { fetchTrendingModels } from "./fetch-huggingface";
import { fetchOpenRouterTrending } from "./fetch-openrouter";
import { nextMondayNineKst } from "./kst";
import { summarizeCandidates } from "./summarize";
import type { Candidate, DigestItem } from "./types";

export type BuiltDigest = { title: string; content: string; publishedAt: Date };

export type BuildResult =
  | { status: "built"; post: BuiltDigest; stats: { candidates: number; selected: number } }
  | { status: "skipped"; reason: "no_items" | "not_enough_items" };

// 수집 → 후보 정리 → LLM 1회 → 조립. DB 를 읽지도 쓰지도 않는다.
// seenLinks: 지난 글에 이미 나온 링크(정규화됨). dry-run 에서는 빈 배열을 넘긴다.
export async function buildWeeklyDigest(seenLinks: string[], now: Date = new Date()): Promise<BuildResult> {
  const startedAt = Date.now();
  const [feedsResult, githubResult, hfResult, openRouterResult] = await Promise.allSettled([
    fetchWeeklyTechNews(),
    fetchGithubTrending(),
    fetchTrendingModels(),
    fetchOpenRouterTrending(),
  ]);

  const failedSources: string[] = [];
  const settle = <T>(result: PromiseSettledResult<T>, name: string, fallback: T): T => {
    if (result.status === "fulfilled") return result.value;
    console.error(`${name} 수집 실패:`, result.reason);
    failedSources.push(name);
    return fallback;
  };

  const feeds = settle(feedsResult, "피드", { items: [] as DigestItem[], failedSources: [] as string[] });
  failedSources.push(...feeds.failedSources);
  const repos = settle(githubResult, "GitHub 트렌딩", [] as DigestItem[]);
  const hfModels = settle(hfResult, "Hugging Face", []);
  const openRouterModels = settle(openRouterResult, "OpenRouter", []);

  const pool = excludeSeenLinks([...feeds.items, ...repos], seenLinks);
  if (pool.length === 0) return { status: "skipped", reason: "no_items" };
  // 후보가 이 수보다 적으면 LLM 이 골라도 발행 기준에 못 미치므로 호출하지 않는다.
  if (pool.length < MIN_ITEMS) return { status: "skipped", reason: "not_enough_items" };

  const candidates: Candidate[] = pool.map(({ kind, source, title, link, body }, i) => ({
    id: i + 1,
    kind,
    source,
    title,
    link,
    body,
  }));

  const summary = await summarizeCandidates(candidates, startedAt);
  if (summary.items.length < MIN_ITEMS) return { status: "skipped", reason: "not_enough_items" };

  const publishedAt = nextMondayNineKst(now);
  const { title, content } = composeDigest({
    output: summary,
    candidates,
    hfModels,
    openRouterModels,
    failedSources,
    bannedLeft: summary.bannedLeft,
  });

  return {
    status: "built",
    post: { title, content, publishedAt },
    stats: { candidates: candidates.length, selected: summary.items.length },
  };
}
