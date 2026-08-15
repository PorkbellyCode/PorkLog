import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { postInputSchema } from "@/lib/post-schema";
import type { DigestPost } from "./summarize";

// 큐레이션 게시글은 항상 이 시리즈/태그로 고정한다.
const DIGEST_SERIES = "dev-news";
const DIGEST_TAG = "dev-news";

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

  // postInputSchema 의 입력 타입을 그대로 만족시켜서, 이후 스키마에 필수 필드가
  // 추가되면(이번 series/tags 처럼) 여기서 컴파일 에러로 바로 드러나게 한다.
  const parsed = postInputSchema.parse({
    title: `이번 주 개발자 뉴스 - ${post.subtitle}`,
    slug,
    content: post.content,
    category: "dev",
    thumbnail: null,
    series: DIGEST_SERIES,
    tags: [DIGEST_TAG],
  } satisfies z.input<typeof postInputSchema>);

  await db.insert(posts).values(parsed);

  revalidatePath("/");
  revalidatePath(`/posts/${slug}`);

  return { status: "created", slug };
}