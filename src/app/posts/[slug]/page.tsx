import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

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

  return (
    <main className="min-h-svh p-8 flex justify-center">
      <article className="prose max-w-2xl">
        <h1>{post.title}</h1>
        <p>{post.createdAt.toLocaleDateString("ko-KR")}</p>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>
    </main>
  );
}
