// DB 와 무관한 글 저장 규칙. post-actions.ts 가 이 함수들로 판단하고, DB 접근만 담당한다.

// 이미 발행 시각이 지난(=한 번이라도 공개됐던) 글은 예약발행 대상이 아니므로
// 입력으로 넘어온 publishedAt 은 무시하고 기존 값을 유지한다.
// 발행 전이거나 기존 글을 찾지 못하면 입력값을 쓴다.
export function resolvePublishedAt(
  currentPublishedAt: Date | null | undefined,
  inputPublishedAt: Date,
  now: Date,
): Date {
  const alreadyPublished = !!currentPublishedAt && currentPublishedAt <= now;
  return alreadyPublished ? currentPublishedAt : inputPublishedAt;
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
