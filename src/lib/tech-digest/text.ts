import { BODY_LIMIT } from "./types";

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

// HTML 조각을 평문으로. script/style 은 내용까지 지운다.
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => ENTITIES[m])
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, limit = BODY_LIMIT): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  // 이모지 등 서로게이트 쌍 중간에서 잘리면 짝 없는 서로게이트가 남아 OpenAI 가 요청 JSON 을 거부한다(400 invalid_json).
  return /[\uD800-\uDBFF]$/.test(cut) ? cut.slice(0, -1) : cut;
}

// 페이지 HTML 에서 본문 영역을 article → main → body 순으로 찾아 평문으로 만든다.
export function extractArticleText(html: string): string {
  for (const tag of ["article", "main", "body"]) {
    const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*)<\\/${tag}>`, "i"));
    if (match) {
      const text = htmlToText(match[1]);
      if (text) return truncate(text);
    }
  }
  return "";
}
