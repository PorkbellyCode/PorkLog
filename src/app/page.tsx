import { db } from "@/db";
import { posts } from "@/db/schema";

export default async function Home() {
  const [post] = await db.select().from(posts);

  return (
    <div className="flex min-h-svh items-center justify-center p-8">
      <article className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </article>
    </div>
  );
}
