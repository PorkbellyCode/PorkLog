import { db } from "@/db";
import { posts } from "@/db/schema";
import ReactMarkdown from "react-markdown";

export default async function Home() {
  const [post] = await db.select().from(posts);

  return (
    <div className="flex min-h-svh items-center justify-center p-8">
      <article className="prose max-w-2xl">
        <h1>{post.title}</h1>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>
    </div>
  );
}
