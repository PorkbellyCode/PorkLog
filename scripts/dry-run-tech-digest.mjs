// DB 에 쓰지 않고 수집 → 후보 정리 → LLM → 조립 → 스키마 검증까지 확인하는 드라이런.
// DATABASE_URL 없이도 실행 가능 (DB 를 읽는 이력 필터는 건너뛴다).
// 실행: pnpm tsx scripts/dry-run-tech-digest.mjs  (OPENAI_API_KEY, OPENROUTER_API_KEY 필요)
import { config } from "dotenv";
config({ path: ".env.local" });

const { buildWeeklyDigest } = await import("../src/lib/tech-digest/pipeline.ts");
const { postInputSchema } = await import("../src/lib/post-schema.ts");

const built = await buildWeeklyDigest([]);

if (built.status === "skipped") {
  console.log(`발행하지 않고 종료: ${built.reason}`);
  process.exit(0);
}

console.log(`후보 ${built.stats.candidates}개 중 ${built.stats.selected}개 선택`);
console.log(`제목: ${built.post.title}`);
console.log(`공개 예정: ${built.post.publishedAt.toISOString()}`);

const result = postInputSchema.safeParse({
  title: built.post.title,
  slug: "dry-run-check",
  content: built.post.content,
  category: "dev",
  thumbnail: null,
  series: "dev-news",
  tags: ["dev-news"],
  isPrivate: false,
  publishedAt: built.post.publishedAt,
});

console.log(result.success ? "스키마 검증 통과 (DB 저장 없음)" : "스키마 검증 실패:");
if (!result.success) console.log(result.error.issues);

console.log("\n──────── 본문 ────────\n");
console.log(built.post.content);
