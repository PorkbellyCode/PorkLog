import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  thumbnail: text('thumbnail'),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 사이트 전체 방문자 수. 날짜(KST 'YYYY-MM-DD')별 1행.
// '오늘' = 오늘 날짜 행의 count, '누적' = 전체 count 합.
export const siteVisits = pgTable('site_visits', {
  visitDate: text('visit_date').primaryKey(),
  count: integer('count').default(0).notNull(),
});

export const guestbook = pgTable('guestbook', {
  id: serial('id').primaryKey(),
  authorId: text('author_id').notNull(),
  passwordHash: text('password_hash').notNull(),
  content: text('content').notNull(),
  updatedAt: timestamp('updated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});