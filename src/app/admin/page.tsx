import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import DeletePostButton from "@/components/delete-post-button";

export default async function AdminPage() {
  const allPosts = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .orderBy(desc(posts.createdAt));

  return (
    <main className="min-h-svh p-8 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">어드민</h1>
          <Link
            href="/admin/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            새 글 작성
          </Link>
        </div>

        <ul className="space-y-4">
          {allPosts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between border-b border-border pb-3"
            >
              <div>
                <Link
                  href={`/posts/${post.slug}`}
                  className="font-medium hover:underline"
                >
                  {post.title}
                </Link>
                <time className="ml-2 text-sm text-muted-foreground">
                  {post.createdAt.toLocaleDateString("ko-KR")}
                </time>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/edit/${post.id}`}
                  className="text-sm hover:underline"
                >
                  수정
                </Link>
                <DeletePostButton id={post.id} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}