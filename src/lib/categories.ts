// 카테고리 목록의 단일출처(single source of truth)
// 추가/변경은 이 배열만 수정한다.
// (DB 컬럼은 text라서 별도 마이그레이션은 불필요. Zod가 입력을 검증)
export const CATEGORIES = ["개발일지", "일상", "공부"] as const;

// CATEGORIES 배열의 요소들로만 이루어진 타입
export type Category = (typeof CATEGORIES)[number];

export const DEFAULT_CATEGORY: Category = "일상";