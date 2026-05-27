import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import Comments from "@/components/comments";

async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
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

  return (
    <main className="min-h-svh p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <article className="prose max-w-none">
          <h1>{post.title}</h1>
          <p>{post.createdAt.toLocaleDateString("ko-KR")}</p>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </article>
        <div className="mt-12">
          <Comments />
        </div>
      </div>
    </main>
  );
}
