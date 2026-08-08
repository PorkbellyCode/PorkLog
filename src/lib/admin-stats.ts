import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts, siteVisits } from "@/db/schema";

export type VisitTrendPoint = {
  date: string;
  count: number;
};

// 최근 N일 방문자 추이. 날짜 오름차순(과거 -> 오늘)으로 반환한다.
export async function getVisitTrend(days = 30): Promise<VisitTrendPoint[]> {
  const rows = await db
    .select({ date: siteVisits.visitDate, count: siteVisits.count })
    .from(siteVisits)
    .orderBy(desc(siteVisits.visitDate))
    .limit(days);

  return rows.reverse();
}

export type VisitSummary = {
  today: number;
  total: number;
};

export async function getVisitSummary(): Promise<VisitSummary> {
  const [row] = await db
    .select({
      today: sql<number>`coalesce(max(${siteVisits.count}) filter (where ${siteVisits.visitDate} = to_char(now() at time zone 'Asia/Seoul', 'YYYY-MM-DD')), 0)`,
      total: sql<number>`coalesce(sum(${siteVisits.count}), 0)`,
    })
    .from(siteVisits);

  return {
    today: Number(row?.today ?? 0),
    total: Number(row?.total ?? 0),
  };
}

export type TopPost = {
  id: number;
  slug: string;
  title: string;
  category: string;
  viewCount: number;
};

export async function getTopPosts(limit = 10): Promise<TopPost[]> {
  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      category: posts.category,
      viewCount: posts.viewCount,
    })
    .from(posts)
    .orderBy(desc(posts.viewCount))
    .limit(limit);
}

export type PostSummary = {
  totalPosts: number;
  totalViews: number;
  averageViews: number;
};

export async function getPostSummary(): Promise<PostSummary> {
  const [row] = await db
    .select({
      totalPosts: sql<number>`count(*)`,
      totalViews: sql<number>`coalesce(sum(${posts.viewCount}), 0)`,
    })
    .from(posts);

  const totalPosts = Number(row?.totalPosts ?? 0);
  const totalViews = Number(row?.totalViews ?? 0);

  return {
    totalPosts,
    totalViews,
    averageViews: totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0,
  };
}
