import { describe, expect, test } from "vitest";
import { needsNote } from "./known-tech";

describe("needsNote", () => {
  test.each([
    ["GPT‑6.2 Astra and Sol (HN 1347점, 댓글 864)", false], // AI 서비스
    ["Claude Code 팀이 검증을 바라보는 방식 (GeekNews 41점, 댓글 1)", false],
    ["Postgres 19 is out: try it on Neon", false], // 별칭(PostgreSQL → Postgres)
    ["Vue 3.6 베이퍼 모드 정리", false], // 별칭(Vue.js → Vue)
    ["GitHub Actions 모니터링의 빈칸", false],
    ["Inkling 2 Mini (HN 1453점, 댓글 292)", true],
    ["Unauthenticated remote code execution in Nginx", true],
    ["Rust가 개발자로서의 나를 바꾼 방식", true], // 본문에 JavaScript 가 나와도 제목만 본다
    ["Reactive programming in Rust", true], // React 가 다른 단어의 일부
  ])("%s -> %s", (title, expected) => {
    expect(needsNote({ kind: "community", title })).toBe(expected);
  });

  test("릴리스·레포·스택은 설명을 요구하지 않는다", () => {
    expect(needsNote({ kind: "release", title: "v1.4.0" })).toBe(false);
    expect(needsNote({ kind: "repo", title: "ghostty-org/ghostty" })).toBe(false);
    expect(needsNote({ kind: "stack", title: "Kafka" })).toBe(false);
  });
});
