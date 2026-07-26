import { XMLParser } from "fast-xml-parser";

export type DigestItem = {
  source: string;
  title: string;
  link: string;
  description: string;
  pubDate: Date;
};

type FeedConfig = {
  name: string;
  url: string;
};

const FEEDS: FeedConfig[] = [
  { name: "카카오 기술블로그", url: "https://tech.kakao.com/feed" },
  { name: "GeekNews", url: "https://news.hada.io/rss/news" },
  { name: "GitHub Blog", url: "https://github.blog/feed/" },
  { name: "dev.to", url: "https://dev.to/feed" },
];

const ITEMS_PER_SOURCE = 5;
const LOOKBACK_DAYS = 7;

const parser = new XMLParser({
  ignoreAttributes: false,
  cdataPropName: "__cdata",
  processEntities: true,
  htmlEntities: true,
});

// XML 파싱 결과의 텍스트/속성 필드는 문자열, CDATA 객체, 또는 undefined 로 온다.
type XmlValue = string | number | { __cdata: string } | { "@_href"?: string } | undefined;

// RSS <item> 또는 Atom <entry> 하나에서 실제로 읽는 필드만 명시.
type XmlNode = {
  title?: XmlValue;
  link?: XmlValue | XmlValue[];
  description?: XmlValue;
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
  return String(value);
}

// Atom content 필드는 HTML 포함 — 태그 제거.
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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

function parseRss(parsed: RssParsed, sourceName: string): DigestItem[] {
  return toNodeList(parsed?.rss?.channel?.item).map((item) => ({
    source: sourceName,
    title: textOf(item.title),
    link: textOf(item.link as XmlValue),
    description: stripHtml(textOf(item.description)),
    pubDate: new Date(textOf(item.pubDate)),
  }));
}

function parseAtom(parsed: AtomParsed, sourceName: string): DigestItem[] {
  return toNodeList(parsed?.feed?.entry).map((entry) => ({
    source: sourceName,
    title: textOf(entry.title),
    link: extractAtomLink(entry.link),
    description: stripHtml(textOf(entry.content ?? entry.summary)),
    pubDate: new Date(textOf(entry.published ?? entry.updated)),
  }));
}

async function fetchFeed(feed: FeedConfig): Promise<DigestItem[]> {
  const res = await fetch(feed.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; PorkLogBot/1.0)" },
  });
  if (!res.ok) {
    throw new Error(`${feed.name} RSS 요청 실패: HTTP ${res.status}`);
  }
  const xml = await res.text();
  const parsed = parser.parse(xml) as RssParsed & AtomParsed;

  const items = parsed.feed ? parseAtom(parsed, feed.name) : parseRss(parsed, feed.name);

  const cutoff = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

  return items
    .filter((item) => !isNaN(item.pubDate.getTime()) && item.pubDate >= cutoff)
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, ITEMS_PER_SOURCE);
}

// 4개 피드를 병렬 수집. 개별 피드 실패는 전체를 막지 않고 콘솔에만 남긴다.
export async function fetchWeeklyTechNews(): Promise<DigestItem[]> {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const items: DigestItem[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      console.error(`${FEEDS[i].name} 수집 실패:`, result.reason);
    }
  });

  return items;
}