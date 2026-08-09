import { describe, expect, test } from "vitest";
import { MAX_TAGS, MAX_TAG_LENGTH, postInputSchema } from "@/lib/post-schema";

const valid = {
  title: "제목",
  slug: "hello-world",
  content: "본문",
  category: "dev",
  thumbnail: null,
  series: null,
  tags: ["a"],
};

describe("postInputSchema - slug", () => {
  test.each([
    ["hello-world", true],
    ["hello123", true],
    ["Hello-World", false], // 대문자 금지
    ["hello_world", false], // 언더스코어 금지
    ["-hello", false], // 앞 하이픈 금지
    ["hello-", false], // 뒤 하이픈 금지
    ["", false], // 빈 문자열 금지
  ])("slug=%s -> valid=%s", (slug, expected) => {
    const result = postInputSchema.safeParse({ ...valid, slug });
    expect(result.success).toBe(expected);
  });
});

describe("postInputSchema - tags", () => {
  test(`태그 ${MAX_TAGS}개는 통과`, () => {
    const result = postInputSchema.safeParse({
      ...valid,
      tags: Array.from({ length: MAX_TAGS }, (_, i) => `tag${i}`),
    });
    expect(result.success).toBe(true);
  });

  test(`태그 ${MAX_TAGS + 1}개는 실패`, () => {
    const result = postInputSchema.safeParse({
      ...valid,
      tags: Array.from({ length: MAX_TAGS + 1 }, (_, i) => `tag${i}`),
    });
    expect(result.success).toBe(false);
  });

  test(`태그 길이 ${MAX_TAG_LENGTH}자는 통과, 초과는 실패`, () => {
    const ok = postInputSchema.safeParse({ ...valid, tags: ["a".repeat(MAX_TAG_LENGTH)] });
    const fail = postInputSchema.safeParse({ ...valid, tags: ["a".repeat(MAX_TAG_LENGTH + 1)] });
    expect(ok.success).toBe(true);
    expect(fail.success).toBe(false);
  });

  test("태그는 소문자로 변환되고 중복 제거된다", () => {
    const result = postInputSchema.safeParse({ ...valid, tags: ["React", "react", "Vue"] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(["react", "vue"]);
    }
  });
});

describe("postInputSchema - thumbnail", () => {
  test("빈 문자열은 null로 변환된다", () => {
    const result = postInputSchema.safeParse({ ...valid, thumbnail: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.thumbnail).toBeNull();
    }
  });

  test("URL 형식이 아니면 실패한다", () => {
    const result = postInputSchema.safeParse({ ...valid, thumbnail: "not-a-url" });
    expect(result.success).toBe(false);
  });

  test("유효한 URL은 통과한다", () => {
    const result = postInputSchema.safeParse({
      ...valid,
      thumbnail: "https://example.com/a.png",
    });
    expect(result.success).toBe(true);
  });
});

describe("postInputSchema - category", () => {
  test("유효하지 않은 카테고리는 실패한다", () => {
    const result = postInputSchema.safeParse({ ...valid, category: "invalid" });
    expect(result.success).toBe(false);
  });
});

describe("postInputSchema - isPrivate / publishedAt", () => {
  test("생략하면 공개(false) + 현재 시각으로 기본값이 채워진다", () => {
    const before = Date.now();
    const result = postInputSchema.safeParse(valid);
    const after = Date.now();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPrivate).toBe(false);
      expect(result.data.publishedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.data.publishedAt.getTime()).toBeLessThanOrEqual(after);
    }
  });

  test("isPrivate=true, 미래 publishedAt 을 그대로 받는다", () => {
    const future = new Date(Date.now() + 60_000);
    const result = postInputSchema.safeParse({
      ...valid,
      isPrivate: true,
      publishedAt: future,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPrivate).toBe(true);
      expect(result.data.publishedAt.getTime()).toBe(future.getTime());
    }
  });
});
