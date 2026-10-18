import { XMLParser } from "fast-xml-parser";
import { describe, expect, test } from "vitest";
import { parseAtom, parseRss } from "./fetch-feeds";

const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: "__cdata", processEntities: true, htmlEntities: true });
const feed = { name: "테스트", url: "", kind: "article" as const, limit: 2 };

describe("parseRss", () => {
  test("카테고리·content:encoded 를 읽고 본문은 평문으로 만든다", () => {
    const xml = `<rss><channel>
      <item><title><![CDATA[Title A]]></title><link>https://x.test/a</link>
      <category><![CDATA[Product]]></category>
      <description>짧은 설명</description>
      <content:encoded><![CDATA[<p>긴 <b>본문</b> &amp; 내용</p>]]></content:encoded>
      <pubDate>Fri, 16 Oct 2026 19:00:00 GMT</pubDate></item>
      <item><title>Title B</title><link>https://x.test/b</link><category>Startup</category><category>AI</category>
      <description>설명 B</description><pubDate>Fri, 16 Oct 2026 18:00:00 GMT</pubDate></item>
    </channel></rss>`;
    const items = parseRss(parser.parse(xml), feed);
    expect(items[0]).toMatchObject({ title: "Title A", link: "https://x.test/a", body: "긴 본문 & 내용", categories: ["Product"] });
    expect(items[1].categories).toEqual(["Startup", "AI"]);
    expect(items[1].body).toBe("설명 B");
  });
});

describe("parseAtom", () => {
  test("릴리스 Atom 의 이스케이프된 HTML 본문을 평문으로 만든다", () => {
    const xml = `<feed><entry>
      <link rel="alternate" type="text/html" href="https://github.com/a/b/releases/tag/v1.2.0"/>
      <title>v1.2.0</title>
      <content type="html">&lt;h3&gt;Core&lt;/h3&gt;&lt;ul&gt;&lt;li&gt;Fix cache&lt;/li&gt;&lt;/ul&gt;</content>
      <updated>2026-10-17T23:46:40Z</updated></entry></feed>`;
    const [item] = parseAtom(parser.parse(xml), { ...feed, kind: "release" });
    expect(item).toMatchObject({ kind: "release", title: "v1.2.0", link: "https://github.com/a/b/releases/tag/v1.2.0", body: "Core Fix cache" });
  });
});
