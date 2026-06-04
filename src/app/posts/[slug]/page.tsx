import { cache } from "react";
import type { Metadata } from "next";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
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

// generateMetadata 와 PostPage 가 같은 글을 공유 조회하도록 cache 로 감싼다.
// 한 요청 안에서 같은 slug 호출은 DB 왕복 1회로 합쳐진다.
const getPost = cache(async (slug: string) => {
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
  return post ?? null;
});

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

  const html = await renderMarkdown(post.content);
  const heroSrc = post.thumbnail ?? defaultThumbnail(post.category);

  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          aria-label="목록으로"
          title="목록으로"
          className="mb-6 inline-flex shrink-0 h-9 w-9 items-center justify-center rounded-md border border-border-default bg-bg-default text-fg-default hover:bg-fg-default/5 transition-colors"
        >
          {/* Octicon: arrow-left */}
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L4.81 7.25h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
          </svg>
        </Link>

        {/* 히어로 영역: 썸네일(또는 카테고리 기본) */}
        <div className="mb-8 overflow-hidden rounded-lg border border-border-default">
          <div className="aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrc}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <header className="mb-8 space-y-3">
          <p className="text-sm text-fg-muted">
            {categoryLabel(post.category)} ·{" "}
            {post.createdAt.toLocaleDateString("ko-KR")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-fg-default">
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