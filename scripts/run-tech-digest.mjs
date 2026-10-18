import { config } from "dotenv";
config({ path: ".env.local" });

const { buildWeeklyDigest } = await import("../src/lib/tech-digest/pipeline.ts");
const { createDigestPost, digestExists, getRecentDigestLinks } = await import(
  "../src/lib/tech-digest/create-digest-post.ts"
);

if (await digestExists()) {
  console.log({ status: "skipped", reason: "duplicate_slug" });
  process.exit(0);
}

const built = await buildWeeklyDigest(await getRecentDigestLinks());
if (built.status === "skipped") {
  console.log(built);
  process.exit(0);
}
console.log(await createDigestPost(built.post));
