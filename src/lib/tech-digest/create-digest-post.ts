import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { postInputSchema } from "@/lib/post-schema";
import { DIGEST_THUMBNAIL } from "./compose";
import { extractLinks } from "./filters";
import { kstDateString } from "./kst";

// 큐레이션 게시글은 항상 이 시리즈/태그로 고정한다.
const DIGEST_SERIES = "dev-news";
const DIGEST_TAG = "dev-news";
// 지난 글에서 이미 소개한 링크를 가려낼 때 살펴보는 글 수.
const RECENT_POSTS = 4;

export function digestSlug(now: Date = new Date()): string {
  return `weekly-dev-news-${kstDateString(now)}`;
}

// 수집·LLM 호출 전에 오늘 글이 이미 있는지 확인해 중복 실행의 비용을 없앤다.
export async function digestExists(now: Date = new Date()): Promise<boolean> {
  const [existing] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, digestSlug(now)));
  return !!existing;
}

// 최근 dev-news 글 본문에 이미 나온 링크(정규화됨).
export async function getRecentDigestLinks(): Promise<string[]> {
  const rows = await db
    .select({ content: posts.content })
    .from(posts)
    .where(eq(posts.series, DIGEST_SERIES))
    .orderBy(desc(posts.createdAt))
    .limit(RECENT_POSTS);
  return rows.flatMap((r) => extractLinks(r.content));
}

export type CreateDigestResult =
  | { status: "created"; slug: string; publishedAt: string }
  | { status: "skipped"; reason: "duplicate_slug"; slug: string };

// Cron 전용 게시 함수. 관리자 세션을 요구하지 않는다 (createPost 와 별개 경로).
export async function createDigestPost(
  post: { title: string; content: string; publishedAt: Date },
  now: Date = new Date(),
): Promise<CreateDigestResult> {
  const slug = digestSlug(now);

  if (await digestExists(now)) {
    return { status: "skipped", reason: "duplicate_slug", slug };
  }

  // postInputSchema 의 입력 타입을 그대로 만족시켜서, 이후 스키마에 필수 필드가
  // 추가되면 여기서 컴파일 에러로 바로 드러나게 한다.
  const parsed = postInputSchema.parse({
    title: post.title,
    slug,
    content: post.content,
    category: "dev",
    thumbnail: DIGEST_THUMBNAIL,
    series: DIGEST_SERIES,
    tags: [DIGEST_TAG],
    isPrivate: false,
    publishedAt: post.publishedAt,
  } satisfies z.input<typeof postInputSchema>);

  // post-actions.ts 의 getNextSeriesOrder 와 같은 규칙: 시리즈의 최대 회차 + 1.
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${posts.seriesOrder}), 0)` })
    .from(posts)
    .where(eq(posts.series, DIGEST_SERIES));
  const seriesOrder = (row?.max ?? 0) + 1;

  await db.insert(posts).values({ ...parsed, seriesOrder });

  // revalidatePath 는 실행 중인 Next.js 요청 컨텍스트 안에서만 동작한다.
  // scripts/run-tech-digest.mjs 처럼 독립 스크립트로 실행할 때는 그 컨텍스트가 없어 던지므로,
  // 그런 경우엔 무시하고 넘어간다(배포 환경에서 Vercel Cron 이 호출할 때는 정상 동작).
  try {
    revalidatePath("/");
    revalidatePath(`/posts/${slug}`);
  } catch (err) {
    console.warn("revalidatePath 스킵(요청 컨텍스트 밖에서 실행됨):", err);
  }

  return { status: "created", slug, publishedAt: parsed.publishedAt.toISOString() };
}
