import type { MetadataRoute } from "next";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { SITE_URL } from "@/lib/site";

// DB에 새 글이 추가돼도(=git push 없이) 사이트맵에 반영되도록 1시간마다 재생성.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await db
    .select({ slug: posts.slug, createdAt: posts.createdAt })
    .from(posts)
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
  ];

  return [...staticEntries, ...postEntries];
}