"use server";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { postInputSchema } from "@/lib/post-schema";
import { z } from "zod";
import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

  await db
    .update(posts)
    .set({ title, slug, content, category, thumbnail })
    .where(eq(posts.id, id));

  revalidatePath("/");
  revalidatePath(`/posts/${slug}`);
  redirect(`/posts/${slug}`);
}

export async function deletePost(id: number): Promise<void> {
  await requireSession();

  await db.delete(posts).where(eq(posts.id, id));

  revalidatePath("/");
}
