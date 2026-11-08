import { hasExcludedKeyword } from "./filters";
import {
  enrichShortBodies,
  hasEnoughCommunityBody,
  parseRss,
  parser,
  type FeedConfig,
} from "./fetch-feeds";
import { fetchWithTimeout, USER_AGENT } from "./http";
import { kstDateString } from "./kst";
import { htmlToText } from "./text";
import type { DigestItem } from "./types";

const HN_API = "https://hn.algolia.com/api/v1/search";
const HN_MIN_POINTS = 150;
const HN_HITS_PER_PAGE = 300;
const HN_LIMIT = 10;
const LOOKBACK_DAYS = 7;

const LOBSTERS_FEED: FeedConfig = {
  name: "Lobsters",
  url: "https://lobste.rs/top/1w.rss",
  kind: "community",
  limit: 5,
};

export type HnHit = {
  objectID: string;
  title: string;
  url: string | null;
  points: number;
  num_comments: number | null;
  created_at: string;
};

const COMMUNITY_HOSTS = ["news.ycombinator.com", "lobste.rs", "news.hada.io"];

// 출처 표기. compose.ts 가 `원문: [source](link)` 로 쓰므로 source 가 링크 대상과 일치해야 한다.
export function communitySource(link: string, communityName: string): string {
  try {
    const host = new URL(link).hostname.toLowerCase();
    if (COMMUNITY_HOSTS.includes(host)) return communityName;
    return host.replace(/^www\./, "");
  } catch {
    return communityName;
  }
}

// 점수 상위 limit 개를 DigestItem 으로. 본문은 이후 단계에서 링크를 열어 채운다.
// url 이 없는 글(Ask/Tell HN, Who is hiring)은 글 페이지가 댓글 스레드라 본문으로 쓸 수 없어 뺀다.
export function toHnItems(hits: HnHit[], limit = HN_LIMIT): DigestItem[] {
  return hits
    .filter((hit): hit is HnHit & { url: string } => Boolean(hit.url))
    .sort((a, b) => b.points - a.points)
    .filter((hit) => !hasExcludedKeyword(hit.title))
    .slice(0, limit)
    .map((hit) => ({
      kind: "community" as const,
      source: communitySource(hit.url, "Hacker News"),
      title: `${hit.title} (HN ${hit.points}점, 댓글 ${hit.num_comments ?? 0})`,
      link: hit.url,
      body: "",
      pubDate: new Date(hit.created_at),
      categories: [],
    }));
}

// HN 검색 요청 URL. numericFilters 의 `>` 는 인코딩하지 않으면 JSON 대신 오류 응답이 온다.
export function buildHnUrl(nowSec: number): string {
  const since = nowSec - LOOKBACK_DAYS * 24 * 60 * 60;
  const params = new URLSearchParams({
    tags: "story",
    numericFilters: `created_at_i>${since},points>${HN_MIN_POINTS}`,
    hitsPerPage: String(HN_HITS_PER_PAGE),
  });
  return `${HN_API}?${params}`;
}

// 링크가 Lobsters 자체 글(텍스트 글)인가. 이 페이지는 댓글 스레드라 보충하지 않고 RSS 설명만 쓴다.
export function isLobstersOwnLink(link: string): boolean {
  try {
    return new URL(link).hostname.toLowerCase() === "lobste.rs";
  } catch {
    return false;
  }
}

// RSS 순서(인기순)를 유지한 채 상위 limit 개에 출처·순위를 붙인다.
// 제외 키워드가 있는 글을 먼저 거르고, 순위는 거른 뒤 다시 매긴다.
export function toLobstersItems(items: DigestItem[], limit = 5): DigestItem[] {
  return items
    .filter((item) => !hasExcludedKeyword(item.title))
    .slice(0, limit)
    .map((item, i) => ({
      ...item,
      source: communitySource(item.link, "Lobsters"),
      title: `${item.title} (Lobsters 주간 ${i + 1}위)`,
    }));
}

export async function fetchHackerNews(): Promise<DigestItem[]> {
  const res = await fetchWithTimeout(buildHnUrl(Math.floor(Date.now() / 1000)), { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Hacker News 요청 실패: HTTP ${res.status}`);
  }
  const data = (await res.json()) as { hits?: HnHit[]; nbHits?: number };
  if ((data.nbHits ?? 0) > HN_HITS_PER_PAGE) {
    console.warn(`Hacker News 결과가 ${HN_HITS_PER_PAGE}개를 넘어 일부만 사용합니다(nbHits=${data.nbHits}).`);
  }
  const enriched = await enrichShortBodies(toHnItems(data.hits ?? []));
  return enriched.filter(hasEnoughCommunityBody);
}

export async function fetchLobsters(): Promise<DigestItem[]> {
  const res = await fetchWithTimeout(LOBSTERS_FEED.url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Lobsters RSS 요청 실패: HTTP ${res.status}`);
  }
  const parsed = parser.parse(await res.text());
  const items = parseRss(parsed, LOBSTERS_FEED).filter((item) => item.title && item.link);
  const enriched = await Promise.all(
    toLobstersItems(items, LOBSTERS_FEED.limit).map(async (item) =>
      isLobstersOwnLink(item.link) ? item : (await enrichShortBodies([item]))[0],
    ),
  );
  return enriched.filter(hasEnoughCommunityBody);
}

// ── GeekNews ─────────────────────────────────────────
// RSS 에는 점수가 없어 화제성을 알 수 없다. 날짜별 "지난 소식" 페이지(past?day=)에 points 가 있어 그것을 읽는다.
// HTML 구조가 바뀌면 파싱 결과가 비므로, 그때는 실패로 보고 다른 소스만으로 진행한다.

const GEEKNEWS_BASE = "https://news.hada.io";
const GEEKNEWS_LIMIT = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

export type GeekNewsTopic = {
  id: string;
  title: string;
  desc: string;
  points: number;
  comments: number;
  publishedAt: Date;
};

// 크론은 일요일 새벽에 돈다. 그날 페이지는 거의 비어 있으므로 어제부터 7일 치를 본다.
export function geekNewsDayUrls(now: Date): string[] {
  return Array.from({ length: LOOKBACK_DAYS }, (_, i) => {
    const day = kstDateString(new Date(now.getTime() - (i + 1) * DAY_MS));
    return `${GEEKNEWS_BASE}/past?day=${day}`;
  });
}

export function parseGeekNewsPage(html: string): GeekNewsTopic[] {
  return html
    .split("<div class='topic_row'")
    .slice(1)
    .flatMap((row) => {
      const id = row.match(/data-topic-state-id='(\d+)'/)?.[1];
      const title = row.match(/<h2 class='topic-title-heading'>([\s\S]*?)<\/h2>/)?.[1];
      const points = row.match(/<span id='tp\d+'>(\d+)<\/span>/)?.[1];
      if (!id || !title || !points) return [];
      const desc = row.match(/<div class='topicdesc'><a[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? "";
      const comments = row.match(/data-topic-comment-count='(\d+)'/)?.[1] ?? "0";
      const datetime = row.match(/datetime="([^"]+)"/)?.[1] ?? "";
      return [
        {
          id,
          title: htmlToText(title),
          desc: htmlToText(desc).replace(/\.{3}$/, "").trim(),
          points: Number(points),
          comments: Number(comments),
          publishedAt: new Date(datetime),
        },
      ];
    });
}

export function toGeekNewsItems(topics: GeekNewsTopic[], limit = GEEKNEWS_LIMIT): DigestItem[] {
  const unique = [...new Map(topics.map((t) => [t.id, t])).values()];
  return unique
    .filter((t) => !hasExcludedKeyword(t.title))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((t) => ({
      kind: "community" as const,
      source: "GeekNews",
      title: `${t.title} (GeekNews ${t.points}점, 댓글 ${t.comments})`,
      link: `${GEEKNEWS_BASE}/topic?id=${t.id}`,
      body: t.desc,
      pubDate: t.publishedAt,
      categories: [],
    }));
}

export async function fetchGeekNews(now: Date = new Date()): Promise<DigestItem[]> {
  const pages = await Promise.allSettled(
    geekNewsDayUrls(now).map(async (url) => {
      const res = await fetchWithTimeout(url, { headers: { "User-Agent": USER_AGENT } });
      if (!res.ok) throw new Error(`GeekNews 요청 실패: HTTP ${res.status} ${url}`);
      return parseGeekNewsPage(await res.text());
    }),
  );
  const topics = pages.flatMap((p) => (p.status === "fulfilled" ? p.value : []));
  if (topics.length === 0) {
    throw new Error("GeekNews 에서 읽은 글이 없습니다(요청 실패 또는 HTML 구조 변경).");
  }
  // 목록의 요약은 잘려 있다. 토픽 페이지를 열어 GeekNews 요약 전문으로 보충한다.
  const enriched = await enrichShortBodies(toGeekNewsItems(topics));
  return enriched.filter(hasEnoughCommunityBody);
}
