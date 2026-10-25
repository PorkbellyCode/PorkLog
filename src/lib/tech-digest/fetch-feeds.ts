import { XMLParser } from "fast-xml-parser";
import { fetchWithTimeout, USER_AGENT } from "./http";
import { matchesCategoryAllowList, pickLatestStableRelease } from "./filters";
import { extractArticleText, htmlToText, truncate } from "./text";
import { BODY_LIMIT, type DigestItem } from "./types";

export type { DigestItem };

export type FeedConfig = {
  name: string;
  url: string;
  kind: "article" | "release" | "community";
  // 소스당 최대 항목 수(릴리스는 항상 1개).
  limit: number;
  // 있으면 이 카테고리 중 하나를 가진 항목만 쓴다.
  categoryAllow?: string[];
};

const ARTICLE_LIMIT = 2;

function article(name: string, url: string, extra: Partial<FeedConfig> = {}): FeedConfig {
  return { name, url, kind: "article", limit: ARTICLE_LIMIT, ...extra };
}

function release(repo: string): FeedConfig {
  return { name: `${repo} 릴리스`, url: `https://github.com/${repo}/releases.atom`, kind: "release", limit: 1 };
}

// 고객 사례·스타트업 소개가 섞여 있어 제품·엔지니어링·API·연구 카테고리만 쓴다.
const OPENAI_CATEGORIES = ["Product", "Engineering", "API", "Research"];

const FEEDS: FeedConfig[] = [
  article("OpenAI", "https://openai.com/news/rss.xml", { categoryAllow: OPENAI_CATEGORIES }),
  article("Hugging Face Blog", "https://huggingface.co/blog/feed.xml"),
  article("Andrej Karpathy", "https://karpathy.github.io/feed.xml"),
  article("Simon Willison", "https://simonwillison.net/atom/everything/"),
  article("Sebastian Raschka", "https://sebastianraschka.com/rss_feed.xml"),
  article("Eugene Yan", "https://eugeneyan.com/rss/"),
  article("Hamel Husain", "https://hamel.dev/index.xml"),
  article("Lilian Weng", "https://lilianweng.github.io/index.xml"),
  article("Dan Abramov", "https://overreacted.io/rss.xml"),
  article("Kent C. Dodds", "https://kentcdodds.com/blog/rss.xml"),
  article("Addy Osmani", "https://addyosmani.com/feed.xml"),
  article("Anthony Fu", "https://antfu.me/feed.xml"),
  article("Vercel 블로그", "https://vercel.com/atom"),
  article("Cloudflare 블로그", "https://blog.cloudflare.com/rss/"),
  release("vercel/next.js"),
  release("facebook/react"),
  release("microsoft/TypeScript"),
  release("nodejs/node"),
  release("anthropics/claude-code"),
];

const LOOKBACK_DAYS = 7;
// 피드 본문이 이보다 짧으면 링크를 열어 본문을 가져온다.
const SHORT_BODY = 300;

export const parser = new XMLParser({
  ignoreAttributes: false,
  cdataPropName: "__cdata",
  processEntities: true,
  htmlEntities: true,
});

// XML 파싱 결과의 텍스트/속성 필드는 문자열, CDATA 객체, 또는 undefined 로 온다.
type XmlValue = string | number | { __cdata: string } | { "#text": string } | { "@_href"?: string } | undefined;

// RSS <item> 또는 Atom <entry> 하나에서 실제로 읽는 필드만 명시.
type XmlNode = {
  title?: XmlValue;
  link?: XmlValue | XmlValue[];
  description?: XmlValue;
  "content:encoded"?: XmlValue;
  category?: XmlValue | XmlValue[];
  pubDate?: XmlValue;
  content?: XmlValue;
  summary?: XmlValue;
  published?: XmlValue;
  updated?: XmlValue;
};

type RssParsed = { rss?: { channel?: { item?: XmlNode | XmlNode[] } } };
type AtomParsed = { feed?: { entry?: XmlNode | XmlNode[] } };

function textOf(value: XmlValue): string {
  if (value == null) return "";
  if (typeof value === "object" && "__cdata" in value) {
    return String(value.__cdata);
  }
  // <content type="html"> 처럼 속성이 붙은 요소는 텍스트가 #text 에 들어온다.
  if (typeof value === "object" && "#text" in value) {
    return String(value["#text"]);
  }
  return String(value);
}

function categoriesOf(value: XmlNode["category"]): string[] {
  const list = Array.isArray(value) ? value : value == null ? [] : [value];
  return list.map((v) => textOf(v as XmlValue).trim()).filter(Boolean);
}

function extractAtomLink(linkField: XmlNode["link"]): string {
  const candidates = Array.isArray(linkField) ? linkField : [linkField];
  const alt =
    candidates.find(
      (l): l is { "@_href"?: string; "@_rel"?: string } =>
        typeof l === "object" && l !== null && "@_rel" in l && (l as { "@_rel"?: string })["@_rel"] === "alternate",
    ) ?? candidates[0];
  if (typeof alt === "object" && alt !== null && "@_href" in alt) {
    return String((alt as { "@_href"?: string })["@_href"] ?? "");
  }
  return "";
}

function toNodeList(raw: XmlNode | XmlNode[] | undefined): XmlNode[] {
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

function toItem(feed: FeedConfig, link: string, node: XmlNode, body: string, pubDate: string): DigestItem {
  return {
    kind: feed.kind,
    source: feed.name,
    title: htmlToText(textOf(node.title)),
    link,
    body: truncate(htmlToText(body)),
    pubDate: new Date(pubDate),
    categories: categoriesOf(node.category),
  };
}

export function parseRss(parsed: RssParsed, feed: FeedConfig): DigestItem[] {
  return toNodeList(parsed?.rss?.channel?.item).map((item) =>
    toItem(
      feed,
      textOf(item.link as XmlValue),
      item,
      textOf(item["content:encoded"] ?? item.description),
      textOf(item.pubDate),
    ),
  );
}

export function parseAtom(parsed: AtomParsed, feed: FeedConfig): DigestItem[] {
  return toNodeList(parsed?.feed?.entry).map((entry) =>
    toItem(
      feed,
      extractAtomLink(entry.link),
      entry,
      textOf(entry.content ?? entry.summary),
      textOf(entry.published ?? entry.updated),
    ),
  );
}

async function fetchFeed(feed: FeedConfig): Promise<DigestItem[]> {
  const res = await fetchWithTimeout(feed.url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`${feed.name} RSS 요청 실패: HTTP ${res.status}`);
  }
  const xml = await res.text();
  const parsed = parser.parse(xml) as RssParsed & AtomParsed;

  const items = parsed.feed ? parseAtom(parsed, feed) : parseRss(parsed, feed);

  const cutoff = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const recent = items.filter(
    (item) => item.title && item.link && !isNaN(item.pubDate.getTime()) && item.pubDate >= cutoff,
  );

  if (feed.kind === "release") {
    const latest = pickLatestStableRelease(recent);
    return latest ? [latest] : [];
  }

  return recent
    .filter((item) => matchesCategoryAllowList(item.categories, feed.categoryAllow))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, feed.limit);
}

// 커뮤니티 항목은 보충 후에도 본문이 이보다 짧으면 쓰지 않는다(제목만으로 글을 쓰게 하지 않는다).
export const MIN_COMMUNITY_BODY = 200;

// 응답이 HTML 인가. PDF 등은 본문 추출이 의미 없으므로 보충하지 않는다.
export function isHtmlContentType(contentType: string | null): boolean {
  return contentType !== null && contentType.toLowerCase().includes("text/html");
}

export function hasEnoughCommunityBody(item: { body: string }): boolean {
  return item.body.length >= MIN_COMMUNITY_BODY;
}

// 피드 본문이 짧은 글·커뮤니티 항목은 링크를 열어 본문을 보충한다. 실패하면 짧은 본문 그대로 둔다.
export async function enrichShortBodies(items: DigestItem[]): Promise<DigestItem[]> {
  return Promise.all(
    items.map(async (item) => {
      if ((item.kind !== "article" && item.kind !== "community") || item.body.length >= SHORT_BODY) return item;
      try {
        const res = await fetchWithTimeout(item.link, { headers: { "User-Agent": USER_AGENT } });
        if (!res.ok || !isHtmlContentType(res.headers.get("content-type"))) return item;
        const text = extractArticleText(await res.text());
        return text.length > item.body.length ? { ...item, body: text.slice(0, BODY_LIMIT) } : item;
      } catch {
        return item;
      }
    }),
  );
}

export type FeedResult = { items: DigestItem[]; failedSources: string[] };

// 피드를 병렬 수집. 개별 피드 실패는 전체를 막지 않고 실패한 소스 이름만 돌려준다.
export async function fetchWeeklyTechNews(): Promise<FeedResult> {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const items: DigestItem[] = [];
  const failedSources: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      console.error(`${FEEDS[i].name} 수집 실패:`, result.reason);
      failedSources.push(FEEDS[i].name);
    }
  });

  return { items: await enrichShortBodies(items), failedSources };
}
