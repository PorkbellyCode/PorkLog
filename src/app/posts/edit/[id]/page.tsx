import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import PostForm from "@/components/post-form";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId)) notFound();

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId));

  if (!post) notFound();

  return (
    <main className="min-h-svh p-8 flex justify-center">
      <PostForm
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          category: post.category,
          thumbnail: post.thumbnail,
        }}
      />
    </main>
  );
}
