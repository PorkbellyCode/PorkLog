// 카테고리 단일 출처(single source of truth).
// key: DB 저장값 + URL 파라미터값 (영문)
// label: 화면 표시용 (한글)
// 추가/변경은 이 배열만 수정한다.
export const CATEGORIES = [
  { key: "dev", label: "개발" },
  { key: "daily", label: "일상" },
  { key: "workout", label: "운동" },
  { key: "food", label: "밥" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

// Zod enum 등에서 쓰기 위한 key 문자열 배열
export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key) as [
  CategoryKey,
  ...CategoryKey[],
];

// 주어진 문자열이 유효한 카테고리 key 인지 검사 (URL 파라미터 검증용)
export function isValidCategory(value: string): value is CategoryKey {
  return (CATEGORY_KEYS as readonly string[]).includes(value);
}

// key -> label 변환 (화면 표시용). 알 수 없는 key 는 그대로 반환.
export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}