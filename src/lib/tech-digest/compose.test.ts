import { describe, expect, test } from "vitest";
import {
  buildTitle,
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
  JSON.stringify({ subtitle: "Next.js 16.5와 TypeScript 7", highlights: ["하나", "둘", "셋"], items, ...extra });

describe("parseLlmOutput", () => {
  test("후보에 없는 id 와 중복 id 는 버린다", () => {
    const out = parseLlmOutput(llm([item(1), item(99), item(1), item(2)]), new Set([1, 2, 3]));
    expect(out.items.map((i) => i.id)).toEqual([1, 2]);
    expect(out.droppedIds).toEqual([99, 1]);
  });

  test("항목은 최대 7개", () => {
    const out = parseLlmOutput(llm([1, 2, 3, 4, 5, 6, 7, 8, 9].map(item)), new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
    expect(out.items).toHaveLength(7);
  });

  test("항목이 하나도 없어도 형식은 유효하다(건너뛸지는 호출 측 판단)", () => {
    expect(parseLlmOutput(llm([]), new Set([1])).items).toEqual([]);
  });

  test("subtitle 이 마침표로 끝나거나 40자를 넘으면 실패", () => {
    expect(() => parseLlmOutput(llm([item(1)], { subtitle: "끝나는 문장." }), new Set([1]))).toThrow();
    expect(() => parseLlmOutput(llm([item(1)], { subtitle: "가".repeat(41) }), new Set([1]))).toThrow();
  });

  test("highlights 가 3개가 아니면 실패", () => {
    expect(() => parseLlmOutput(llm([item(1)], { highlights: ["하나"] }), new Set([1]))).toThrow();
  });

  test("body 가 너무 짧으면 실패", () => {
    expect(() => parseLlmOutput(llm([{ ...item(1), body: "짧다" }]), new Set([1]))).toThrow();
  });
});

describe("findBannedPhrases", () => {
  const base = { subtitle: "Next.js 16.5", highlights: ["하나"], items: [item(1)] };
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
  const output = parseLlmOutput(llm([item(1), item(2)]), new Set([1, 2]));

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

  test("메모에 주석을 깨는 문자가 있어도 주석은 한 덩어리로 끝난다", () => {
    const risky = parseLlmOutput(llm([{ ...item(1), reason: "a --> <script> b" }, item(2)]), new Set([1, 2]));
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
    const risky = parseLlmOutput(llm([{ ...item(1), body: body + " <!-- 열린 주석" }, item(2)]), new Set([1, 2]));
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
