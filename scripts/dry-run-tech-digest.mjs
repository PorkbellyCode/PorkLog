// DB에 쓰지 않고 fetch → summarize → 스키마 검증까지만 확인하는 드라이런.
// DATABASE_URL 없이도 실행 가능 (create-digest-post.ts 를 거치지 않음).
import { config } from "dotenv";
config({ path: ".env.local" });

const { fetchWeeklyTechNews } = await import("../src/lib/tech-digest/fetch-feeds.ts");
const { summarizeWeeklyTechNews } = await import("../src/lib/tech-digest/summarize.ts");
const { postInputSchema } = await import("../src/lib/post-schema.ts");

const items = await fetchWeeklyTechNews();
console.log(`수집된 아이템: ${items.length}개`);

if (items.length === 0) {
  console.log("아이템이 없어 요약 없이 종료합니다.");
  process.exit(0);
}

const post = await summarizeWeeklyTechNews(items);
const title = `이번 주 개발자 뉴스 - ${post.subtitle}`;
console.log(`생성된 제목: ${title}`);

const result = postInputSchema.safeParse({
  title,
  slug: "dry-run-check",
  content: post.content,
  category: "dev",
  thumbnail: null,
  series: "dev-news",
  tags: ["dev-news"],
});

if (result.success) {
  console.log("스키마 검증 통과 (DB 저장 없음)");
} else {
  console.log("스키마 검증 실패:");
  console.log(result.error.issues);
}
