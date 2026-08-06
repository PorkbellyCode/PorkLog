import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { SITE_URL, EMAIL } from "@/lib/site";
import { extractPreview } from "@/lib/post-preview";

// 새 글이 DB에 추가돼도(=재배포 없이) 피드에 반영되도록 1시간마다 재생성.
export const revalidate = 3600;

const FEED_SIZE = 20;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const rows = await db
    .select({
      slug: posts.slug,
      title: posts.title,
      content: posts.content,
      category: posts.category,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(FEED_SIZE);

  const items = rows
    .map((p) => {
      const url = `${SITE_URL}/posts/${p.slug}`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(extractPreview(p.content, 200))}</description>
      <category>${escapeXml(p.category)}</category>
      <pubDate>${p.createdAt.toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const lastBuildDate = (rows[0]?.createdAt ?? new Date()).toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PorkLog</title>
    <link>${SITE_URL}</link>
    <description>김형준의 개발 블로그, 일상을 곁들인.</description>
    <language>ko</language>
    <managingEditor>${EMAIL} (김형준)</managingEditor>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
