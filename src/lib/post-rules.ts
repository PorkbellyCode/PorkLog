import { isPubliclyVisible } from "@/lib/post-visibility";

// DB 와 무관한 글 저장 규칙. post-actions.ts 가 이 함수들로 판단하고, DB 접근만 담당한다.

// 지금 공개 상태인 글은 발행일을 고정하고(입력값 무시), 비공개·예약 글이나 기존 글을 찾지 못한 경우는 입력값을 쓴다.
// 공개했다가 비공개로 돌린 글도 발행일을 다시 바꿀 수 있다(의도된 동작).
export function resolvePublishedAt(
  current: { isPrivate: boolean; publishedAt: Date } | undefined,
  input: Date,
  now: Date,
): Date {
  return current && isPubliclyVisible(current, now) ? current.publishedAt : input;
}

// 시리즈가 그대로면 기존 회차를 유지하고, 시리즈를 제거하면 null,
// 바뀌었으면(새로 시리즈에 들어가는 경우 포함) 새 시리즈의 다음 번호가 필요하므로 "next" 를 돌려준다.
export function resolveSeriesOrder(
  current: { series: string | null; seriesOrder: number | null } | undefined,
  nextSeries: string | null,
): number | null | "next" {
  if (nextSeries === (current?.series ?? null)) return current?.seriesOrder ?? null;
  return nextSeries ? "next" : null;
}
