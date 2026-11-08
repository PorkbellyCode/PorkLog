import { describe, expect, test } from "vitest";
import { isRepoRootLink, parseGithubRepoLink, readmeToText, toRepoItem } from "./fetch-github";

describe("parseGithubRepoLink", () => {
  test.each([
    ["https://github.com/fastapi/fastapi", "fastapi/fastapi"],
    ["https://github.com/ghostty-org/ghostty/releases/tag/v1.4.0", "ghostty-org/ghostty"],
    ["https://github.com/a/b.git", "a/b"],
  ])("%s → %s", (link, expected) => {
    expect(parseGithubRepoLink(link)).toBe(expected);
  });

  test.each([
    "https://github.com/fastapi",
    "https://github.com/orgs/vercel/discussions",
    "https://github.blog/2026-11-01-post",
    "https://gist.github.com/a/b",
    "not a url",
  ])("레포 링크가 아니면 null: %s", (link) => {
    expect(parseGithubRepoLink(link)).toBeNull();
  });
});

describe("isRepoRootLink", () => {
  test("레포 메인 링크만 true", () => {
    expect(isRepoRootLink("https://github.com/govijr/terminal-mac")).toBe(true);
    expect(isRepoRootLink("https://github.com/govijr/terminal-mac/")).toBe(true);
  });
  test("이슈·PR·릴리스·파일 링크는 false", () => {
    expect(isRepoRootLink("https://github.com/anthropics/claude-code/issues/12345")).toBe(false);
    expect(isRepoRootLink("https://github.com/vercel/next.js/pull/1")).toBe(false);
    expect(isRepoRootLink("https://github.com/ghostty-org/ghostty/releases/tag/v1.4.0")).toBe(false);
    expect(isRepoRootLink("https://github.com/a/b/blob/main/README.md")).toBe(false);
    expect(isRepoRootLink("https://example.com/a/b")).toBe(false);
  });
});

describe("readmeToText", () => {
  test("배지·이미지·코드 블록·HTML 을 걷어내고 링크는 글자만 남긴다", () => {
    const md = [
      "# Tool",
      "[![CI](https://img.shields.io/ci.svg)](https://ci) ![logo](logo.png)",
      "<p align=center>Fast <b>JSON</b> parser</p>",
      "See [the docs](https://docs.example.com) for **details**.",
      "```bash\nnpm install tool\n```",
    ].join("\n");
    expect(readmeToText(md)).toBe("Tool Fast JSON parser See the docs for details .");
  });
});

describe("toRepoItem", () => {
  const repo = {
    full_name: "a/b",
    html_url: "https://github.com/a/b",
    description: "A fast vector database",
    stargazers_count: 1234,
    language: "Rust",
    fork: false,
    archived: false,
    created_at: "2026-11-01T00:00:00Z",
  };

  test("제목에 스타·언어·메모를, 본문에 설명과 README 를 담는다", () => {
    const item = toRepoItem(repo, "커뮤니티 화제 레포", "README 내용", "커뮤니티에서 화제");
    expect(item).toMatchObject({
      kind: "repo",
      source: "커뮤니티 화제 레포",
      title: "a/b (⭐1234, Rust, 커뮤니티에서 화제)",
      link: "https://github.com/a/b",
      body: "A fast vector database\n\nREADME 내용",
    });
  });

  test("README 가 없으면 설명만, 본문은 1500자로 자른다", () => {
    expect(toRepoItem(repo, "s", "").body).toBe("A fast vector database");
    expect(toRepoItem(repo, "s", "x".repeat(3000)).body.length).toBe(1500);
  });
});
