"use server";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { postInputSchema } from "@/lib/post-schema";
import { z } from "zod";
import { eq, and, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type PostFormState = {
  ok?: boolean;
  slug?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  formError?: string;
};

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("unauthorized");
  }
}

// 업로드된 썸네일 Blob 정리. 실패해도 글 작업 자체는 막지 않도록 best-effort.
async function deleteThumbnailBlob(url: string | null | undefined) {
  if (!url) return;
  try {
    await del(url);
  } catch (err) {
    console.error("썸네일 Blob 삭제 실패:", url, err);
  }
}

// 해당 시리즈의 현재 최대 회차 + 1. 시리즈에 글이 없으면 1.
async function getNextSeriesOrder(series: string): Promise<number> {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${posts.seriesOrder}), 0)` })
    .from(posts)
    .where(eq(posts.series, series));
  return (row?.max ?? 0) + 1;
}

export async function createPost(input: {
  title: string;
  slug: string;
  content: string;
  category: string;
  thumbnail: string | null;
  series: string | null;
  tags: string[];
  isPrivate?: boolean;
  publishedAt?: Date;
}): Promise<PostFormState> {
  await requireSession();

  const parsed = postInputSchema.safeParse(input);

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { title, slug, content, category, thumbnail, series, tags, isPrivate, publishedAt } =
    parsed.data;

  const [existing] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug));

  if (existing) {
    return { formError: "이미 사용 중인 slug 입니다." };
  }

  const seriesOrder = series ? await getNextSeriesOrder(series) : null;

  await db
    .insert(posts)
    .values({
      title,
      slug,
      content,
      category,
      thumbnail,
      series,
      seriesOrder,
      tags,
      isPrivate,
      publishedAt,
    });

  revalidatePath("/");
  return { ok: true };
}

export async function updatePost(
  id: number,
  input: {
    title: string;
    slug: string;
    content: string;
    category: string;
    thumbnail: string | null;
    series: string | null;
    tags: string[];
    isPrivate?: boolean;
    publishedAt?: Date;
  },
): Promise<PostFormState> {
  await requireSession();

  const parsed = postInputSchema.safeParse(input);

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { title, slug, content, category, thumbnail, series, tags, isPrivate, publishedAt } =
    parsed.data;

  const [existing] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.slug, slug), ne(posts.id, id)));

  if (existing) {
    return { formError: "이미 사용 중인 slug 입니다." };
  }

  // 교체/제거된 옛 썸네일 삭제, 시리즈 변경 여부 판단을 위해 변경 전 값을 읽어둔다.
  const [current] = await db
    .select({
      thumbnail: posts.thumbnail,
      series: posts.series,
      seriesOrder: posts.seriesOrder,
    })
    .from(posts)
    .where(eq(posts.id, id));

  // 시리즈가 그대로면 기존 회차를 유지하고, 바뀌었으면(새로 시리즈에 들어가는 경우 포함)
  // 새 시리즈의 다음 번호를 다시 계산한다.
  const seriesOrder =
    series === (current?.series ?? null)
      ? (current?.seriesOrder ?? null)
      : series
        ? await getNextSeriesOrder(series)
        : null;

  await db
    .update(posts)
    .set({
      title,
      slug,
      content,
      category,
      thumbnail,
      series,
      seriesOrder,
      tags,
      isPrivate,
      publishedAt,
    })
    .where(eq(posts.id, id));

  // 썸네일이 바뀌었거나(새 URL) 제거되었으면(null) 이전 Blob 삭제.
  if (current?.thumbnail && current.thumbnail !== thumbnail) {
    await deleteThumbnailBlob(current.thumbnail);
  }

  revalidatePath("/");
  revalidatePath(`/posts/${slug}`);
  return { ok: true, slug };
}

export async function deletePost(id: number): Promise<{ ok: true }> {
  await requireSession();

  const [existing] = await db
    .select({ thumbnail: posts.thumbnail })
    .from(posts)
    .where(eq(posts.id, id));

  await db.delete(posts).where(eq(posts.id, id));

  await deleteThumbnailBlob(existing?.thumbnail);

  revalidatePath("/");
  return { ok: true };
}