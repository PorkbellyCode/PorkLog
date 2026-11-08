import { describe, expect, test } from "vitest";
import { buildStackBody, findMentionedStacks, pickHnStories } from "./fetch-stack";

const item = (title: string, body = "") => ({ title, body });

describe("findMentionedStacks", () => {
  test("한글 조사가 붙어도 찾고, 다른 영단어의 일부는 무시한다", () => {
    const found = findMentionedStacks(
      [item("Discord, Electron을 버리고 Rust로"), item("Reactive streams 와 Vitest 소개", "Postgresql 은 소문자라 무시")],
      [],
    );
    expect(found.map((s) => s.name)).toEqual(["Electron"]);
  });

  test("언급이 많은 순으로 최대 3개", () => {
    const found = findMentionedStacks(
      [
        item("FastAPI 성능", "FastAPI 와 Redis 를 같이 씁니다. FastAPI 는 Pydantic 기반입니다."),
        item("Redis 장애 회고", "Redis Redis"),
        item("Kafka 도입기", "Kafka 파티션"),
        item("SQLite 를 서버 DB 로"),
      ],
      [],
    );
    expect(found.map((s) => s.name)).toEqual(["Redis", "FastAPI", "Kafka"]);
  });

  test("별칭으로도 찾는다(Postgres → PostgreSQL)", () => {
    expect(findMentionedStacks([item("Postgres 17 의 새 인덱스")], []).map((s) => s.name)).toEqual(["PostgreSQL"]);
  });

  test("지난 글에서 소개한 스택은 뺀다", () => {
    expect(findMentionedStacks([item("FastAPI 성능")], ["https://github.com/fastapi/fastapi"])).toEqual([]);
  });
});

describe("buildStackBody", () => {
  test("기본 정보·설명·HN 화제 글·README 순으로 담는다", () => {
    const body = buildStackBody({
      repo: {
        description: "FastAPI framework, high performance",
        stargazers_count: 91234,
        language: "Python",
        created_at: "2018-12-08T08:21:47Z",
        license: { spdx_id: "MIT" },
      },
      readme: "FastAPI is a modern web framework",
      hnStories: [{ title: "FastAPI – Modern Python web framework", points: 512, year: 2019 }],
    });
    expect(body).toBe(
      [
        "기본 정보: GitHub 스타 91,234개, 2018년 GitHub 저장소 생성, 주 언어 Python, 라이선스 MIT",
        "설명: FastAPI framework, high performance",
        "Hacker News 역대 화제 글:",
        '- 2019년 "FastAPI – Modern Python web framework" (HN 512점)',
        "README 앞부분: FastAPI is a modern web framework",
      ].join("\n"),
    );
  });

  test("없는 정보는 줄째로 빼고 2500자로 자른다", () => {
    const body = buildStackBody({
      repo: { description: null, stargazers_count: 10, language: null, created_at: "2020-01-01T00:00:00Z", license: null },
      readme: "x".repeat(5000),
      hnStories: [],
    });
    expect(body.startsWith("기본 정보: GitHub 스타 10개, 2020년 GitHub 저장소 생성\nREADME 앞부분: ")).toBe(true);
    expect(body.length).toBe(2500);
  });
});

describe("pickHnStories", () => {
  test("이름이 단어로 들어간 글만 최대 3개 남긴다", () => {
    const hit = (title: string) => ({ title, points: 500, created_at: "2017-05-01T00:00:00Z" });
    const stories = pickHnStories(
      [hit("Ask HN: How to self-learn electronics?"), hit("Electron is flash for the desktop"), hit("Email is your electronic memory")],
      { aliases: ["Electron"] },
    );
    expect(stories).toEqual([{ title: "Electron is flash for the desktop", points: 500, year: 2017 }]);
  });
});
