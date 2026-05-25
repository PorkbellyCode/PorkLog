import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { user, session, account, verification } from "@/db/auth-schema";

// BETTER_AUTH_SECRET / BETTER_AUTH_URL 은 betterAuth 가 환경변수에서 자동으로 읽습니다.
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    // 단일 관리자 구조: 인프라(로그인/세션)는 유지하되 외부 회원가입만 차단.
    // 방명록/친구 가입을 열 때 이 줄을 false 로 바꾸면 됩니다.
    disableSignUp: true,
  },
});