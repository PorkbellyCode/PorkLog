import type { DigestItem } from "./fetch-feeds";
import type { GithubTrending } from "./fetch-github";
import type { TrendingModel as HfTrendingModel } from "./fetch-huggingface";
import type { TrendingModel as OpenRouterTrendingModel } from "./fetch-openrouter";

const OPENAI_MODEL = "gpt-5.4-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export type DigestInput = {
  items: DigestItem[];
  github: GithubTrending;
  hfModels: HfTrendingModel[];
  openRouterModels: OpenRouterTrendingModel[];
};

export type DigestPost = {
  subtitle: string;
  content: string; // 마크다운 본문
};

function formatItems(items: DigestItem[]): string {
  return items
    .map(
      (item, i) =>
        `${i + 1}. [출처: ${item.source}] ${item.title}\n요약 정보: ${item.description}\n원문 링크: ${item.link}`,
    )
    .join("\n\n");
}

function formatGithub(github: GithubTrending): string {
  const repoLines = github.repos
    .map((r) => `${r.rank}. ${r.fullName} (⭐${r.stars}, ${r.language ?? "언어 미상"}) - ${r.description}\n링크: ${r.url}`)
    .join("\n");

  const devLines = github.developers
    .map((d) => {
      const repos = d.topRepos.map((r) => `  - ${r.name} (⭐${r.stars}): ${r.description}`).join("\n");
      return `${d.username} (${d.profileUrl})\n소개: ${d.bio ?? "소개 없음"}\n대표 레포:\n${repos}`;
    })
    .join("\n\n");

  return `[급상승 레포 랭킹 (최근 7일 내 생성, 스타 많은 순)]\n${repoLines}\n\n[주목할 개발자 후보 (급상승 레포 소유자 상위 3명)]\n${devLines}`;
}

function formatHf(models: HfTrendingModel[]): string {
  return models
    .map((m, i) => `${i + 1}. ${m.id} (좋아요 ${m.likes}, 다운로드 ${m.downloads}, 분야: ${m.pipelineTag ?? "미상"})\n링크: ${m.url}`)
    .join("\n");
}

function formatOpenRouter(models: OpenRouterTrendingModel[]): string {
  return models
    .map(
      (m, i) =>
        `${i + 1}. ${m.modelSlug} — 이번 주 토큰 사용량 전주 대비 ${(m.growthRatio * 100).toFixed(0)}% 증가 (지난주 ${m.lastWeekTokens.toLocaleString()} → 이번주 ${m.thisWeekTokens.toLocaleString()})`,
    )
    .join("\n");
}

function buildPrompt(input: DigestInput): string {
  return `너는 AI 테크 블로그의 "이번 주 AI 테크뉴스" 코너를 작성하는 에디터다.
아래는 지난 1주일간 여러 AI 랩 공식 블로그, AI/개발도구 분야 인물 블로그, 그리고 GitHub·Hugging Face·OpenRouter의 최신 동향 데이터다.
이 정보를 바탕으로 AI에 관심 있는 개발자가 읽었을 때 흥미롭거나 실무에 도움이 될 만한 내용을 골라 한국어 블로그 포스트를 작성하라.

[전체 규칙]
- AI/개발도구와 직접 관련 없는 항목은 과감히 제외해도 된다.
- 원문을 그대로 베끼지 말고 반드시 너 자신의 표현으로 다시 써라(paraphrase).
- 각 기사당 인용은 최대 1회, 15단어 미만으로만 허용한다. 인용이 꼭 필요하지 않다면 생략해도 된다.
- 인물 블로그·뉴스레터 출처는 필자 개인의 주장/경험일 수 있으므로, 검증된 사실처럼 단정하지 말고 "~라고 소개한다", "~라는 접근을 제안한다"처럼 출처 기반 어조로 서술하라.
- 전체 글은 짧은 인사말로 시작해서, 항목별 섹션(## 제목)으로 구성하고, 마지막에 간단한 마무리 문장으로 끝내라.
- subtitle 은 게시글 제목의 "- " 뒤에 붙는 부제다. 그 주의 핵심 흐름을 담아 10단어 이내 짧은 한국어 구(句)로만 작성하라 (예: "AI 에이전트 보안과 실효성 높은 개발 도구"). 완전한 문장이나 마침표는 쓰지 마라.

[뉴스/블로그 섹션 작성 지침]
- 아래 [뉴스·블로그 글 목록]에서 골라 소개. 각 항목 끝에는 반드시 원문 링크를 마크다운 링크 형식으로 포함하라.
- 비슷한 주제끼리 묶어서 소개해도 좋다.

[GitHub 섹션 작성 지침]
- [GitHub 급상승 레포 랭킹]을 순위·레포명·스타 수가 보이는 목록(또는 표)으로 먼저 보여주고, 그중 상위 5개는 어떤 프로젝트인지 설명하는 문단을 덧붙여라.
- [주목할 개발자 후보]에서 상위 3명을 소개하며, 그 사람의 대표 레포들을 근거로 "요즘 어떤 작업을 하고 있는지"를 설명하라. 이건 GitHub 공식 트렌딩 개발자 기능이 아니라 급상승 레포 소유자를 근사한 것이라는 점은 본문에 드러낼 필요 없다(내부 로직일 뿐).

[Hugging Face 섹션 작성 지침]
- [Hugging Face 인기 모델]을 순위 목록으로 보여주고, 눈에 띄는 모델 한두 개는 간단히 설명하라.

[OpenRouter 섹션 작성 지침]
- [OpenRouter 급상승 모델]을 "전주 대비 사용량 증가율" 기준 목록으로 보여줘라. 벤치마크 성능 수치는 이 섹션에서 다루지 않는다(제공되는 데이터가 없다).

[뉴스·블로그 글 목록]
${formatItems(input.items)}

[GitHub 급상승 레포 랭킹 / 주목할 개발자 후보]
${formatGithub(input.github)}

[Hugging Face 인기 모델]
${formatHf(input.hfModels)}

[OpenRouter 급상승 모델]
${formatOpenRouter(input.openRouterModels)}`;
}

export async function summarizeWeeklyTechNews(input: DigestInput): Promise<DigestPost> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: buildPrompt(input) }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "digest_post",
          strict: true,
          schema: {
            type: "object",
            properties: {
              subtitle: { type: "string" },
              content: { type: "string" },
            },
            required: ["subtitle", "content"],
            additionalProperties: false,
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API 요청 실패: HTTP ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("OpenAI 응답에서 텍스트를 찾을 수 없습니다.");
  }

  return JSON.parse(text) as DigestPost;
}
