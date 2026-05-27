import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { user, session, account, verification } from "@/db/auth-schema";

export const auth = betterAuth({
  // 로컬·프로덕션·Vercel 프리뷰를 모두 허용한다.
  // 요청 호스트를 allowedHosts 와 대조해 요청별 base URL 을 구성하므로
  // 배포마다 BETTER_AUTH_URL 을 바꿀 필요가 없다.
  baseURL: {
    allowedHosts: ["localhost:3000", "*.vercel.app"],
    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
});