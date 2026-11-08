// "이번 주의 스택" 후보. 이번 주 후보 글에 이름이 나온 스택만 골라 소개 재료를 모은다.
// 이름이 직접 나오지 않는 연관성은 잡지 못한다(대신 LLM 호출을 늘리지 않는다).
import { fetchReadmeText, githubHeaders, type GithubSearchItem } from "./fetch-github";
import { normalizeLink } from "./filters";
import { fetchWithTimeout, USER_AGENT } from "./http";
import { truncate } from "./text";
import type { DigestItem } from "./types";

export type Stack = {
  name: string;
  repo: string; // owner/repo. 소개 재료(스타·README)를 가져오는 곳
  aliases: string[]; // 후보 글에서 찾을 이름. 대소문자를 구분하고 단어 단위로 찾는다
};

// 꾸준히 많이 쓰이는 스택. 흔한 영어 단어와 겹치는 이름은 별칭을 구체적으로 둔다(Express → Express.js).
export const STACKS: Stack[] = [
  { name: "FastAPI", repo: "fastapi/fastapi", aliases: ["FastAPI"] },
  { name: "Django", repo: "django/django", aliases: ["Django"] },
  { name: "Flask", repo: "pallets/flask", aliases: ["Flask"] },
  { name: "Spring Boot", repo: "spring-projects/spring-boot", aliases: ["Spring Boot"] },
  { name: "Express", repo: "expressjs/express", aliases: ["Express.js", "ExpressJS"] },
  { name: "NestJS", repo: "nestjs/nest", aliases: ["NestJS"] },
  { name: "React", repo: "facebook/react", aliases: ["React"] },
  { name: "Vue", repo: "vuejs/core", aliases: ["Vue", "Vue.js"] },
  { name: "Svelte", repo: "sveltejs/svelte", aliases: ["Svelte", "SvelteKit"] },
  { name: "Tailwind CSS", repo: "tailwindlabs/tailwindcss", aliases: ["Tailwind"] },
  { name: "Vite", repo: "vitejs/vite", aliases: ["Vite"] },
  { name: "Electron", repo: "electron/electron", aliases: ["Electron"] },
  { name: "htmx", repo: "bigskysoftware/htmx", aliases: ["htmx"] },
  { name: "PostgreSQL", repo: "postgres/postgres", aliases: ["PostgreSQL", "Postgres"] },
  { name: "SQLite", repo: "sqlite/sqlite", aliases: ["SQLite"] },
  { name: "Redis", repo: "redis/redis", aliases: ["Redis"] },
  { name: "Elasticsearch", repo: "elastic/elasticsearch", aliases: ["Elasticsearch"] },
  { name: "Kafka", repo: "apache/kafka", aliases: ["Kafka"] },
  { name: "Celery", repo: "celery/celery", aliases: ["Celery"] },
  { name: "Nginx", repo: "nginx/nginx", aliases: ["Nginx", "nginx", "NGINX"] },
  { name: "Docker", repo: "moby/moby", aliases: ["Docker"] },
  { name: "Kubernetes", repo: "kubernetes/kubernetes", aliases: ["Kubernetes", "k8s"] },
];

const MAX_STACKS = 3;
const STACK_BODY_LIMIT = 2500;
const HN_STORY_MIN_POINTS = 100;
const HN_STORIES = 3;
// Algolia 는 접두어로도 맞춰서("Electron" → "electronics") 넉넉히 받아 이름이 단어로 들어간 글만 남긴다.
const HN_FETCH = 10;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 영문·숫자에 붙어 있으면 다른 단어의 일부다(Reactive, Vitest). 한글 조사는 붙어도 된다(FastAPI로).
function mentionCount(text: string, alias: string): number {
  return text.match(new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(alias)}(?![A-Za-z0-9])`, "g"))?.length ?? 0;
}

// 후보 글 전체에서 많이 언급된 순으로, 지난 글에서 이미 소개한 스택은 빼고 최대 limit 개.
export function findMentionedStacks(
  items: Pick<DigestItem, "title" | "body">[],
  seenLinks: string[],
  limit = MAX_STACKS,
): Stack[] {
  const text = items.map((i) => `${i.title}\n${i.body}`).join("\n");
  const seen = new Set(seenLinks);
  return STACKS.map((stack) => ({
    stack,
    count: stack.aliases.reduce((sum, alias) => sum + mentionCount(text, alias), 0),
  }))
    .filter(({ stack, count }) => count > 0 && !seen.has(normalizeLink(repoUrl(stack))))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ stack }) => stack);
}

const repoUrl = (stack: Stack) => `https://github.com/${stack.repo}`;

export type HnStory = { title: string; points: number; year: number };

// 소개 재료. 수치·연도·일화는 여기 적힌 것만 쓰도록 프롬프트가 제한한다.
export function buildStackBody(params: {
  repo: Pick<GithubSearchItem, "description" | "stargazers_count" | "language" | "created_at"> & {
    license?: { spdx_id?: string | null } | null;
  };
  readme: string;
  hnStories: HnStory[];
}): string {
  const { repo, readme, hnStories } = params;
  const facts = [
    `GitHub 스타 ${repo.stargazers_count.toLocaleString("en-US")}개`,
    `${new Date(repo.created_at).getUTCFullYear()}년 GitHub 저장소 생성`,
    repo.language ? `주 언어 ${repo.language}` : "",
    repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" ? `라이선스 ${repo.license.spdx_id}` : "",
  ].filter(Boolean);
  const stories = hnStories.map((s) => `- ${s.year}년 "${s.title}" (HN ${s.points}점)`);
  return truncate(
    [
      `기본 정보: ${facts.join(", ")}`,
      repo.description ? `설명: ${repo.description}` : "",
      stories.length > 0 ? `Hacker News 역대 화제 글:\n${stories.join("\n")}` : "",
      readme ? `README 앞부분: ${readme}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    STACK_BODY_LIMIT,
  );
}

export function pickHnStories(
  hits: { title: string; points: number; created_at: string }[],
  stack: Pick<Stack, "aliases">,
): HnStory[] {
  return hits
    .filter((h) => stack.aliases.some((alias) => mentionCount(h.title, alias) > 0))
    .slice(0, HN_STORIES)
    .map((h) => ({ title: h.title, points: h.points, year: new Date(h.created_at).getUTCFullYear() }));
}

async function fetchHnStories(stack: Stack): Promise<HnStory[]> {
  try {
    const params = new URLSearchParams({
      query: stack.name,
      tags: "story",
      restrictSearchableAttributes: "title",
      numericFilters: `points>${HN_STORY_MIN_POINTS}`,
      hitsPerPage: String(HN_FETCH),
    });
    const res = await fetchWithTimeout(`https://hn.algolia.com/api/v1/search?${params}`, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { hits?: { title: string; points: number; created_at: string }[] };
    return pickHnStories(data.hits ?? [], stack);
  } catch {
    return [];
  }
}

async function fetchStack(stack: Stack): Promise<DigestItem> {
  const res = await fetchWithTimeout(`https://api.github.com/repos/${stack.repo}`, { headers: githubHeaders() });
  if (!res.ok) throw new Error(`GitHub 레포 조회 실패: HTTP ${res.status} ${stack.repo}`);
  const repo = (await res.json()) as GithubSearchItem & { license?: { spdx_id?: string | null } | null };
  const [readme, hnStories] = await Promise.all([fetchReadmeText(stack.repo), fetchHnStories(stack)]);
  return {
    kind: "stack",
    source: stack.name,
    title: stack.name,
    link: repoUrl(stack),
    body: buildStackBody({ repo, readme, hnStories }),
    pubDate: new Date(repo.created_at),
    categories: [],
  };
}

// 개별 스택 실패는 건너뛴다. 스택 코너는 없어도 글이 성립한다.
export async function fetchStackCandidates(items: DigestItem[], seenLinks: string[]): Promise<DigestItem[]> {
  const results = await Promise.allSettled(findMentionedStacks(items, seenLinks).map(fetchStack));
  return results.flatMap((r) => {
    if (r.status === "fulfilled") return [r.value];
    console.error("스택 자료 수집 실패:", r.reason);
    return [];
  });
}
