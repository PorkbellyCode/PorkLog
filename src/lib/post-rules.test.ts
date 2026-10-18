import { describe, expect, test } from "vitest";
import { resolvePublishedAt, resolveSeriesOrder } from "@/lib/post-rules";

const now = new Date("2026-01-01T00:00:00Z");
const past = new Date(now.getTime() - 60_000);
const future = new Date(now.getTime() + 60_000);
const future2 = new Date(now.getTime() + 120_000);

describe("resolvePublishedAt", () => {
  test("이미 발행된 글은 publishedAt을 미래로 바꿔도 무시된다", () => {
    expect(resolvePublishedAt(past, future, now)).toBe(past);
  });

  test("아직 발행 전(미래 publishedAt)인 글은 예약 시각을 다시 조정할 수 있다", () => {
    expect(resolvePublishedAt(future, future2, now)).toBe(future2);
  });

  test("발행 시각이 정확히 now와 같으면 이미 발행된 것으로 본다", () => {
    expect(resolvePublishedAt(new Date(now), future, now)).toEqual(now);
  });

  test("기존 글을 찾지 못하면 입력값을 쓴다", () => {
    expect(resolvePublishedAt(undefined, future, now)).toBe(future);
  });

  test("생략해 즉시 발행(입력이 현재 시각)인 발행 전 글은 입력값으로 바뀐다", () => {
    expect(resolvePublishedAt(future, now, now)).toBe(now);
  });
});

describe("resolveSeriesOrder", () => {
  test("시리즈가 그대로면 seriesOrder를 유지한다", () => {
    expect(resolveSeriesOrder({ series: "A", seriesOrder: 3 }, "A")).toBe(3);
  });

  test("시리즈를 변경하면 새 시리즈의 다음 번호 계산이 필요하다", () => {
    expect(resolveSeriesOrder({ series: "A", seriesOrder: 5 }, "B")).toBe("next");
  });

  test("시리즈 없던 글이 시리즈에 들어가면 다음 번호 계산이 필요하다 (첫 회차는 호출 측에서 1)", () => {
    expect(resolveSeriesOrder({ series: null, seriesOrder: null }, "A")).toBe("next");
  });

  test("시리즈를 제거하면 seriesOrder도 null이 된다", () => {
    expect(resolveSeriesOrder({ series: "A", seriesOrder: 2 }, null)).toBeNull();
  });

  test("시리즈 없는 글을 그대로 두면 null이다", () => {
    expect(resolveSeriesOrder({ series: null, seriesOrder: null }, null)).toBeNull();
  });

  test("기존 글이 없고 시리즈도 없으면 null, 있으면 다음 번호가 필요하다", () => {
    expect(resolveSeriesOrder(undefined, null)).toBeNull();
    expect(resolveSeriesOrder(undefined, "A")).toBe("next");
  });
});
