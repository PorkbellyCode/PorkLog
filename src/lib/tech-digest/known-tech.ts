// 독자(블로그 주인)가 아는 기술인지 판별한다. 모르는 기술을 다룬 이슈에는 LLM 이 배경 설명(note)을 붙여야 한다.
import { skillCategories } from "@/lib/stack";
import { mentionCount } from "./fetch-stack";
import type { CandidateKind } from "./types";

// Resume 에 적힌 이름과 글에서 흔히 쓰는 표기가 다른 기술.
const RESUME_ALIASES: Record<string, string[]> = {
  "Vue.js": ["Vue"],
  "Tailwind CSS": ["Tailwind"],
  PostgreSQL: ["Postgres"],
  "shadcn/ui": ["shadcn"],
};

// Resume 에는 없지만 설명 없이 읽히는 AI 서비스·용어.
const AI_NAMES = ["AI", "LLM", "OpenAI", "ChatGPT", "GPT", "Codex", "Claude", "Anthropic", "Gemini", "Copilot", "Cursor", "MCP"];

export const KNOWN_NAMES: string[] = [
  ...skillCategories.flatMap((c) =>
    c.groups.flatMap((g) => g.items.flatMap((i) => [i.name, ...(RESUME_ALIASES[i.name] ?? [])])),
  ),
  ...AI_NAMES,
];

// 이슈 후보 중 배경 설명이 필요한가. 제목만 본다(본문에는 지나가듯 나온 기술 이름이 많아 주제를 가리지 못한다).
// 릴리스 피드는 사용 중인 스택만 골라 두었고, 레포·스택 코너는 원래 무엇인지 소개하는 코너라 설명을 따로 붙이지 않는다.
export function needsNote(candidate: { kind: CandidateKind; title: string }): boolean {
  if (candidate.kind !== "article" && candidate.kind !== "community") return false;
  return !KNOWN_NAMES.some((name) => mentionCount(candidate.title, name) > 0);
}
