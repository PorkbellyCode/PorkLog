import { afterEach, describe, expect, test, vi } from "vitest";
import {
  buildHnUrl,
  communitySource,
  geekNewsDayUrls,
  isLobstersOwnLink,
  parseGeekNewsPage,
  toGeekNewsItems,
  toHnItems,
  toLobstersItems,
  type GeekNewsTopic,
  type HnHit,
} from "./fetch-community";
import { enrichShortBodies, hasEnoughCommunityBody, isHtmlContentType, parseRss, parser } from "./fetch-feeds";

const hit = (over: Partial<HnHit>): HnHit => ({
  objectID: "1",
  title: "Title",
  url: "https://www.example.com/post",
  points: 200,
  num_comments: 10,
  created_at: "2026-10-20T00:00:00.000Z",
  ...over,
});

describe("communitySource", () => {
  test("www 를 제거한 호스트명을 쓴다", () => {
    expect(communitySource("https://www.example.com/a", "Hacker News")).toBe("example.com");
  });
  test("커뮤니티 자체 링크면 커뮤니티 이름을 쓴다", () => {
    expect(communitySource("https://news.ycombinator.com/item?id=1", "Hacker News")).toBe("Hacker News");
    expect(communitySource("https://lobste.rs/s/abc", "Lobsters")).toBe("Lobsters");
  });
  test("URL 파싱에 실패하면 커뮤니티 이름을 쓴다", () => {
    expect(communitySource("not a url", "Lobsters")).toBe("Lobsters");
  });
});

describe("toHnItems", () => {
  test("점수 내림차순으로 정렬하고 limit 개만 남긴다", () => {
    const items = toHnItems(
      [hit({ objectID: "1", title: "A", points: 200 }), hit({ objectID: "2", title: "B", points: 900 }), hit({ objectID: "3", title: "C", points: 500 })],
      2,
    );
    expect(items.map((i) => i.title)).toEqual(["B (HN 900점, 댓글 10)", "C (HN 500점, 댓글 10)"]);
  });
  test("제외 키워드가 있는 제목은 뺀다", () => {
    const items = toHnItems([hit({ title: "Uncensored model", points: 999 }), hit({ title: "Ok", points: 300 })]);
    expect(items).toHaveLength(1);
    expect(items[0].title).toContain("Ok");
  });
  test("url 이 있으면 원문 링크와 호스트명 source 를 쓴다", () => {
    const [item] = toHnItems([hit({})]);
    expect(item).toMatchObject({ kind: "community", link: "https://www.example.com/post", source: "example.com", body: "", categories: [] });
    expect(item.pubDate).toEqual(new Date("2026-10-20T00:00:00.000Z"));
  });
  test("url 이 없는 글(Ask/Tell HN)은 제외한다", () => {
    const items = toHnItems([hit({ objectID: "42", url: null, points: 999 }), hit({ title: "Ok" })]);
    expect(items).toHaveLength(1);
    expect(items[0].title).toContain("Ok");
  });
});

describe("buildHnUrl", () => {
  test("numericFilters 의 > 를 인코딩하고 7일 전 시각을 쓴다", () => {
    const url = buildHnUrl(1_000_000_000);
    expect(url).toContain("numericFilters=created_at_i%3E");
    expect(url).not.toContain(">");
    const filters = new URL(url).searchParams.get("numericFilters");
    expect(filters).toBe(`created_at_i>${1_000_000_000 - 7 * 86_400},points>150`);
  });
});

describe("isLobstersOwnLink", () => {
  test("lobste.rs 링크만 자체 글로 본다", () => {
    expect(isLobstersOwnLink("https://lobste.rs/s/abc/title")).toBe(true);
    expect(isLobstersOwnLink("https://blog.test/a")).toBe(false);
    expect(isLobstersOwnLink("not a url")).toBe(false);
  });
});

describe("enrichShortBodies (community)", () => {
  afterEach(() => vi.unstubAllGlobals());
  const item = { kind: "community" as const, source: "x", title: "t", link: "https://x.test/a", body: "", pubDate: new Date(), categories: [] };
  const stub = (contentType: string) =>
    vi.stubGlobal("fetch", async () => new Response("<article>" + "본문 ".repeat(100) + "</article>", { headers: { "content-type": contentType } }));

  test("커뮤니티 항목의 본문을 보충한다", async () => {
    stub("text/html; charset=utf-8");
    const [out] = await enrichShortBodies([item]);
    expect(out.body.length).toBeGreaterThan(200);
  });
  test("content-type 이 text/html 이 아니면 건너뛴다", async () => {
    stub("application/pdf");
    const [out] = await enrichShortBodies([item]);
    expect(out.body).toBe("");
  });
});

describe("toLobstersItems", () => {
  const xml = `<rss><channel>
    <item><title>First</title><link>https://www.blog.test/a</link><description>설명 A</description><pubDate>Fri, 16 Oct 2026 19:00:00 GMT</pubDate></item>
    <item><title>Second</title><link>https://lobste.rs/s/xyz/second</link><description>설명 B</description><pubDate>Sat, 17 Oct 2026 19:00:00 GMT</pubDate></item>
    <item><title>Third</title><link>https://c.test/c</link><description>설명 C</description><pubDate>Sun, 18 Oct 2026 19:00:00 GMT</pubDate></item>
  </channel></rss>`;
  const feed = { name: "Lobsters", url: "", kind: "community" as const, limit: 5 };

  test("RSS 순서를 유지하고 순위·출처를 붙인다", () => {
    const items = toLobstersItems(parseRss(parser.parse(xml), feed));
    expect(items.map((i) => i.title)).toEqual(["First (Lobsters 주간 1위)", "Second (Lobsters 주간 2위)", "Third (Lobsters 주간 3위)"]);
    expect(items.map((i) => i.source)).toEqual(["blog.test", "Lobsters", "c.test"]);
    expect(items[0].kind).toBe("community");
  });
  test("limit 개만 남긴다", () => {
    expect(toLobstersItems(parseRss(parser.parse(xml), feed), 2)).toHaveLength(2);
  });
  test("제외 키워드 글을 거른 뒤 순위를 다시 매긴다", () => {
    const withBad = xml.replace("<title>First</title>", "<title>Uncensored thing</title>");
    const items = toLobstersItems(parseRss(parser.parse(withBad), feed));
    expect(items.map((i) => i.title)).toEqual(["Second (Lobsters 주간 1위)", "Third (Lobsters 주간 2위)"]);
  });
});

describe("본문 보충 판정", () => {
  test("text/html 만 보충 대상으로 본다", () => {
    expect(isHtmlContentType("text/html; charset=utf-8")).toBe(true);
    expect(isHtmlContentType("application/pdf")).toBe(false);
    expect(isHtmlContentType(null)).toBe(false);
  });
  test("커뮤니티 항목은 본문 200자 이상이어야 한다", () => {
    expect(hasEnoughCommunityBody({ body: "a".repeat(199) })).toBe(false);
    expect(hasEnoughCommunityBody({ body: "a".repeat(200) })).toBe(true);
  });
});

// news.hada.io/past?day= 페이지의 실제 행 구조(2026-11 기준)를 줄인 것.
const gnRow = (id: number, title: string, points: number, comments: number) =>
  `<div class='topic_row' data-topic-state-id='${id}' data-topic-voteable='1'><div class=votenum>1</div>` +
  `<div class=topictitle><span id='dead${id}'></span><a href='topic?id=${id}' rel='nofollow' class='topic-title-link'>` +
  `<h2 class='topic-title-heading'>${title}</h2></a> <span class=topicurl>(example.com)</span></div>` +
  `<div class='topicdesc'><a href='topic?id=${id}' class='c99 breakall'>요약 &amp; 설명 ...</a></div>` +
  `<div class='topicinfo'><span id='tp${id}'>${points}</span> points by <a href='/@u'>u</a> ` +
  `<time class="js-relative-time" datetime="2026-11-06T08:50:07+09:00" data-date="2026-11-06">2일전</time>` +
  `<span id='unvote${id}'></span> | <a href='topic?id=${id}&go=comments' class=u data-topic-comment-topic-id='${id}' data-topic-comment-count='${comments}'>댓글 ${comments}개</a></div></div>`;

describe("parseGeekNewsPage", () => {
  test("행마다 id·제목·요약·점수·댓글 수·작성 시각을 읽는다", () => {
    const html = `<div class="topics">${gnRow(36657, "Discord, Electron을 버리고 Rust로", 13, 11)}${gnRow(36680, "Show GN: 하네스 &amp; eBook", 18, 2)}</div>`;
    const topics = parseGeekNewsPage(html);
    expect(topics).toHaveLength(2);
    expect(topics[0]).toEqual({
      id: "36657",
      title: "Discord, Electron을 버리고 Rust로",
      desc: "요약 & 설명",
      points: 13,
      comments: 11,
      publishedAt: new Date("2026-11-06T08:50:07+09:00"),
    });
    expect(topics[1].title).toBe("Show GN: 하네스 & eBook");
  });

  test("구조가 바뀌어 필요한 값이 없으면 빈 배열", () => {
    expect(parseGeekNewsPage("<div class='topic_row'><h3>다른 구조</h3></div>")).toEqual([]);
  });
});

describe("toGeekNewsItems", () => {
  const topic = (id: string, points: number, title = `글 ${id}`): GeekNewsTopic => ({
    id,
    title,
    desc: "요약",
    points,
    comments: 1,
    publishedAt: new Date("2026-11-06T00:00:00Z"),
  });

  test("같은 글은 한 번만, 점수 내림차순으로 limit 개", () => {
    const items = toGeekNewsItems([topic("1", 5), topic("2", 20), topic("1", 5), topic("3", 9)], 2);
    expect(items.map((i) => i.link)).toEqual(["https://news.hada.io/topic?id=2", "https://news.hada.io/topic?id=3"]);
    expect(items[0]).toMatchObject({ kind: "community", source: "GeekNews", title: "글 2 (GeekNews 20점, 댓글 1)" });
  });

  test("제외 키워드가 있는 제목은 뺀다", () => {
    expect(toGeekNewsItems([topic("1", 50, "uncensored 모델 공개")])).toEqual([]);
  });
});

describe("geekNewsDayUrls", () => {
  test("KST 기준 어제부터 7일 치 날짜 페이지", () => {
    // 2026-11-08 01:00 KST (토요일 16:00 UTC 크론)
    const urls = geekNewsDayUrls(new Date("2026-11-07T16:00:00Z"));
    expect(urls).toHaveLength(7);
    expect(urls[0]).toBe("https://news.hada.io/past?day=2026-11-07");
    expect(urls[6]).toBe("https://news.hada.io/past?day=2026-11-01");
  });
});
