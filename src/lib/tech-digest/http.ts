export const USER_AGENT = "Mozilla/5.0 (compatible; PorkLogBot/1.0)";

// 모든 외부 호출에 쓰는 타임아웃 fetch. 한 곳이 멈춰도 Cron 전체가 매달리지 않게 한다.
export function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 10_000): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}
