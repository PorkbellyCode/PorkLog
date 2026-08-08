import { afterEach } from "vitest";
import { config } from "dotenv";

config({ path: ".env.test" });

if (!process.env.DATABASE_URL) {
  throw new Error(".env.test 에 DATABASE_URL 이 없습니다. 테스트 전용 DB 연결 문자열을 설정하세요.");
}

// db 는 import 시점에 neon(process.env.DATABASE_URL) 을 즉시 실행하므로,
// 위 config() 로 env 를 먼저 로드한 뒤 동적 import 로 늦춰서 불러온다.
const { db } = await import("@/db");
const { posts } = await import("@/db/schema");

afterEach(async () => {
  await db.delete(posts);
});
