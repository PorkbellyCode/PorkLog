import { afterEach, describe, expect, test, vi } from "vitest";
import { buildHnUrl, communitySource, isLobstersOwnLink, toHnItems, toLobstersItems, type HnHit } from "./fetch-community";
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
