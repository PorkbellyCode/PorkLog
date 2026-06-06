"use server";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { postInputSchema } from "@/lib/post-schema";
import { z } from "zod";
import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type PostFormState = {
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

export async function createPost(input: {
  title: string;
  slug: string;
  content: string;
  category: string;
  thumbnail: string | null;
}): Promise<PostFormState> {
  await requireSession();

  const parsed = postInputSchema.safeParse(input);

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { title, slug, content, category, thumbnail } = parsed.data;

  const [existing] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug));

  if (existing) {
    return { formError: "이미 사용 중인 slug 입니다." };
  }

  await db.insert(posts).values({ title, slug, content, category, thumbnail });

  revalidatePath("/");
  redirect("/");
}

export async function updatePost(
  id: number,
  input: {
    title: string;
    slug: string;
    content: string;
    category: string;
    thumbnail: string | null;
  },
): Promise<PostFormState> {
  await requireSession();

  const parsed = postInputSchema.safeParse(input);

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { title, slug, content, category, thumbnail } = parsed.data;

  const [existing] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.slug, slug), ne(posts.id, id)));

  if (existing) {
    return { formError: "이미 사용 중인 slug 입니다." };
  }

  // 교체/제거된 옛 썸네일을 지우기 위해 변경 전 값을 읽어둔다.
  const [current] = await db
    .select({ thumbnail: posts.thumbnail })
    .from(posts)
    .where(eq(posts.id, id));

  await db
    .update(posts)
    .set({ title, slug, content, category, thumbnail })
    .where(eq(posts.id, id));

  // 썸네일이 바뀌었거나(새 URL) 제거되었으면(null) 이전 Blob 삭제.
  if (current?.thumbnail && current.thumbnail !== thumbnail) {
    await deleteThumbnailBlob(current.thumbnail);
  }

  revalidatePath("/");
  revalidatePath(`/posts/${slug}`);
  redirect(`/posts/${slug}`);
}

export async function deletePost(id: number): Promise<void> {
  await requireSession();

  const [existing] = await db
    .select({ thumbnail: posts.thumbnail })
    .from(posts)
    .where(eq(posts.id, id));

  await db.delete(posts).where(eq(posts.id, id));

  await deleteThumbnailBlob(existing?.thumbnail);

  revalidatePath("/");
  redirect("/");
}