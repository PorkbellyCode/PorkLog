import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { SITE_URL, EMAIL } from "@/lib/site";
import { extractPreview } from "@/lib/post-preview";
import { publicPostsCondition } from "@/lib/post-visibility";

// 예약 글 공개·저장 직후 변경이 바로 반영되도록 매 요청마다 생성한다.
export const dynamic = "force-dynamic";

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
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(publicPostsCondition())
    .orderBy(desc(posts.publishedAt), desc(posts.id))
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
      <pubDate>${p.publishedAt.toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const lastBuildDate = (rows[0]?.publishedAt ?? new Date()).toUTCString();

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
