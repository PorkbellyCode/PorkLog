import { dedupeByLink, excludeSeenLinks } from "./filters";
import { composeDigest, MIN_ITEMS, type ParsedOutput } from "./compose";
import { fetchWeeklyTechNews } from "./fetch-feeds";
import { fetchGeekNews, fetchHackerNews, fetchLobsters } from "./fetch-community";
import { fetchCommunityRepos, fetchGithubTrending, isRepoRootLink, parseGithubRepoLink } from "./fetch-github";
import { fetchTrendingModels } from "./fetch-huggingface";
import { fetchOpenRouterTrending } from "./fetch-openrouter";
import { fetchStackCandidates, stackMentionedIn } from "./fetch-stack";
import { nextMondayNineKst } from "./kst";
import { summarizeCandidates } from "./summarize";
import type { Candidate, DigestItem } from "./types";

export type BuiltDigest = { title: string; content: string; publishedAt: Date };

export type BuildResult =
  | { status: "built"; post: BuiltDigest; stats: { candidates: number; selected: number }; candidates: Candidate[] }
  | { status: "skipped"; reason: "no_items" | "not_enough_items" };

// 수집 → 후보 정리 → LLM 1회 → 조립. DB 를 읽지도 쓰지도 않는다.
// seenLinks: 지난 글에 이미 나온 링크(정규화됨). dry-run 에서는 빈 배열을 넘긴다.
export async function buildWeeklyDigest(seenLinks: string[], now: Date = new Date()): Promise<BuildResult> {
  const startedAt = Date.now();
  const [feedsResult, githubResult, hfResult, openRouterResult, hnResult, lobstersResult, geekNewsResult] = await Promise.allSettled([
    fetchWeeklyTechNews(),
    fetchGithubTrending(),
    fetchTrendingModels(),
    fetchOpenRouterTrending(),
    fetchHackerNews(),
    fetchLobsters(),
    fetchGeekNews(now),
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
  const hnItems = settle(hnResult, "Hacker News", [] as DigestItem[]);
  const lobstersItems = settle(lobstersResult, "Lobsters", [] as DigestItem[]);
  const geekNewsItems = settle(geekNewsResult, "GeekNews", [] as DigestItem[]);

  // 개별 레포 조회 실패는 fetchCommunityRepos 안에서 걸러지므로 여기서는 던지지 않는다.
  const communityRepos = await fetchCommunityRepos([...hnItems, ...lobstersItems]);

  // 레포 후보로 옮긴 커뮤니티 글은 이슈 후보에서 뺀다(같은 레포가 두 섹션에 나오지 않게).
  const repoNames = new Set(communityRepos.map((r) => parseGithubRepoLink(r.link)?.toLowerCase()));
  const notMovedToRepos = (item: DigestItem) =>
    !(isRepoRootLink(item.link) && repoNames.has(parseGithubRepoLink(item.link)?.toLowerCase()));

  const collected = [
    ...feeds.items,
    ...repos,
    ...communityRepos,
    ...hnItems.filter(notMovedToRepos),
    ...lobstersItems.filter(notMovedToRepos),
    ...geekNewsItems,
  ];
  const fresh = excludeSeenLinks(dedupeByLink(collected), seenLinks);
  // 이번 주 후보 글에 이름이 나온 스택만 소개 재료를 모은다. 이슈와 관련 없으면 LLM 이 비워 둔다.
  const stacks = await fetchStackCandidates(fresh, seenLinks);

  const pool = dedupeByLink([...fresh, ...stacks]);
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

  const summary = dropUnrelatedStack(await summarizeCandidates(candidates, startedAt), candidates);
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
    candidates,
  };
}

// 스택은 고른 이슈·레포에 이름이 직접 나올 때만 쓴다. 프롬프트로 요구하지만 어기는 경우가 있어 코드로 확인한다.
function dropUnrelatedStack<T extends Pick<ParsedOutput, "items" | "repos" | "stack" | "droppedIds">>(
  summary: T,
  candidates: Candidate[],
): T {
  if (!summary.stack) return summary;
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const stackSource = byId.get(summary.stack.id)?.source ?? "";
  const picked = [...summary.items, ...summary.repos].flatMap((i) => byId.get(i.id) ?? []);
  if (stackMentionedIn(stackSource, picked)) return summary;
  console.warn(`고른 이슈·레포에 ${stackSource} 이(가) 나오지 않아 스택을 뺍니다.`);
  return { ...summary, stack: null, droppedIds: [...summary.droppedIds, summary.stack.id] };
}
