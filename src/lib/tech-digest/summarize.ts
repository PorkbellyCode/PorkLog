import { fetchWithTimeout } from "./http";
import { findBannedPhrases, parseLlmOutput, type ParsedOutput } from "./compose";
import type { Candidate } from "./types";

// 쓰기 모델. 이름이 틀리면 dry-run 에서 OpenAI 가 거부하며 바로 드러난다.
const OPENAI_MODEL = "gpt-5.4";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_TIMEOUT_MS = 100_000;
// 함수 한도(maxDuration 300초) 안에서 재시도까지 끝내려면, 파이프라인 시작 후 이 시간이 지나면 재시도하지 않는다.
const RETRY_DEADLINE_MS = 150_000;

export type SummaryResult = ParsedOutput & {
  bannedLeft: string[]; // 재시도 후에도 남은 금지 표현
};

function formatCandidates(candidates: Candidate[]): string {
  return candidates
    .map((c) => `[id ${c.id}] (${c.kind}, 출처: ${c.source}) ${c.title}\n링크: ${c.link}\n본문: ${c.body || "(본문 없음)"}`)
    .join("\n\n");
}

export function buildPrompt(candidates: Candidate[]): string {
  return `너는 한국어 개발자 블로그의 주간 "개발 뉴스" 코너 에디터다. 독자는 웹/AI 서비스를 만드는 실무 개발자다.
아래 후보 중 이번 주에 독자가 직접 써 보거나 알아야 할 것만 골라 소개하라.

[선택 기준]
- 우선: 새 릴리스와 마이그레이션 영향, 코드가 있는 기법, 실측 결과·포스트모템, 한국에서 바로 써 볼 수 있는 것.
- 제외: 고객 사례, 홍보, 투자, 정책, 행사, 일반 의견, API·가격 정보가 없는 모델 출시 소식, 제품 철학 에세이.
- 쓸 거리가 부족하면 적게 골라라. 억지로 채우지 마라. 최대 7개.

[문체]
- 평가어 대신 사실만 쓴다. "좋다", "강력하다" 대신 무엇이 어떻게 달라졌는지 쓴다.
- 합쇼체("~합니다")로 통일한다. 문장은 짧게, 문단은 3문장 이하로 쓴다.
- 모든 문단에 버전, 수치, 고유명사, 명령어 중 하나 이상을 넣는다.
- 인사말과 마무리 문장을 쓰지 않는다.
- 후보 본문에 없는 수치나 주장을 쓰지 않는다. 원문 문단을 옮기지 않는다. 직접 인용은 한 문장 이내로 한다.
- 인물 블로그 출처는 필자의 주장이므로 "~라고 소개합니다"처럼 출처를 밝히는 어조로 쓴다.
- 다음 표현은 쓰지 않는다: 인상적, 흐름으로 읽힌다, 주목할 만하다, 중요해 보인다, ~라고 할 수 있다, 의미가 있다, 이는 ~를 보여준다, 한편, 이처럼, 앞으로가 기대된다, 눈여겨볼 만하다, 혁신적, 획기적, 강력한, 다양한, 폭넓은, 게임 체인저, 새로운 지평, 살펴본다, 함께 알아보자. 이모지와 감탄부호도 쓰지 않는다.

[항목 구성]
- 항목은 두 종류다. 릴리스·변경은 무엇이 바뀌었는지와 영향·마이그레이션 방법을 쓴다. 글·분석은 핵심 주장과 그 근거를 쓴다.
- 고정된 소제목 칸을 만들지 않는다. 명령어나 코드는 후보 본문에 있을 때만 "바로 해 볼 것"으로 넣는다.
- title: 고유명사 + 버전 + 변화. "~ 소식", "~ 발표"는 쓰지 않는다.
- body: 마크다운. 링크는 쓰지 마라(원문 링크는 코드가 붙인다).
- reason: 이 항목을 고른 이유 한 줄(관리자용 메모).

[출력]
- subtitle: 이번 주 핵심을 담은 명사형 구. 고유명사 2개 이내, 40자 이내, 마침표 없음, 추상 표현 금지.
- highlights: 이번 주 핵심 3줄. 각 줄은 한 문장이다.
- items: 고른 항목. id 는 후보의 id 를 그대로 쓴다.

[후보]
${formatCandidates(candidates)}`;
}

async function callOpenAI(prompt: string): Promise<{ text: string; truncated: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetchWithTimeout(
    OPENAI_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 16000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "digest_post",
            strict: true,
            schema: {
              type: "object",
              properties: {
                subtitle: { type: "string" },
                highlights: { type: "array", items: { type: "string" } },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      title: { type: "string" },
                      body: { type: "string" },
                      reason: { type: "string" },
                    },
                    required: ["id", "title", "body", "reason"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["subtitle", "highlights", "items"],
              additionalProperties: false,
            },
          },
        },
      }),
    },
    OPENAI_TIMEOUT_MS,
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API 요청 실패: HTTP ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("OpenAI 응답에서 텍스트를 찾을 수 없습니다.");
  }
  const truncated = data?.choices?.[0]?.finish_reason === "length";
  if (truncated) {
    console.warn("OpenAI 출력이 max_completion_tokens 한도로 잘렸습니다(finish_reason=length).");
  }
  return { text, truncated };
}

// LLM 을 부르고, 형식 오류나 금지 표현이 있으면 그 내용을 알려 주며 1회만 다시 부른다.
// startedAt: 파이프라인 시작 시각. 이미 오래 걸렸으면 재시도하지 않는다.
// 재시도가 실패(타임아웃·5xx·형식 오류)해도 1차 결과가 있으면 그것을 돌려준다.
export async function summarizeCandidates(candidates: Candidate[], startedAt: number = Date.now()): Promise<SummaryResult> {
  const prompt = buildPrompt(candidates);
  const ids = new Set(candidates.map((c) => c.id));

  let best: SummaryResult | undefined;
  let feedback = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt === 1 && Date.now() - startedAt > RETRY_DEADLINE_MS) {
      console.warn("경과 시간이 길어 재시도를 건너뜁니다.");
      break;
    }

    let response: { text: string; truncated: boolean };
    try {
      response = await callOpenAI(prompt + feedback);
    } catch (err) {
      if (attempt === 1 && best) {
        console.error("재시도 호출 실패, 1차 결과를 사용합니다:", err);
        break;
      }
      throw err;
    }

    let parsed: ParsedOutput;
    try {
      parsed = parseLlmOutput(response.text, ids);
    } catch (err) {
      if (attempt === 1) {
        if (best) break;
        throw err;
      }
      const reason = response.truncated
        ? "출력이 길이 제한으로 잘려 JSON 이 완성되지 않았다. 항목 수와 본문을 줄여서"
        : `형식 검증에 실패했다: ${err instanceof Error ? err.message : String(err)}`;
      console.warn(`재시도 사유: ${reason}`);
      feedback = `\n\n[수정 요청] 직전 출력이 ${reason}\n규칙에 맞게 다시 작성하라.`;
      continue;
    }

    const bannedLeft = findBannedPhrases(parsed);
    best = { ...parsed, bannedLeft };
    if (bannedLeft.length === 0) break;
    console.warn(`재시도 사유: 금지 표현 ${bannedLeft.join(", ")}`);
    feedback = `\n\n[수정 요청] 직전 출력에서 금지 표현이 발견됐다: ${bannedLeft.join(", ")}\n이 표현을 쓰지 않고 같은 내용으로 다시 작성하라.`;
  }

  if (!best) throw new Error("요약 결과를 만들지 못했습니다.");
  return best;
}
