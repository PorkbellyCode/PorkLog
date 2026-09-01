// DB에 쓰지 않고 fetch → summarize → 스키마 검증까지만 확인하는 드라이런.
// DATABASE_URL 없이도 실행 가능 (create-digest-post.ts 를 거치지 않음).
import { config } from "dotenv";
config({ path: ".env.local" });

const { fetchWeeklyTechNews } = await import("../src/lib/tech-digest/fetch-feeds.ts");
const { fetchGithubTrending } = await import("../src/lib/tech-digest/fetch-github.ts");
const { fetchTrendingModels: fetchHfTrendingModels } = await import("../src/lib/tech-digest/fetch-huggingface.ts");
const { fetchOpenRouterTrending } = await import("../src/lib/tech-digest/fetch-openrouter.ts");
const { summarizeWeeklyTechNews } = await import("../src/lib/tech-digest/summarize.ts");
const { postInputSchema } = await import("../src/lib/post-schema.ts");

const [items, github, hfModels, openRouterModels] = await Promise.all([
  fetchWeeklyTechNews(),
  fetchGithubTrending(),
  fetchHfTrendingModels(),
  fetchOpenRouterTrending(),
]);
console.log(
  `수집된 아이템: 뉴스/블로그 ${items.length}개, GitHub 레포 ${github.repos.length}개, HF 모델 ${hfModels.length}개, OpenRouter 모델 ${openRouterModels.length}개`,
);

if (items.length === 0 && github.repos.length === 0 && hfModels.length === 0 && openRouterModels.length === 0) {
  console.log("아이템이 없어 요약 없이 종료합니다.");
  process.exit(0);
}

const post = await summarizeWeeklyTechNews({ items, github, hfModels, openRouterModels });
const title = `이번 주 AI 테크뉴스 - ${post.subtitle}`;
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
