// GitHub 공식 Search API 로 "이번 주에 새로 생겨서 스타를 많이 받은 레포"를 가져온다.
// github.com/trending 페이지 자체(기존 레포의 재부상까지 포함)는 공식 API가 없어서 다루지 않는다.

export type TrendingRepo = {
  rank: number;
  fullName: string;
  url: string;
  description: string;
  stars: number;
  language: string | null;
};

export type TrendingDeveloper = {
  username: string;
  profileUrl: string;
  bio: string | null;
  topRepos: { name: string; url: string; description: string; stars: number }[];
};

export type GithubTrending = {
  repos: TrendingRepo[];
  developers: TrendingDeveloper[];
};

const REPO_RANKING_SIZE = 15;
const DEVELOPER_COUNT = 3;
const LOOKBACK_DAYS = 7;

type GithubSearchOwner = { login: string; type: "User" | "Organization" };
type GithubSearchItem = {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  owner: GithubSearchOwner;
};
type GithubSearchResponse = { items: GithubSearchItem[] };

type GithubUser = { login: string; html_url: string; bio: string | null };
type GithubRepo = { name: string; html_url: string; description: string | null; stargazers_count: number };

function githubHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function githubGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: githubHeaders() });
  if (!res.ok) {
    throw new Error(`GitHub API 요청 실패: ${url} → HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

function sinceDate(): string {
  const d = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

// 급상승 레포의 owner 중 사람 계정(Organization 제외)을 순서대로 최대 N명 뽑아
// 프로필과 대표 레포(스타 상위 5개)를 붙인다. GitHub 공식 trending/developers 알고리즘과
// 동일하지는 않은 근사치다.
async function fetchTrendingDevelopers(repos: GithubSearchItem[]): Promise<TrendingDeveloper[]> {
  const seen = new Set<string>();
  const candidates: string[] = [];
  for (const repo of repos) {
    if (repo.owner.type !== "User") continue;
    if (seen.has(repo.owner.login)) continue;
    seen.add(repo.owner.login);
    candidates.push(repo.owner.login);
    if (candidates.length >= DEVELOPER_COUNT) break;
  }

  return Promise.all(
    candidates.map(async (username) => {
      const [user, topRepos] = await Promise.all([
        githubGet<GithubUser>(`https://api.github.com/users/${username}`),
        githubGet<GithubRepo[]>(`https://api.github.com/users/${username}/repos?sort=stars&per_page=5`),
      ]);

      return {
        username: user.login,
        profileUrl: user.html_url,
        bio: user.bio,
        topRepos: topRepos.map((r) => ({
          name: r.name,
          url: r.html_url,
          description: r.description ?? "",
          stars: r.stargazers_count,
        })),
      };
    }),
  );
}

export async function fetchGithubTrending(): Promise<GithubTrending> {
  const url = `https://api.github.com/search/repositories?q=created:>${sinceDate()}&sort=stars&order=desc&per_page=${REPO_RANKING_SIZE}`;
  const data = await githubGet<GithubSearchResponse>(url);

  const repos = data.items.map((item, i) => ({
    rank: i + 1,
    fullName: item.full_name,
    url: item.html_url,
    description: item.description ?? "",
    stars: item.stargazers_count,
    language: item.language,
  }));

  const developers = await fetchTrendingDevelopers(data.items);

  return { repos, developers };
}
