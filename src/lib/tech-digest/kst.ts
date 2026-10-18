const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// KST 기준 "YYYY-MM-DD".
export function kstDateString(now: Date): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

// now 이후 처음 오는 월요일 09:00 KST. 월요일 09:00 정각 이후라면 다음 주 월요일이다.
export function nextMondayNineKst(now: Date): Date {
  const kst = new Date(now.getTime() + KST_OFFSET_MS); // UTC 필드가 KST 벽시계 시각이 되도록 민 값
  const daysAhead = (1 - kst.getUTCDay() + 7) % 7;
  let target = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() + daysAhead, 9, 0, 0);
  if (target <= kst.getTime()) target += 7 * DAY_MS;
  return new Date(target - KST_OFFSET_MS);
}
