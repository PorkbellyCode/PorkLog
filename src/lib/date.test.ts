import { describe, expect, test } from "vitest";
import { formatKstDate, formatKstShortDateTime, fromKstDatetimeLocal, toKstDatetimeLocal } from "@/lib/date";
import { postInputSchema } from "@/lib/post-schema";

describe("formatKstDate", () => {
  test("UTC 로는 전날인 시각도 KST 날짜로 표시한다", () => {
    expect(formatKstDate(new Date("2026-10-17T16:00:00Z"))).toBe("2026. 10. 18.");
  });
  test("KST 자정 경계: 14:59:59Z 는 당일, 15:00:00Z 는 다음 날", () => {
    expect(formatKstDate(new Date("2026-10-18T14:59:59Z"))).toBe("2026. 10. 18.");
    expect(formatKstDate(new Date("2026-10-18T15:00:00Z"))).toBe("2026. 10. 19.");
  });
});

describe("formatKstShortDateTime", () => {
  test("KST 날짜와 시각을 보여 준다", () => {
    const text = formatKstShortDateTime(new Date("2026-10-19T00:00:00Z")); // 09:00 KST
    expect(text).toContain("10");
    expect(text).toContain("19");
    expect(text).toContain("09:00");
  });
});

describe("toKstDatetimeLocal / fromKstDatetimeLocal", () => {
  test("UTC 시각을 KST 벽시계 문자열로", () => {
    expect(toKstDatetimeLocal(new Date("2026-10-19T00:00:00Z"))).toBe("2026-10-19T09:00");
    expect(toKstDatetimeLocal(new Date("2026-10-17T16:00:00Z"))).toBe("2026-10-18T01:00");
  });

  test("KST 입력값은 +09:00 으로 해석한다", () => {
    expect(fromKstDatetimeLocal("2026-10-19T09:00").toISOString()).toBe("2026-10-19T00:00:00.000Z");
  });

  test("왕복해도 같은 값이다 (분 단위, 자정 경계 포함)", () => {
    for (const v of ["2026-10-19T09:00", "2026-10-19T00:00", "2026-10-18T23:59", "2026-01-01T00:00"]) {
      expect(toKstDatetimeLocal(fromKstDatetimeLocal(v))).toBe(v);
    }
  });

  test("빈 문자열은 Invalid Date 이고 스키마에서 publishedAt 오류가 된다", () => {
    const invalid = fromKstDatetimeLocal("");
    expect(Number.isNaN(invalid.getTime())).toBe(true);
    const result = postInputSchema.safeParse({
      title: "t",
      slug: "s",
      content: "c",
      category: "dev",
      thumbnail: null,
      series: null,
      tags: [],
      publishedAt: invalid,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toContain("publishedAt");
    }
  });
});
