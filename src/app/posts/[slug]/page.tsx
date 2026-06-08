import { cache } from "react";
import type { Metadata } from "next";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import Comments from "@/components/comments";
import { categoryLabel, defaultThumbnail } from "@/lib/categories";
import { extractPreview } from "@/lib/post-preview";
import DeletePostButton from "@/components/delete-post-button";
import ShareButton from "@/components/share-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// generateMetadata 와 PostPage 가 같은 글을 공유 조회하도록 cache 로 감싼다.
// 한 요청 안에서 같은 slug 호출은 DB 왕복 1회로 합쳐진다.
const getPost = cache(async (slug: string) => {
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
  return post ?? null;
});

// 조회수 +1. cache 로 감싼 getPost 밖에서 별도 write 로 처리해
// metadata 생성 호출이 카운트를 올리는 걸 막는다. 원자적 증가.
async function incrementViewCount(slug: string) {
  await db
    .update(posts)
    .set({ viewCount: sql`${posts.viewCount} + 1` })
    .where(eq(posts.slug, slug));
}

async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, { theme: "github-dark" })
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const image = post.thumbnail ?? defaultThumbnail(post.category);
  const description = extractPreview(post.content);

  return {
    title: post.title,
    description,
    openGraph: { title: post.title, description, images: [image], type: "article" },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  await incrementViewCount(post.slug);
  
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = !!session;

  const html = await renderMarkdown(post.content);

  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        {/* 제목 블록: 메타 + 유틸 버튼 한 줄, 그 아래 제목 */}
        <header className="mb-8 border-b border-border-default pb-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-base text-fg-muted">
              <span>
                {categoryLabel(post.category)} ·{" "}
                {post.createdAt.toLocaleDateString("ko-KR")}
              </span>
              <span className="inline-flex items-center gap-1" title="조회수">
                {/* Octicon: eye */}
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.831.88 9.577.43 8.899a1.62 1.62 0 0 1 0-1.798c.45-.678 1.367-1.932 2.637-3.023C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z" />
                </svg>
                {post.viewCount.toLocaleString("ko-KR")}
              </span>
            </p>
            <div className="flex shrink-0 items-center gap-1">
              <ShareButton slug={post.slug} title={post.title} />
              {isAdmin && (
                <>
                  <Link
                    href={`/posts/edit/${post.id}`}
                    aria-label="수정"
                    title="수정"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:bg-fg-default/5 hover:text-fg-default transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      width="16"
                      height="16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z" />
                    </svg>
                  </Link>
                  <DeletePostButton id={post.id} />
                </>
              )}

              <Link
                href="/"
                aria-label="목록으로"
                title="목록으로"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:bg-fg-default/5 hover:text-fg-default transition-colors"
              >
                {/* Octicon: arrow-left */}
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L4.81 7.25h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
                </svg>
              </Link>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-fg-default">
            {post.title}
          </h1>
        </header>

        <article className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </article>

        <div className="mt-12">
          <Comments />
        </div>
      </div>
    </main>
  );
}