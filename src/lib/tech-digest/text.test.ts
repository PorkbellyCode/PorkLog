import { describe, expect, test } from "vitest";
import { extractArticleText, htmlToText, truncate } from "./text";

describe("htmlToText", () => {
  test("태그와 script/style 을 제거하고 엔티티를 풀어 준다", () => {
    expect(htmlToText("<style>a{}</style><p>A &amp; B</p><script>x()</script><b>C</b>")).toBe("A & B C");
  });
});

describe("truncate", () => {
  test("한도를 넘으면 자른다", () => {
    expect(truncate("a".repeat(2000)).length).toBe(1500);
    expect(truncate("abc")).toBe("abc");
  });
});

describe("extractArticleText", () => {
  const nav = "<nav>메뉴 메뉴</nav>";
  test("article 이 있으면 그 안만 쓴다", () => {
    const html = `<html><body>${nav}<article><h1>제목</h1><p>본문입니다</p></article><footer>푸터</footer></body></html>`;
    expect(extractArticleText(html)).toBe("제목 본문입니다");
  });
  test("article 이 없으면 main, 그다음 body", () => {
    expect(extractArticleText(`<body>${nav}<main><p>메인 본문</p></main></body>`)).toBe("메인 본문");
    expect(extractArticleText(`<body><p>그냥 본문</p></body>`)).toBe("그냥 본문");
  });
  test("본문 영역이 없으면 빈 문자열", () => {
    expect(extractArticleText("<div>x</div>")).toBe("");
  });
});
