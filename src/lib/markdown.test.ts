import { describe, expect, test } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown - sanitize", () => {
  test("javascript: 링크는 href 가 제거된다", async () => {
    const html = await renderMarkdown("[x](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
  });

  test("javascript: 이미지는 src 가 제거된다", async () => {
    const html = await renderMarkdown("![a](javascript:1)");
    expect(html).not.toContain("javascript:");
  });

  test("원시 HTML script 는 출력되지 않는다", async () => {
    const html = await renderMarkdown("<script>alert(1)</script>\n\n<!-- 메모 -->\n\n본문");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("메모");
    expect(html).toContain("본문");
  });

  test("일반 링크와 이미지는 유지된다", async () => {
    const html = await renderMarkdown("[링크](https://example.com/a)\n\n![alt](https://example.com/a.png)");
    expect(html).toContain('href="https://example.com/a"');
    expect(html).toContain('src="https://example.com/a.png"');
  });

  test("코드 블록은 언어별로 하이라이트된다", async () => {
    const html = await renderMarkdown("```ts\nconst a = 1;\n```");
    expect(html).toContain("data-language=\"ts\"");
    expect(html).toContain("<span");
  });

  test("h2/h3 에 목차용 id 가 붙는다", async () => {
    const html = await renderMarkdown("## 첫 번째\n\n### Second Part");
    expect(html).toContain('<h2 id="첫-번째">');
    expect(html).toContain('<h3 id="second-part">');
  });

  test("각주 링크와 대상 id, 되돌아가기 링크가 서로 맞는다", async () => {
    const html = await renderMarkdown("본문[^1]\n\n[^1]: 각주 내용");
    const ref = html.match(/href="#([^"]*fn-1)"/)?.[1];
    expect(ref).toBeDefined();
    expect(html).toContain(`id="${ref}"`);
    const back = html.match(/href="#([^"]*fnref-1)"/)?.[1];
    expect(back).toBeDefined();
    expect(html).toContain(`id="${back}"`);
    expect(html).not.toContain("user-content-user-content");
  });
});
