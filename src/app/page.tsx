import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import ReactMarkdown from "react-markdown";

export default async function Home() {
  const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));

  return (
    <main className="min-h-svh p-8 flex justify-center">
      <div className="w-full max-w-2xl space-y-12">
        {allPosts.map((post) => (
          <article key={post.id} className="prose">
            <h1>{post.title}</h1>
            <p>{post.createdAt.toLocaleDateString("ko-KR")}</p>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </article>
        ))}
      </div>
    </main>
  );
}
