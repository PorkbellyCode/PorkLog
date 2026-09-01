import { config } from "dotenv";
config({ path: ".env.local" });

const { fetchWeeklyTechNews } = await import("../src/lib/tech-digest/fetch-feeds.ts");
const { fetchGithubTrending } = await import("../src/lib/tech-digest/fetch-github.ts");
const { fetchTrendingModels: fetchHfTrendingModels } = await import("../src/lib/tech-digest/fetch-huggingface.ts");
const { fetchOpenRouterTrending } = await import("../src/lib/tech-digest/fetch-openrouter.ts");
const { summarizeWeeklyTechNews } = await import("../src/lib/tech-digest/summarize.ts");
const { createDigestPost } = await import("../src/lib/tech-digest/create-digest-post.ts");

const [items, github, hfModels, openRouterModels] = await Promise.all([
  fetchWeeklyTechNews(),
  fetchGithubTrending(),
  fetchHfTrendingModels(),
  fetchOpenRouterTrending(),
]);

const post = await summarizeWeeklyTechNews({ items, github, hfModels, openRouterModels });
const result = await createDigestPost(post);
console.log(result);
