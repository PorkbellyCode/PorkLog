import { z } from "zod";
import { SITE_URL } from "@/lib/site";
import { hasExcludedKeyword } from "./filters";
import type { Candidate, CandidateKind } from "./types";
import type { TrendingModel as HfModel } from "./fetch-huggingface";
import type { TrendingModel as OpenRouterModel } from "./fetch-openrouter";

export const MAX_ITEMS = 7;
export const MIN_ITEMS = 3;
export const MAX_REPOS = 3;
// 지난주 토큰이 이보다 적은 모델은 증가율이 큰 의미가 없어 표에서 뺀다.
export const MIN_LAST_WEEK_TOKENS = 5_000_000_000;
const TABLE_SIZE = 5;
// 큐레이션 글의 고정 썸네일. 썸네일 스키마가 절대 URL 만 허용해서 SITE_URL 을 붙인다.
export const DIGEST_THUMBNAIL = `${SITE_URL}/tech-news.webp`;

// ── LLM 출력 검증 ─────────────────────────────────────

const llmOutputSchema = z.object({
  subtitle: z
    .string()
    .trim()
    .min(2)
    .max(40, "subtitle 은 40자 이내여야 합니다.")
    .refine((v) => !/[.。]$/.test(v), "subtitle 은 마침표로 끝나면 안 됩니다."),
  highlights: z.array(z.string().trim().min(1).max(120)).length(3, "highlights 는 정확히 3개여야 합니다."),
  items: z.array(llmItemSchema(1500)),
  repos: z.array(llmItemSchema(1200)),
  stack: z.array(llmItemSchema(3000)), // 0개 또는 1개. 이슈와 관련된 스택이 없으면 비운다.
});

function llmItemSchema(maxBody: number) {
  return z.object({
    id: z.number().int(),
    title: z.string().trim().min(1).max(80),
    body: z.string().trim().min(40, "body 가 너무 짧습니다.").max(maxBody, "body 가 너무 깁니다."),
    reason: z.string().trim().max(200).default(""),
  });
}

export type LlmItem = z.infer<ReturnType<typeof llmItemSchema>>;
export type ParsedOutput = {
  subtitle: string;
  highlights: string[];
  items: LlmItem[]; // 이슈. 기사·릴리스·커뮤니티 후보 id 만, 최대 MAX_ITEMS
  repos: LlmItem[]; // 화제의 레포. repo 후보 id 만, 최대 MAX_REPOS
  stack: LlmItem | null; // 이번 주의 스택. stack 후보 id 만, 없으면 null
  droppedIds: number[]; // 후보에 없거나, 섹션 종류와 맞지 않거나, 중복이라 버린 id
};

const ISSUE_KINDS: CandidateKind[] = ["article", "release", "community"];

// JSON 문자열을 검증해 쓸 수 있는 항목만 남긴다. 형식이 틀리면 던진다.
export function parseLlmOutput(text: string, candidates: Pick<Candidate, "id" | "kind">[]): ParsedOutput {
  const raw = llmOutputSchema.parse(JSON.parse(text));
  const kindById = new Map(candidates.map((c) => [c.id, c.kind]));
  const seen = new Set<number>();
  const droppedIds: number[] = [];

  // 섹션마다 허용하는 후보 종류가 다르다. 섹션을 넘나드는 중복도 버린다.
  const keep = (list: LlmItem[], kinds: CandidateKind[]) =>
    list.filter((item) => {
      const kind = kindById.get(item.id);
      if (!kind || !kinds.includes(kind) || seen.has(item.id)) {
        droppedIds.push(item.id);
        return false;
      }
      seen.add(item.id);
      return true;
    });

  return {
    subtitle: raw.subtitle,
    highlights: raw.highlights,
    items: keep(raw.items, ISSUE_KINDS).slice(0, MAX_ITEMS),
    repos: keep(raw.repos, ["repo"]).slice(0, MAX_REPOS),
    stack: keep(raw.stack, ["stack"])[0] ?? null,
    droppedIds,
  };
}

// ── 금지 표현 ─────────────────────────────────────────

const BANNED: (string | RegExp)[] = [
  "내 작업에",
  "인상적",
  "흐름으로 읽힌다",
  "주목할 만",
  "중요해 보인",
  "라고 할 수 있",
  "의미가 있",
  /이는 .{0,40}보여(준다|줍니다)/,
  "한편",
  "이처럼",
  "기대된다",
  "기대됩니다",
  "눈여겨볼 만",
  "혁신적",
  "획기적",
  "강력한",
  "다양한",
  "폭넓은",
  "게임 체인저",
  "새로운 지평",
  "살펴본다",
  "살펴봅니다",
  "함께 알아보",
  /[!！](?![=\w(])/, // 감탄부호(코드의 !== 같은 것은 제외)
  /\p{Extended_Pictographic}/u,
];

// 결과 전체에서 금지 표현을 찾아 발견된 표현 목록을 돌려준다.
export function findBannedPhrases(
  output: Pick<ParsedOutput, "subtitle" | "highlights" | "items" | "repos" | "stack">,
): string[] {
  const text = [
    output.subtitle,
    ...output.highlights,
    ...[...output.items, ...output.repos, ...(output.stack ? [output.stack] : [])].flatMap((i) => [i.title, i.body]),
  ].join("\n");
  const found: string[] = [];
  for (const rule of BANNED) {
    const match = typeof rule === "string" ? (text.includes(rule) ? rule : null) : text.match(rule)?.[0];
    if (match) found.push(match);
  }
  return found;
}

// ── 숫자 표 ───────────────────────────────────────────

export function filterHfModels(models: HfModel[]): HfModel[] {
  return models.filter((m) => !hasExcludedKeyword(m.id));
}

export function filterOpenRouterModels(models: OpenRouterModel[]): OpenRouterModel[] {
  return models.filter((m) => m.lastWeekTokens >= MIN_LAST_WEEK_TOKENS && !hasExcludedKeyword(m.modelSlug));
}

const num = (n: number) => n.toLocaleString("en-US");

// 표가 비면 그 소제목은 만들지 않는다. 둘 다 비면 빈 문자열.
export function renderNumbersSection(hf: HfModel[], openRouter: OpenRouterModel[]): string {
  const hfRows = filterHfModels(hf).slice(0, TABLE_SIZE);
  const orRows = filterOpenRouterModels(openRouter).slice(0, TABLE_SIZE);
  const parts: string[] = [];

  if (hfRows.length > 0) {
    parts.push(
      [
        "### Hugging Face 인기 모델",
        "",
        "| 순위 | 모델 | 좋아요 | 다운로드 |",
        "| --- | --- | ---: | ---: |",
        ...hfRows.map((m, i) => `| ${i + 1} | [${m.id}](${m.url}) | ${num(m.likes)} | ${num(m.downloads)} |`),
      ].join("\n"),
    );
  }
  if (orRows.length > 0) {
    parts.push(
      [
        "### OpenRouter 토큰 사용량 증가율",
        "",
        "| 모델 | 지난주 토큰 | 이번 주 토큰 | 증가율 |",
        "| --- | ---: | ---: | ---: |",
        ...orRows.map(
          (m) =>
            `| ${m.modelSlug} | ${num(m.lastWeekTokens)} | ${num(m.thisWeekTokens)} | +${Math.round(m.growthRatio * 100)}% |`,
        ),
      ].join("\n"),
    );
  }
  return parts.length > 0 ? `## 숫자로 보는 이번 주\n\n${parts.join("\n\n")}` : "";
}

// ── 조립 ──────────────────────────────────────────────

export function buildTitle(subtitle: string): string {
  return `이번 주 AI 테크뉴스 - ${subtitle}`;
}

// 닫히지 않은 HTML 주석이 뒤 내용을 삼키지 않도록 LLM 출력에서 주석 시작을 지운다.
const stripCommentOpen = (text: string) => text.replace(/<!--/g, "");

// 관리자 메모. HTML 주석이라 렌더링에서는 사라지고 편집 화면에서만 보인다.
// 주석이 깨지거나 RSS 미리보기에 새지 않도록 < > 와 -- 를 없앤다.
function renderMemo(lines: string[]): string {
  const safe = lines.map((l) => l.replace(/[<>]/g, "").replace(/--+/g, "-").trim()).filter(Boolean);
  return `<!-- 관리자 메모\n${safe.join("\n")}\n-->`;
}

export function composeDigest(params: {
  output: ParsedOutput;
  candidates: Candidate[];
  hfModels: HfModel[];
  openRouterModels: OpenRouterModel[];
  failedSources: string[];
  bannedLeft: string[];
}): { title: string; content: string } {
  const { output, candidates } = params;
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const picked = [...output.items, ...output.repos, ...(output.stack ? [output.stack] : [])];

  const memo = renderMemo([
    ...picked.map((i) => `선택 [${byId.get(i.id)?.source}] ${i.title}: ${i.reason || "이유 없음"}`),
    `후보 ${candidates.length}개 중 이슈 ${output.items.length}개, 레포 ${output.repos.length}개, 스택 ${output.stack ? 1 : 0}개 선택, ${candidates.length - picked.length}개 제외`,
    output.droppedIds.length > 0 ? `버린 id(후보에 없음/종류 불일치/중복/관련 없는 스택): ${output.droppedIds.join(", ")}` : "",
    params.failedSources.length > 0 ? `수집 실패 소스: ${params.failedSources.join(", ")}` : "",
    params.bannedLeft.length > 0 ? `금지 표현 잔존(재시도 후에도): ${params.bannedLeft.join(", ")}` : "",
  ]);

  const renderItem = (item: LlmItem, heading: "##" | "###", linkLabel: string) => {
    const c = byId.get(item.id)!;
    return `${heading} ${stripCommentOpen(item.title)}\n\n${stripCommentOpen(item.body)}\n\n${linkLabel}: [${c.source}](<${c.link}>)`;
  };

  const issueSections = output.items.map((item) => renderItem(item, "##", "원문"));
  const repoSection =
    output.repos.length > 0
      ? ["## 화제의 레포", ...output.repos.map((item) => renderItem(item, "###", "레포"))].join("\n\n")
      : "";
  const stackSection = output.stack ? `## 이번 주의 스택\n\n${renderItem(output.stack, "###", "참고")}` : "";

  const content = [
    memo,
    output.highlights.map((h) => `- ${stripCommentOpen(h)}`).join("\n"),
    ...issueSections,
    repoSection,
    stackSection,
    renderNumbersSection(params.hfModels, params.openRouterModels),
  ]
    .filter(Boolean)
    .join("\n\n");

  return { title: buildTitle(output.subtitle), content };
}
