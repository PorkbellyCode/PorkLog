import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import Comments from "@/components/comments";
import { categoryLabel, defaultThumbnail } from "@/lib/categories";


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

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug));

  if (!post) notFound();

  const html = await renderMarkdown(post.content);
  const heroSrc = post.thumbnail ?? defaultThumbnail(post.category);

  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
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