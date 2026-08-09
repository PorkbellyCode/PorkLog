import { describe, expect, test, vi } from "vitest";
import { eq } from "drizzle-orm";

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn().mockResolvedValue({ user: { id: "test-user" } }) } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@vercel/blob", () => ({
  del: vi.fn().mockResolvedValue(undefined),
}));

import { db } from "@/db";
import { posts } from "@/db/schema";
import { createPost, updatePost, deletePost } from "@/lib/post-actions";
import { del } from "@vercel/blob";

async function insertPost(overrides: Partial<typeof posts.$inferInsert> = {}) {
  const [row] = await db
    .insert(posts)
    .values({
      slug: "seed-post",
      title: "seed",
      content: "content",
      category: "dev",
      tags: [],
      ...overrides,
    })
    .returning({ id: posts.id });
  return row.id;
}

describe("createPost", () => {
  test("정상 입력 시 DB에 저장된다", async () => {
    const result = await createPost({
      title: "제목",
      slug: "new-post",
      content: "본문",
      category: "dev",
      thumbnail: null,
      series: null,
      tags: ["React"],
    });

    expect(result.ok).toBe(true);
    const [row] = await db.select().from(posts).where(eq(posts.slug, "new-post"));
    expect(row.title).toBe("제목");
    expect(row.tags).toEqual(["react"]);
    expect(row.seriesOrder).toBeNull();
  });

  test("이미 존재하는 slug면 실패한다", async () => {
    await insertPost({ slug: "dup-post" });

    const result = await createPost({
      title: "제목",
      slug: "dup-post",
      content: "본문",
      category: "dev",
      thumbnail: null,
      series: null,
      tags: [],
    });

    expect(result.formError).toBeDefined();
    const rows = await db.select().from(posts).where(eq(posts.slug, "dup-post"));
    expect(rows).toHaveLength(1);
  });

  test("isPrivate/publishedAt을 지정하면 그대로 저장된다", async () => {
    const future = new Date(Date.now() + 60_000);
    const result = await createPost({
      title: "예약 비공개 글",
      slug: "scheduled-private",
      content: "본문",
      category: "dev",
      thumbnail: null,
      series: null,
      tags: [],
      isPrivate: true,
      publishedAt: future,
    });

    expect(result.ok).toBe(true);
    const [row] = await db.select().from(posts).where(eq(posts.slug, "scheduled-private"));
    expect(row.isPrivate).toBe(true);
    expect(row.publishedAt.getTime()).toBe(future.getTime());
  });

  test("isPrivate/publishedAt을 생략하면 공개·즉시발행으로 저장된다", async () => {
    const result = await createPost({
      title: "즉시공개 글",
      slug: "immediate-public",
      content: "본문",
      category: "dev",
      thumbnail: null,
      series: null,
      tags: [],
    });

    expect(result.ok).toBe(true);
    const [row] = await db.select().from(posts).where(eq(posts.slug, "immediate-public"));
    expect(row.isPrivate).toBe(false);
    expect(row.publishedAt.getTime()).toBeLessThanOrEqual(Date.now());
  });

  test("같은 시리즈의 두 번째 글은 seriesOrder 2가 된다", async () => {
    await createPost({
      title: "1화",
      slug: "series-1",
      content: "본문",
      category: "dev",
      thumbnail: null,
      series: "나의시리즈",
      tags: [],
    });
    const result = await createPost({
      title: "2화",
      slug: "series-2",
      content: "본문",
      category: "dev",
      thumbnail: null,
      series: "나의시리즈",
      tags: [],
    });

    expect(result.ok).toBe(true);
    const [row] = await db.select().from(posts).where(eq(posts.slug, "series-2"));
    expect(row.seriesOrder).toBe(2);
  });
});

describe("updatePost", () => {
  test("시리즈가 그대로면 seriesOrder를 유지한다", async () => {
    const id = await insertPost({ slug: "keep-series", series: "시리즈A", seriesOrder: 3 });

    const result = await updatePost(id, {
      title: "수정된 제목",
      slug: "keep-series",
      content: "본문",
      category: "dev",
      thumbnail: null,
      series: "시리즈A",
      tags: [],
    });

    expect(result.ok).toBe(true);
    const [row] = await db.select().from(posts).where(eq(posts.id, id));
    expect(row.seriesOrder).toBe(3);
  });

  test("시리즈를 변경하면 새 시리즈의 다음 번호로 재계산된다", async () => {
    await insertPost({ slug: "series-b-1", series: "시리즈B", seriesOrder: 1 });
    const id = await insertPost({ slug: "move-me", series: "시리즈A", seriesOrder: 5 });

    const result = await updatePost(id, {
      title: "제목",
      slug: "move-me",
      content: "본문",
      category: "dev",
      thumbnail: null,
      series: "시리즈B",
      tags: [],
    });

    expect(result.ok).toBe(true);
    const [row] = await db.select().from(posts).where(eq(posts.id, id));
    expect(row.seriesOrder).toBe(2);
  });

  test("시리즈를 제거하면 seriesOrder도 null이 된다", async () => {
    const id = await insertPost({ slug: "remove-series", series: "시리즈A", seriesOrder: 2 });

    const result = await updatePost(id, {
      title: "제목",
      slug: "remove-series",
      content: "본문",
      category: "dev",
      thumbnail: null,
      series: null,
      tags: [],
    });

    expect(result.ok).toBe(true);
    const [row] = await db.select().from(posts).where(eq(posts.id, id));
    expect(row.seriesOrder).toBeNull();
  });

  test("isPrivate를 true로 바꾸면 반영된다", async () => {
    const id = await insertPost({ slug: "toggle-private", isPrivate: false });

    const result = await updatePost(id, {
      title: "제목",
      slug: "toggle-private",
      content: "본문",
      category: "dev",
      thumbnail: null,
      series: null,
      tags: [],
      isPrivate: true,
    });

    expect(result.ok).toBe(true);
    const [row] = await db.select().from(posts).where(eq(posts.id, id));
    expect(row.isPrivate).toBe(true);
  });

  test("다른 글이 쓰는 slug로 바꾸면 실패한다", async () => {
    await insertPost({ slug: "taken-slug" });
    const id = await insertPost({ slug: "my-slug" });

    const result = await updatePost(id, {
      title: "제목",
      slug: "taken-slug",
      content: "본문",
      category: "dev",
      thumbnail: null,
      series: null,
      tags: [],
    });

    expect(result.formError).toBeDefined();
  });

  test("썸네일이 바뀌면 이전 썸네일을 blob에서 삭제한다", async () => {
    const id = await insertPost({ slug: "thumb-post", thumbnail: "https://example.com/old.png" });

    await updatePost(id, {
      title: "제목",
      slug: "thumb-post",
      content: "본문",
      category: "dev",
      thumbnail: "https://example.com/new.png",
      series: null,
      tags: [],
    });

    expect(vi.mocked(del)).toHaveBeenCalledWith("https://example.com/old.png");
  });
});

describe("deletePost", () => {
  test("글을 삭제하고 썸네일 blob도 정리한다", async () => {
    const id = await insertPost({ slug: "to-delete", thumbnail: "https://example.com/x.png" });

    await deletePost(id);

    const rows = await db.select().from(posts).where(eq(posts.id, id));
    expect(rows).toHaveLength(0);
    expect(vi.mocked(del)).toHaveBeenCalledWith("https://example.com/x.png");
  });
});
