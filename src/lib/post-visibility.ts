import { and, eq, lte } from "drizzle-orm";
import { posts } from "@/db/schema";

// 공개 조건: 비공개가 아니고 발행 시각이 지난 글.
// 아래 두 함수는 같은 규칙이다. 한쪽을 바꾸면 반드시 다른 쪽도 함께 바꾼다.
// (JS 객체 판정용 / SQL where 절용)

export function isPubliclyVisible(
  post: { isPrivate: boolean; publishedAt: Date },
  now: Date = new Date(),
): boolean {
  return !post.isPrivate && post.publishedAt <= now;
}

export function publicPostsCondition(now: Date = new Date()) {
  return and(eq(posts.isPrivate, false), lte(posts.publishedAt, now));
}
