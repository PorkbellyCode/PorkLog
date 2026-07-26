import { fetchWeeklyTechNews } from "./src/lib/tech-digest/fetch-feeds.ts";
// 실행: GEMINI_API_KEY=발급받은키 npx tsx test-tech-digest.mjs

const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildPrompt(items) {
  const itemsText = items
    .map((item, i) => `${i + 1}. [출처: ${item.source}] ${item.title}\n요약 정보: ${item.description}\n원문 링크: ${item.link}`)
    .join("\n\n");
  return `너는 개발자 블로그의 "이번 주 개발자 뉴스" 코너를 작성하는 에디터다.
아래는 지난 1주일간 여러 개발자 커뮤니티/기술 매체에서 수집된 글 목록이다.
이 정보를 바탕으로, 개발자가 읽었을 때 흥미롭거나 실무에 도움이 될 만한 항목들을 골라 한국어 블로그 포스트를 작성하라.

[규칙]
- 개발/기술과 직접 관련 없는 항목(순수 사회 이슈, 일반 시사 등)은 과감히 제외해도 된다.
- 원문을 그대로 베끼지 말고 반드시 너 자신의 표현으로 다시 써라(paraphrase).
- 각 기사당 인용은 최대 1회, 15단어 미만으로만 허용한다.
- 각 항목 끝에는 반드시 원문 링크를 마크다운 링크 형식으로 포함하라.
- dev.to 같은 개인 블로그 플랫폼 글은 검증된 사실처럼 단정하지 말고 출처 기반 어조로 서술하라.
- 전체 글은 짧은 인사말로 시작해서, 항목별 섹션(## 제목)으로 구성하고, 마지막에 간단한 마무리 문장으로 끝내라.
- 제목은 그 주의 핵심 흐름을 담은 자연스러운 한국어 제목으로 작성하라.

[글 목록]
${itemsText}`;
}

const items = await fetchWeeklyTechNews();
console.log(`수집된 아이템: ${items.length}건`);

const res = await fetch(GEMINI_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
  body: JSON.stringify({
    contents: [{ role: "user", parts: [{ text: buildPrompt(items) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: { title: { type: "string" }, content: { type: "string" } },
        required: ["title", "content"],
      },
    },
  }),
});

if (!res.ok) {
  console.error("실패:", res.status, await res.text());
} else {
  const data = await res.json();
  const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
  const fixedContent = parsed.content.replace(/\\n/g, "\n");
  console.log("\n=== 제목 ===\n", parsed.title);
  console.log("\n=== 본문(개행 보정 후) ===\n", fixedContent);
}