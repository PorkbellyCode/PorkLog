import { describe, expect, test } from "vitest";
import { postInputSchema } from "@/lib/post-schema";
import {
  buildTitle,
  DIGEST_THUMBNAIL,
  composeDigest,
  filterOpenRouterModels,
  findBannedPhrases,
  MIN_LAST_WEEK_TOKENS,
  parseLlmOutput,
  renderNumbersSection,
} from "./compose";
import type { Candidate } from "./types";

const body = "Next.js 16.5 에서 turbopack 캐시가 디스크에 저장됩니다. 재시작 시간이 줄어듭니다.";
const item = (id: number) => ({ id, title: `항목 ${id}`, body, reason: "실무 영향" });
const llm = (items: unknown[], extra: Record<string, unknown> = {}) =>
  JSON.stringify({ subtitle: "Next.js 16.5와 TypeScript 7", highlights: ["하나", "둘", "셋"], items, repos: [], stack: [], ...extra });
// 이슈 섹션에 들어갈 수 있는 article 후보들
const articles = (...ids: number[]) => ids.map((id) => ({ id, kind: "article" as const }));

describe("parseLlmOutput", () => {
  test("후보에 없는 id 와 중복 id 는 버린다", () => {
    const out = parseLlmOutput(llm([item(1), item(99), item(1), item(2)]), articles(1, 2, 3));
    expect(out.items.map((i) => i.id)).toEqual([1, 2]);
    expect(out.droppedIds).toEqual([99, 1]);
  });

  test("항목은 최대 7개", () => {
    const out = parseLlmOutput(llm([1, 2, 3, 4, 5, 6, 7, 8, 9].map(item)), articles(1, 2, 3, 4, 5, 6, 7, 8, 9));
    expect(out.items).toHaveLength(7);
  });

  test("항목이 하나도 없어도 형식은 유효하다(건너뛸지는 호출 측 판단)", () => {
    expect(parseLlmOutput(llm([]), articles(1)).items).toEqual([]);
  });

  test("subtitle 이 마침표로 끝나거나 40자를 넘으면 실패", () => {
    expect(() => parseLlmOutput(llm([item(1)], { subtitle: "끝나는 문장." }), articles(1))).toThrow();
    expect(() => parseLlmOutput(llm([item(1)], { subtitle: "가".repeat(41) }), articles(1))).toThrow();
  });

  test("highlights 가 3개가 아니면 실패", () => {
    expect(() => parseLlmOutput(llm([item(1)], { highlights: ["하나"] }), articles(1))).toThrow();
  });

  test("섹션마다 맞는 종류의 후보만 남기고, 섹션을 넘나드는 중복도 버린다", () => {
    const candidates = [
      { id: 1, kind: "article" as const },
      { id: 2, kind: "repo" as const },
      { id: 3, kind: "stack" as const },
      { id: 4, kind: "community" as const },
    ];
    const out = parseLlmOutput(
      llm([item(1), item(2), item(4)], { repos: [item(2), item(1)], stack: [item(3)] }),
      candidates,
    );
    expect(out.items.map((i) => i.id)).toEqual([1, 4]);
    expect(out.repos.map((i) => i.id)).toEqual([2]);
    expect(out.stack?.id).toBe(3);
    expect(out.droppedIds).toEqual([2, 1]); // 이슈에 넣은 repo 2, 레포에 다시 넣은 1
  });

  test("스택이 비면 null, 레포는 최대 3개", () => {
    const repos = [11, 12, 13, 14].map((id) => ({ id, kind: "repo" as const }));
    const out = parseLlmOutput(llm([], { repos: [11, 12, 13, 14].map(item) }), repos);
    expect(out.stack).toBeNull();
    expect(out.repos).toHaveLength(3);
  });

  test("body 가 너무 짧으면 실패", () => {
    expect(() => parseLlmOutput(llm([{ ...item(1), body: "짧다" }]), articles(1))).toThrow();
  });
});

describe("findBannedPhrases", () => {
  const base = { subtitle: "Next.js 16.5", highlights: ["하나"], items: [item(1)], repos: [], stack: null };
  test("깨끗한 글은 빈 배열", () => {
    expect(findBannedPhrases(base)).toEqual([]);
  });
  test("금지 표현·감탄부호·이모지를 찾는다", () => {
    const found = findBannedPhrases({
      ...base,
      highlights: ["강력한 기능이 나왔습니다!", "이는 큰 변화를 보여줍니다", "🚀 출시"],
    });
    expect(found).toEqual(expect.arrayContaining(["강력한", "!", "이는 큰 변화를 보여줍니다", "🚀"]));
  });
  test("항목마다 반복되던 '내 작업에' 표현을 찾는다", () => {
    expect(findBannedPhrases({ ...base, items: [{ ...item(1), body: body + " 그래서 내 작업에는 영향이 큽니다." }] })).toEqual([
      "내 작업에",
    ]);
  });
  test("레포·스택 본문의 금지 표현도 찾는다", () => {
    const found = findBannedPhrases({
      ...base,
      repos: [{ ...item(2), body: "혁신적인 도구입니다. " + body }],
      stack: { ...item(3), title: "다양한 쓰임새" },
    });
    expect(found).toEqual(expect.arrayContaining(["혁신적", "다양한"]));
  });
  test("코드의 !== 는 감탄부호로 보지 않는다", () => {
    expect(findBannedPhrases({ ...base, items: [{ ...item(1), body: "a !== b 비교를 씁니다. " + body }] })).toEqual([]);
  });
});

describe("숫자 표", () => {
  const hf = [
    { id: "org/model-a", url: "https://huggingface.co/org/model-a", likes: 1200, downloads: 3400000, pipelineTag: null },
    { id: "x/uncensored-b", url: "https://huggingface.co/x/uncensored-b", likes: 9999, downloads: 1, pipelineTag: null },
  ];
  const or = [
    { modelSlug: "a/big", thisWeekTokens: 30e9, lastWeekTokens: 10e9, growthRatio: 2 },
    { modelSlug: "a/tiny", thisWeekTokens: 3e6, lastWeekTokens: 1e5, growthRatio: 29 },
  ];

  test("지난주 토큰이 기준 미만인 모델은 뺀다", () => {
    expect(filterOpenRouterModels(or).map((m) => m.modelSlug)).toEqual(["a/big"]);
    expect(MIN_LAST_WEEK_TOKENS).toBeGreaterThan(1e5);
  });

  test("키워드 제외 모델은 빠지고 표가 렌더링된다", () => {
    const md = renderNumbersSection(hf, or);
    expect(md).toContain("## 숫자로 보는 이번 주");
    expect(md).toContain("| 1 | [org/model-a](https://huggingface.co/org/model-a) | 1,200 | 3,400,000 |");
    expect(md).not.toContain("uncensored");
    expect(md).toContain("| a/big | 10,000,000,000 | 30,000,000,000 | +200% |");
    expect(md).not.toContain("a/tiny");
  });

  test("둘 다 비면 섹션을 만들지 않는다", () => {
    expect(renderNumbersSection([], [])).toBe("");
  });
});

describe("조립", () => {
  const candidates: Candidate[] = [
    { id: 1, kind: "release", source: "vercel/next.js 릴리스", title: "v16.5.0", link: "https://github.com/vercel/next.js/releases/tag/v16.5.0", body: "" },
    { id: 2, kind: "article", source: "Simon Willison", title: "글", link: "https://simonwillison.net/x", body: "" },
  ];
  const output = parseLlmOutput(llm([item(1), item(2)]), articles(1, 2));

  test("제목은 기존 형식 '이번 주 AI 테크뉴스 - 부제'", () => {
    expect(buildTitle("부제")).toBe("이번 주 AI 테크뉴스 - 부제");
  });

  test("본문 순서: 메모 → 하이라이트 → 항목(+원문 링크) → 숫자 표", () => {
    const { content } = composeDigest({
      output,
      candidates,
      hfModels: [],
      openRouterModels: [],
      failedSources: ["OpenRouter"],
      bannedLeft: ["강력한"],
    });
    expect(content.startsWith("<!-- 관리자 메모")).toBe(true);
    expect(content).toContain("수집 실패 소스: OpenRouter");
    expect(content).toContain("금지 표현 잔존(재시도 후에도): 강력한");
    expect(content.indexOf("- 하나")).toBeLessThan(content.indexOf("## 항목 1"));
    expect(content).toContain("원문: [vercel/next.js 릴리스](<https://github.com/vercel/next.js/releases/tag/v16.5.0>)");
    expect(content).toContain("원문: [Simon Willison](<https://simonwillison.net/x>)");
    expect(content).not.toContain("숫자로 보는 이번 주");
  });

  test("레포·스택 섹션은 이슈 뒤, 숫자 표 앞에 붙고 비면 만들지 않는다", () => {
    const all: Candidate[] = [
      ...candidates,
      { id: 3, kind: "repo", source: "GitHub 급상승 레포", title: "a/b", link: "https://github.com/a/b", body: "" },
      { id: 4, kind: "stack", source: "FastAPI", title: "FastAPI", link: "https://github.com/fastapi/fastapi", body: "" },
    ];
    const withExtras = parseLlmOutput(
      llm([item(1), item(2)], { repos: [item(3)], stack: [item(4)] }),
      all,
    );
    const hf = [{ id: "o/m", url: "https://huggingface.co/o/m", likes: 1, downloads: 1, pipelineTag: null }];
    const { content } = composeDigest({
      output: withExtras,
      candidates: all,
      hfModels: hf,
      openRouterModels: [],
      failedSources: [],
      bannedLeft: [],
    });
    const order = ["## 항목 2", "## 화제의 레포", "### 항목 3", "## 이번 주의 스택", "### 항목 4", "## 숫자로 보는 이번 주"];
    const positions = order.map((h) => content.indexOf(h));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(content).toContain("레포: [GitHub 급상승 레포](<https://github.com/a/b>)");
    expect(content).toContain("이슈 2개, 레포 1개, 스택 1개 선택");

    const plain = composeDigest({
      output,
      candidates,
      hfModels: [],
      openRouterModels: [],
      failedSources: [],
      bannedLeft: [],
    }).content;
    expect(plain).not.toContain("## 화제의 레포");
    expect(plain).not.toContain("## 이번 주의 스택");
  });

  test("메모에 주석을 깨는 문자가 있어도 주석은 한 덩어리로 끝난다", () => {
    const risky = parseLlmOutput(llm([{ ...item(1), reason: "a --> <script> b" }, item(2)]), articles(1, 2));
    const { content } = composeDigest({
      output: risky,
      candidates,
      hfModels: [],
      openRouterModels: [],
      failedSources: [],
      bannedLeft: [],
    });
    const memo = content.slice(0, content.indexOf("\n-->") + 4);
    expect(memo.match(/-->/g)).toHaveLength(1);
    expect(memo).not.toContain("<script>");
  });

  test("LLM 출력의 닫히지 않은 HTML 주석 시작은 제거된다", () => {
    const risky = parseLlmOutput(llm([{ ...item(1), body: body + " <!-- 열린 주석" }, item(2)]), articles(1, 2));
    const { content } = composeDigest({
      output: risky,
      candidates,
      hfModels: [],
      openRouterModels: [],
      failedSources: [],
      bannedLeft: [],
    });
    expect(content.match(/<!--/g)).toHaveLength(1); // 관리자 메모의 것뿐
  });
});

describe("DIGEST_THUMBNAIL", () => {
  test("썸네일 스키마 검증을 통과한다", () => {
    const result = postInputSchema.shape.thumbnail.safeParse(DIGEST_THUMBNAIL);
    expect(result.success).toBe(true);
  });
});
