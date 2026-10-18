import { describe, expect, test } from "vitest";
import { kstDateString, monthWeekLabel, nextMondayNineKst } from "./kst";

// KST 시각을 Date 로 만든다.
const kst = (iso: string) => new Date(`${iso}+09:00`);

describe("nextMondayNineKst", () => {
  test("Cron 이 도는 일요일 01:00 KST 에는 다음 날 월요일 09:00", () => {
    expect(nextMondayNineKst(kst("2026-10-18T01:00:00")).toISOString()).toBe(kst("2026-10-19T09:00:00").toISOString());
  });
  test("월요일 08:59 는 같은 날 09:00", () => {
    expect(nextMondayNineKst(kst("2026-10-19T08:59:00")).toISOString()).toBe(kst("2026-10-19T09:00:00").toISOString());
  });
  test("월요일 09:00 정각과 09:01 은 다음 주 월요일", () => {
    const expected = kst("2026-10-26T09:00:00").toISOString();
    expect(nextMondayNineKst(kst("2026-10-19T09:00:00")).toISOString()).toBe(expected);
    expect(nextMondayNineKst(kst("2026-10-19T09:01:00")).toISOString()).toBe(expected);
  });
  test("화요일 이후는 다음 주 월요일, 월말을 넘겨도 맞다", () => {
    expect(nextMondayNineKst(kst("2026-10-28T12:00:00")).toISOString()).toBe(kst("2026-11-02T09:00:00").toISOString());
  });
  test("UTC 날짜와 KST 날짜가 다른 시각(일요일 23:30 KST)도 처리", () => {
    expect(nextMondayNineKst(kst("2026-10-18T23:30:00")).toISOString()).toBe(kst("2026-10-19T09:00:00").toISOString());
  });
});

describe("monthWeekLabel", () => {
  test("월요일 발행일 기준 'M월 W주차'", () => {
    expect(monthWeekLabel(kst("2026-10-19T09:00:00"))).toBe("10월 4주차"); // 목요일 22일
    expect(monthWeekLabel(kst("2026-10-05T09:00:00"))).toBe("10월 2주차"); // 목요일 8일
  });
  test("목요일이 속한 달을 따른다 (월요일이 전월이어도)", () => {
    expect(monthWeekLabel(kst("2026-09-28T09:00:00"))).toBe("10월 1주차"); // 목요일 10월 1일
    expect(monthWeekLabel(kst("2026-11-02T09:00:00"))).toBe("11월 1주차"); // 목요일 11월 5일
  });
});

describe("kstDateString", () => {
  test("UTC 로는 전날이어도 KST 날짜를 쓴다", () => {
    expect(kstDateString(new Date("2026-10-17T16:00:00Z"))).toBe("2026-10-18");
  });
});
