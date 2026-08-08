import type { DigestItem } from "./fetch-feeds";

const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type DigestPost = {
  subtitle: string;
  content: string; // 마크다운 본문
};

function buildPrompt(items: DigestItem[]): string {
  const itemsText = items
    .map(
      (item, i) =>
        `${i + 1}. [출처: ${item.source}] ${item.title}\n요약 정보: ${item.description}\n원문 링크: ${item.link}`,
    )
    .join("\n\n");

  return `너는 개발자 블로그의 "이번 주 개발자 뉴스" 코너를 작성하는 에디터다.
아래는 지난 1주일간 여러 개발자 커뮤니티/기술 매체에서 수집된 글 목록이다.
이 정보를 바탕으로, 개발자가 읽었을 때 흥미롭거나 실무에 도움이 될 만한 항목들을 골라 한국어 블로그 포스트를 작성하라.

[규칙]
- 개발/기술과 직접 관련 없는 항목(순수 사회 이슈, 일반 시사 등)은 과감히 제외해도 된다.
- 원문을 그대로 베끼지 말고 반드시 너 자신의 표현으로 다시 써라(paraphrase).
- 각 기사당 인용은 최대 1회, 15단어 미만으로만 허용한다. 인용이 꼭 필요하지 않다면 생략해도 된다.
- 각 항목 끝에는 반드시 원문 링크를 마크다운 링크 형식으로 포함하라.
- dev.to 같은 개인 블로그 플랫폼 글은 필자 개인의 주장/경험일 수 있으므로, 검증된 사실처럼 단정하지 말고 "~라고 소개한다", "~라는 접근을 제안한다"처럼 출처 기반 어조로 서술하라.
- 비슷한 주제끼리 묶어서 소개해도 좋고, 순서대로 나열해도 좋다.
- 전체 글은 짧은 인사말로 시작해서, 항목별 섹션(## 제목)으로 구성하고, 마지막에 간단한 마무리 문장으로 끝내라.
- subtitle 은 게시글 제목의 "- " 뒤에 붙는 부제다. 그 주의 핵심 흐름을 담아 10단어 이내 짧은 한국어 구(句)로만 작성하라 (예: "AI 에이전트 보안과 실효성 높은 개발 도구"). 완전한 문장이나 마침표는 쓰지 마라.

[글 목록]
${itemsText}`;
}

export async function summarizeWeeklyTechNews(items: DigestItem[]): Promise<DigestPost> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildPrompt(items) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            subtitle: { type: "string" },
            content: { type: "string" },
          },
          required: ["subtitle", "content"],
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API 요청 실패: HTTP ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini 응답에서 텍스트를 찾을 수 없습니다.");
  }

  const parsed = JSON.parse(text) as DigestPost;

  // Gemini가 JSON 문자열 안에서 실제 개행/따옴표를 이중 이스케이프해서
  // 내보내는 경우가 있어(\n, \" 가 문자 그대로 남음), 후처리로 보정한다.
  const clean = (s: string) => s.replace(/\\n/g, "\n").replace(/\\"/g, '"');

  return {
    subtitle: clean(parsed.subtitle),
    content: clean(parsed.content),
  };
}