import { describe, expect, test } from "vitest";
import {
  excludeSeenLinks,
  extractLinks,
  isCandidateRepo,
  isStableMinorRelease,
  matchesCategoryAllowList,
  normalizeLink,
  isSecurityRelease,
  pickLatestStableRelease,
} from "./filters";
import type { DigestItem } from "./types";

const release = (title: string, daysAgo: number): DigestItem => ({
  kind: "release",
  source: "r",
  title,
  link: `https://github.com/x/y/releases/tag/${encodeURIComponent(title)}`,
  body: "",
  pubDate: new Date(Date.UTC(2026, 9, 18) - daysAgo * 86_400_000),
  categories: [],
});

describe("isStableMinorRelease", () => {
  test.each([
    ["v16.5.0", true],
    ["19.3.0 (September 9, 2026)", true],
    ["TypeScript 6.0", true], // 패치 번호가 없으면 x.y.0 으로 본다
    ["2026-10-14, Version 26.12.0 (Current), @richardlau", true],
    ["v2.2.0", true],
    ["v16.5.0-canary.17", false],
    ["TypeScript 6.0 Beta", false],
    ["TypeScript 6.0.1 RC", false],
    ["v16.5.0-rc.1", false],
    ["v16.5.0-next.3", false],
    ["v2.1.302", false], // 패치
    ["19.3.1 (October 14th, 2026)", false], // 패치
    ["vscode-typescript/v1.0.0", false], // 하위 패키지
    ["react-devtools@8.0.0: React DevTools 7.0.1 -> 8.0.0", false],
    ["no version here", false],
  ])("%s -> %s", (title, expected) => {
    expect(isStableMinorRelease(title)).toBe(expected);
  });
});

describe("pickLatestStableRelease", () => {
  test("저장소당 조건에 맞는 가장 최근 1개만 고른다", () => {
    const picked = pickLatestStableRelease([
      release("v16.5.0-canary.17", 0),
      release("v16.4.2", 1),
      release("v16.4.0", 3),
      release("v16.3.0", 5),
    ]);
    expect(picked?.title).toBe("v16.4.0");
  });

  test("조건에 맞는 릴리스가 없으면 undefined", () => {
    expect(pickLatestStableRelease([release("v1.0.1", 1), release("v1.1.0-rc.1", 2)])).toBeUndefined();
  });
});

describe("보안 패치 릴리스", () => {
  test("패치 버전이라도 제목이나 본문에 security/CVE 가 있으면 통과", () => {
    expect(isSecurityRelease("v24.22.1 (LTS)", "This is a security release fixing CVE-2026-1234")).toBe(true);
    expect(isSecurityRelease("Security Release v19.3.1", "")).toBe(true);
    expect(isSecurityRelease("v2.1.302", "bug fixes")).toBe(false);
  });
  test("프리릴리스는 보안 언급이 있어도 제외", () => {
    expect(isSecurityRelease("v16.5.0-canary.3", "security fix")).toBe(false);
  });
  test("보안 패치가 가장 최근이면 그것이 선택되고, 저장소당 1개 규칙은 유지된다", () => {
    const sec = { ...release("v16.4.3", 0), body: "Security: fixes CVE-2026-9999" };
    const picked = pickLatestStableRelease([sec, release("v16.4.2", 1), release("v16.4.0", 3)]);
    expect(picked?.title).toBe("v16.4.3");
  });
});

describe("matchesCategoryAllowList (OpenAI 고객 사례 제외)", () => {
  const allow = ["Release", "Product", "Engineering"];
  test("허용 카테고리를 가진 항목만 통과", () => {
    expect(matchesCategoryAllowList(["Product"], allow)).toBe(true);
    expect(matchesCategoryAllowList(["Startup"], allow)).toBe(false);
  });
  test("카테고리가 비어 있는 항목(고객 사례)은 제외", () => {
    expect(matchesCategoryAllowList([], allow)).toBe(false);
  });
  test("허용 목록이 없으면 모두 통과", () => {
    expect(matchesCategoryAllowList([], undefined)).toBe(true);
  });
});

describe("isCandidateRepo", () => {
  const base = { fullName: "a/b", description: "A fast vector database written in Rust" };
  test("정상 레포는 통과", () => {
    expect(isCandidateRepo(base)).toBe(true);
  });
  test("포크·아카이브·설명 없음 제외", () => {
    expect(isCandidateRepo({ ...base, fork: true })).toBe(false);
    expect(isCandidateRepo({ ...base, archived: true })).toBe(false);
    expect(isCandidateRepo({ ...base, description: "" })).toBe(false);
  });
  test("제외 키워드 제외", () => {
    expect(isCandidateRepo({ ...base, description: "uncensored chat model with no limits" })).toBe(false);
    expect(isCandidateRepo({ ...base, fullName: "a/nsfw-gen" })).toBe(false);
    expect(isCandidateRepo({ ...base, description: "Game emulator ported to the browser" })).toBe(false);
  });
});

describe("지난 글 링크 제외", () => {
  test("normalizeLink 는 해시·utm·끝 슬래시를 정리한다", () => {
    expect(normalizeLink("https://Example.com/a/?utm_source=x&id=1#top")).toBe("https://example.com/a?id=1");
  });

  test("extractLinks 는 마크다운 링크와 일반 URL 을 뽑는다", () => {
    const md = "원문: [Next](https://nextjs.org/blog/x/) 그리고 https://github.com/a/b 입니다.";
    expect(extractLinks(md)).toEqual(["https://nextjs.org/blog/x", "https://github.com/a/b"]);
  });

  test("이미 나온 링크의 후보는 제외한다", () => {
    const items = [{ link: "https://nextjs.org/blog/x?utm_medium=y" }, { link: "https://new.example/post" }];
    expect(excludeSeenLinks(items, ["https://nextjs.org/blog/x"])).toEqual([items[1]]);
  });
});
