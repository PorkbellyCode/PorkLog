import { config } from "dotenv";
config({ path: ".env.local" });

const { fetchWeeklyTechNews } = await import("./src/lib/tech-digest/fetch-feeds.ts");
const { summarizeWeeklyTechNews } = await import("./src/lib/tech-digest/summarize.ts");
const { createDigestPost } = await import("./src/lib/tech-digest/create-digest-post.ts");

const items = await fetchWeeklyTechNews();
const post = await summarizeWeeklyTechNews(items);
const result = await createDigestPost(post);
console.log(result);