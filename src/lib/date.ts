// 날짜 표시·입력은 서버/브라우저의 시간대와 무관하게 KST(Asia/Seoul)로 고정한다.
const TIME_ZONE = "Asia/Seoul";
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// 예: "2026. 10. 19."
export function formatKstDate(d: Date): string {
  return d.toLocaleDateString("ko-KR", { timeZone: TIME_ZONE });
}

// 예약 배지용 짧은 날짜+시각. 예: "10. 19. 오전 09:00"
export function formatKstShortDateTime(d: Date): string {
  return d.toLocaleString("ko-KR", {
    timeZone: TIME_ZONE,
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// <input type="datetime-local"> 값("YYYY-MM-DDTHH:mm")으로. KST 벽시계 시각이며 실행 환경의 TZ 와 무관하다.
export function toKstDatetimeLocal(d: Date): string {
  return new Date(d.getTime() + KST_OFFSET_MS).toISOString().slice(0, 16);
}

// datetime-local 값을 KST 로 해석해 Date 로. 빈 문자열이면 Invalid Date 가 되고,
// postInputSchema(z.coerce.date)에서 publishedAt 필드 오류로 걸러진다.
export function fromKstDatetimeLocal(value: string): Date {
  return new Date(`${value}:00+09:00`);
}
