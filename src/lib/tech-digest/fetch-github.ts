// GitHub 공식 Search API 로 "이번 주에 새로 생겨서 스타를 많이 받은 레포"를 가져온다.
// github.com/trending 페이지 자체는 공식 API가 없어서, 기존 레포의 재부상은 커뮤니티에서 화제가 된 레포 링크로 보완한다.
import { fetchWithTimeout } from "./http";
import { isCandidateRepo } from "./filters";
import { htmlToText, truncate } from "./text";
import type { DigestItem } from "./types";

// 필터로 떨어질 것을 감안해 넉넉히 받고, 후보 풀에는 상위 몇 개만 넣는다.
const FETCH_SIZE = 30;
const POOL_SIZE = 5;
const LOOKBACK_DAYS = 7;

type GithubSearchItem = {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  archived: boolean;
  created_at: string;
};
type GithubSearchResponse = { items: GithubSearchItem[] };

const REPO_BODY_LIMIT = 1500;

function githubHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function sinceDate(): string {
  const d = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export async function fetchGithubTrending(): Promise<DigestItem[]> {
  const url = `https://api.github.com/search/repositories?q=created:>${sinceDate()}+fork:false+archived:false&sort=stars&order=desc&per_page=${FETCH_SIZE}`;
  const res = await fetchWithTimeout(url, { headers: githubHeaders() }, 15_000);
  if (!res.ok) {
    throw new Error(`GitHub API 요청 실패: HTTP ${res.status}`);
  }
  const data = (await res.json()) as GithubSearchResponse;

  const repos = data.items.filter((r) =>
    isCandidateRepo({
      fullName: r.full_name,
      description: r.description ?? "",
      fork: r.fork,
      archived: r.archived,
    }),
  );
  return Promise.all(
    repos.slice(0, POOL_SIZE).map(async (r) => toRepoItem(r, "GitHub 급상승 레포", await fetchReadmeText(r.full_name))),
  );
}

// 설명 한 줄만으로는 무엇인지 알 수 없어 LLM 이 이름으로 추측하게 된다. README 앞부분을 본문에 붙인다.
export function toRepoItem(r: GithubSearchItem, source: string, readme: string, note = ""): DigestItem {
  const meta = `${r.full_name} (⭐${r.stargazers_count}${r.language ? `, ${r.language}` : ""}${note ? `, ${note}` : ""})`;
  const body = [r.description ?? "", readme].filter(Boolean).join("\n\n");
  return {
    kind: "repo",
    source,
    title: meta,
    link: r.html_url,
    body: truncate(body, REPO_BODY_LIMIT),
    pubDate: new Date(r.created_at),
    categories: [],
  };
}

// README 마크다운에서 배지·이미지·HTML 을 걷어내고 링크는 글자만 남긴다.
export function readmeToText(markdown: string): string {
  return htmlToText(
    markdown
      .replace(/```[\s\S]*?```/g, " ") // 코드 블록은 설명보다 길어 앞부분을 다 차지한다
      .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, " ") // 링크 걸린 배지
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // 이미지
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 링크 → 글자
      .replace(/^(#+|>)\s*/gm, "") // 제목·인용 기호
      .replace(/[*_`|]/g, " "),
  );
}

// README 를 못 읽어도 레포 후보는 버리지 않는다(설명만으로 판단하게 둔다).
async function fetchReadmeText(fullName: string): Promise<string> {
  try {
    const res = await fetchWithTimeout(`https://api.github.com/repos/${fullName}/readme`, {
      headers: { ...githubHeaders(), Accept: "application/vnd.github.raw" },
    });
    return res.ok ? readmeToText(await res.text()) : "";
  } catch {
    return "";
  }
}

// github.com/{owner}/{repo} 형태의 레포 링크면 "owner/repo", 아니면 null.
const RESERVED_OWNERS = new Set(["orgs", "features", "blog", "about", "topics", "collections", "marketplace", "sponsors", "settings", "trending", "explore", "enterprise", "pricing", "security", "site"]);

export function parseGithubRepoLink(link: string): string | null {
  try {
    const u = new URL(link);
    if (u.hostname.toLowerCase() !== "github.com") return null;
    const [owner, repo] = u.pathname.split("/").filter(Boolean);
    if (!owner || !repo || RESERVED_OWNERS.has(owner.toLowerCase())) return null;
    return `${owner}/${repo.replace(/\.git$/, "")}`;
  } catch {
    return null;
  }
}

// HN·Lobsters 에서 화제가 된 GitHub 레포를 레포 후보로 만든다. 새로 생긴 레포만 잡는 검색 API 를 보완한다.
// 같은 링크의 커뮤니티 항목은 파이프라인의 링크 중복 제거에서 레포 후보 쪽이 남는다.
export async function fetchCommunityRepos(items: DigestItem[]): Promise<DigestItem[]> {
  const names = [...new Set(items.map((i) => parseGithubRepoLink(i.link)).filter((n): n is string => n !== null))];
  const results = await Promise.allSettled(
    names.map(async (name) => {
      const res = await fetchWithTimeout(`https://api.github.com/repos/${name}`, { headers: githubHeaders() });
      if (!res.ok) throw new Error(`GitHub 레포 조회 실패: HTTP ${res.status} ${name}`);
      const r = (await res.json()) as GithubSearchItem;
      if (!isCandidateRepo({ fullName: r.full_name, description: r.description ?? "", fork: r.fork, archived: r.archived })) {
        return null;
      }
      return toRepoItem(r, "커뮤니티 화제 레포", await fetchReadmeText(r.full_name), "커뮤니티에서 화제");
    }),
  );
  return results.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
}
