import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { projects, sideProjects } from "@/lib/projects";

const PUBLIC_DIR = path.resolve(__dirname, "../../public");

type WithImages = { name: string; images: { src: string; alt: string }[] };

// 이미지 경로가 public/ 아래 실제 파일이고 alt가 비어 있지 않은지 검사한다. 위반 항목을 문자열로 반환.
function findImageProblems(list: WithImages[]): string[] {
  const problems: string[] = [];
  for (const project of list) {
    for (const { src, alt } of project.images) {
      if (!src.startsWith("/")) {
        problems.push(`${project.name}: src는 "/"로 시작해야 한다 (${src})`);
      } else if (!existsSync(path.join(PUBLIC_DIR, src))) {
        problems.push(`${project.name}: public${src} 파일이 없다`);
      }
      if (alt.trim() === "") {
        problems.push(`${project.name}: ${src}의 alt가 비어 있다`);
      }
    }
  }
  return problems;
}

describe("findImageProblems (검증 로직 자체)", () => {
  test("존재하지 않는 경로와 빈 alt를 잡아낸다", () => {
    const problems = findImageProblems([
      {
        name: "fake",
        images: [
          { src: "/portfolio/does-not-exist.png", alt: "ok" },
          { src: "/portfolio/crdd/landing.png", alt: "  " },
        ],
      },
    ]);
    expect(problems).toHaveLength(2);
  });
});

describe("projects 이미지", () => {
  test("projects의 이미지 파일이 존재하고 alt가 있다", () => {
    expect(findImageProblems(projects)).toEqual([]);
  });

  test("sideProjects의 이미지 파일이 존재하고 alt가 있다", () => {
    expect(findImageProblems(sideProjects)).toEqual([]);
  });
});
