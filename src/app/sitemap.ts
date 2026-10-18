import type { MetadataRoute } from "next";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { SITE_URL } from "@/lib/site";
import { publicPostsCondition } from "@/lib/post-visibility";

// 예약 글 공개·저장 직후 변경이 바로 반영되도록 매 요청마다 생성한다.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await db
    .select({ slug: posts.slug, createdAt: posts.createdAt })
    .from(posts)
    .where(publicPostsCondition())
    .orderBy(desc(posts.createdAt));

  const postEntries: MetadataRoute.Sitemap = rows.map((p) => ({
    url: `${SITE_URL}/posts/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/resume`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/portfolio`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  ];

  return [...staticEntries, ...postEntries];
}