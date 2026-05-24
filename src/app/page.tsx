import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function Home() {
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
      <ul className="w-full max-w-2xl space-y-6">
        {allPosts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.slug}`} className="block hover:underline">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <time className="text-sm text-muted-foreground">
                {post.createdAt.toLocaleDateString("ko-KR")}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
