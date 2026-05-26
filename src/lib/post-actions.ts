"use server";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { postInputSchema } from "@/lib/post-schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreatePostState = {
    // 필드별 검증 에러 (예: { slug: ["..."]})
    fieldErrors?: Record<string, string[] | undefined>;
    // 전체 폼 에러 (예: "slug 중복.")
    formError?: string;
};

export async function createPost(input: {
    title: string;
    slug: string;
    content: string;
}): Promise<CreatePostState> {
    const parsed = postInputSchema.safeParse(input);

    if(!parsed.success) {
        return { fieldErrors: z.flattenError(parsed.error).fieldErrors }
    }

    const { title, slug, content } = parsed.data;

    // slug 중복 사전 확인. (UNIQUE 제약이 최종 방어선이지만, 사용자 친화적인 메시지를 위해 미리 조회한다.)
    const [existing] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug));

    if(existing) {
        return { formError: "이미 사용 중인 slug입니다." }
    }

    await db.insert(posts).values({ title, slug, content });

    // 새 글이 생성되면 목록 페이지를 리프레시한다.
    revalidatePath("/");
    revalidatePath("/admin");
    redirect("/admin");
}

export async function deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
    revalidatePath("/");
    revalidatePath("/admin");
}