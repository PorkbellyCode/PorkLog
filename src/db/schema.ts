import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  thumbnail: text('thumbnail'),
  // 연재 시리즈. series 가 null 이면 단발성 글이고, seriesOrder 도 항상 null 이다.
  series: text('series'),
  seriesOrder: integer('series_order'),
  // 세부 분류 태그. 저장 시 소문자로 정규화되어 있다 (src/lib/post-schema.ts).
  tags: text('tags').array().default([]).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // 완전비공개. true 면 관리자 외에는 목록/상세/피드/사이트맵 어디서도 접근 불가(직접 URL 포함).
  isPrivate: boolean('is_private').default(false).notNull(),
  // 발행일시. 미래 값이면 예약발행(그 시각 전까지는 isPrivate 와 동일하게 비공개 처리).
  publishedAt: timestamp('published_at').defaultNow().notNull(),
});

// 사이트 전체 방문자 수. 날짜(KST 'YYYY-MM-DD')별 1행.
// '오늘' = 오늘 날짜 행의 count, '누적' = 전체 count 합.
export const siteVisits = pgTable('site_visits', {
  visitDate: text('visit_date').primaryKey(),
  count: integer('count').default(0).notNull(),
});