import { config } from "dotenv";

// db / auth-schema 를 import 하기 전에 env 를 먼저 로드해야 한다.
// src/db/index.ts 가 import 시점에 neon(process.env.DATABASE_URL) 을 즉시 실행하기 때문.
config({ path: ".env.local" });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "admin";

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL / ADMIN_PASSWORD 환경변수가 .env.local 에 필요합니다.",
    );
  }

  // env 로드 이후로 미룬 동적 import
  const { betterAuth } = await import("better-auth");
  const { drizzleAdapter } = await import("better-auth/adapters/drizzle");
  const { db } = await import("../src/db");
  const { user, session, account, verification } = await import(
    "../src/db/auth-schema"
  );

  // 런타임 auth(src/lib/auth.ts)는 disableSignUp:true 라 가입이 막혀 있으므로,
  // 시드 전용으로 가입이 열린 인스턴스를 따로 만들어 계정 1개만 생성한다.
  // 같은 DB를 가리키므로 생성된 계정은 런타임 로그인에 그대로 쓰인다.
  const seedAuth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { user, session, account, verification },
    }),
    emailAndPassword: { enabled: true }, // 여기서는 disableSignUp 을 두지 않음
  });

  const result = await seedAuth.api.signUpEmail({
    body: { email, password, name },
  });

  console.log("관리자 계정 생성 완료:", result.user?.email);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("시드 실패:", err);
    process.exit(1);
  });