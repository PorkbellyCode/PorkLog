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

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key) as [
  CategoryKey,
  ...CategoryKey[],
];

export function isValidCategory(value: string): value is CategoryKey {
  return (CATEGORY_KEYS as readonly string[]).includes(value);
}

export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

// 카테고리별 기본 썸네일 경로.
// 실제 파일은 /public/category-defaults/<key>.webp 에 위치해야 한다.
// (사용자가 별도 썸네일을 올리지 않은 글의 카드에 표시됨)
export function defaultThumbnail(categoryKey: string): string {
  return `/category-defaults/${categoryKey}.webp`;
}