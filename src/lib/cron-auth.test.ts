import { describe, expect, test } from "vitest";
import { isAuthorizedCron } from "@/lib/cron-auth";

describe("isAuthorizedCron", () => {
  test("secret 과 일치하는 Bearer 토큰은 허용", () => {
    expect(isAuthorizedCron("Bearer abc", "abc")).toBe(true);
  });
  test("토큰이 다르거나 헤더가 없으면 거부", () => {
    expect(isAuthorizedCron("Bearer xyz", "abc")).toBe(false);
    expect(isAuthorizedCron(null, "abc")).toBe(false);
  });
  test("secret 이 비어 있으면 어떤 헤더도 거부", () => {
    expect(isAuthorizedCron("Bearer undefined", undefined)).toBe(false);
    expect(isAuthorizedCron("Bearer ", "")).toBe(false);
  });
});
