// Vercel Cron 요청 인증. secret 이 비어 있으면 "Bearer undefined" 같은 값이 통과하지 않도록 항상 거부한다.
export function isAuthorizedCron(authHeader: string | null, secret: string | undefined): boolean {
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}
