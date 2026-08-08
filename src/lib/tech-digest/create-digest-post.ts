import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { postInputSchema } from "@/lib/post-schema";
import type { DigestPost } from "./summarize";

function todaySlug(): string {
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const dateStr = kstNow.toISOString().slice(0, 10); // YYYY-MM-DD
  return `weekly-dev-news-${dateStr}`;
}

export type CreateDigestResult =
  | { status: "created"; slug: string }
  | { status: "skipped"; reason: "duplicate_slug"; slug: string };

// Cron 전용 게시 함수. 관리자 세션을 요구하지 않는다 (createPost 와 별개 경로).
export async function createDigestPost(post: DigestPost): Promise<CreateDigestResult> {
  const slug = todaySlug();

  const [existing] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug));
  if (existing) {
    return { status: "skipped", reason: "duplicate_slug", slug };
  }

  const parsed = postInputSchema.parse({
    title: `이번 주 개발자 뉴스 - ${post.subtitle}`,
    slug,
    content: post.content,
    category: "dev",
    thumbnail: null,
  });

  await db.insert(posts).values(parsed);

  revalidatePath("/");
  revalidatePath(`/posts/${slug}`);

  return { status: "created", slug };
}