import { describe, expect, test } from "vitest";
import { isPubliclyVisible } from "@/lib/post-visibility";

const now = new Date("2026-01-01T00:00:00Z");
const past = new Date(now.getTime() - 60_000);
const future = new Date(now.getTime() + 60_000);

describe("isPubliclyVisible", () => {
  test("과거에 발행된 공개 글은 보인다", () => {
    expect(isPubliclyVisible({ isPrivate: false, publishedAt: past }, now)).toBe(true);
  });

  test("비공개 글은 보이지 않는다", () => {
    expect(isPubliclyVisible({ isPrivate: true, publishedAt: future }, now)).toBe(false);
  });

  test("예약(미래 발행) 글은 보이지 않는다", () => {
    expect(isPubliclyVisible({ isPrivate: false, publishedAt: future }, now)).toBe(false);
  });

  test("발행 시각이 정확히 now면 보인다", () => {
    expect(isPubliclyVisible({ isPrivate: false, publishedAt: new Date(now) }, now)).toBe(true);
  });

  test("비공개이면 과거 발행이어도 보이지 않는다", () => {
    expect(isPubliclyVisible({ isPrivate: true, publishedAt: past }, now)).toBe(false);
  });
});
