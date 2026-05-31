// 마크다운 본문에서 카드 미리보기용 plaintext 를 추출한다.
// "정확한" 마크다운 파싱이 아니라 카드 표시용 휴리스틱이다.
// 코드 블록, 헤딩 마커, 강조, 링크, 이미지 같은 흔한 마크다운 표기를 제거하고
// 첫 maxLength 글자만 잘라낸다.
export function extractPreview(markdown: string, maxLength = 80): string {
  let text = markdown;

  // 코드 블록 (``` ... ```) 통째로 제거 — 카드 미리보기에 코드 조각이 보이는 건 어색하다.
  text = text.replace(/```[\s\S]*?```/g, " ");
  // 인라인 코드 백틱만 제거
  text = text.replace(/`([^`]*)`/g, "$1");
  // 이미지 ![alt](url) 전체 제거
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  // 링크 [text](url) → text
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  // 헤딩 마커 (#, ##, ...)
  text = text.replace(/^#{1,6}\s+/gm, "");
  // 인용 마커 (>)
  text = text.replace(/^>\s+/gm, "");
  // 목록 마커 (-, *, +)
  text = text.replace(/^[\s]*[-*+]\s+/gm, "");
  // 강조 (**bold**, *italic*, __bold__, _italic_)
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");
  // HTML 태그 제거 (raw HTML 가능성)
  text = text.replace(/<[^>]+>/g, " ");
  // 연속 공백/줄바꿈을 한 칸 공백으로
  text = text.replace(/\s+/g, " ").trim();

  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}