// GitHub 공식 Search API 로 "이번 주에 새로 생겨서 스타를 많이 받은 레포"를 가져온다.
// github.com/trending 페이지 자체(기존 레포의 재부상까지 포함)는 공식 API가 없어서 다루지 않는다.
import { fetchWithTimeout } from "./http";
import { isCandidateRepo } from "./filters";
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

  return data.items
    .filter((r) =>
      isCandidateRepo({
        fullName: r.full_name,
        description: r.description ?? "",
        fork: r.fork,
        archived: r.archived,
      }),
    )
    .slice(0, POOL_SIZE)
    .map((r) => ({
      kind: "repo" as const,
      source: "GitHub 급상승 레포",
      title: `${r.full_name} (⭐${r.stargazers_count}${r.language ? `, ${r.language}` : ""})`,
      link: r.html_url,
      body: r.description ?? "",
      pubDate: new Date(r.created_at),
      categories: [],
    }));
}
