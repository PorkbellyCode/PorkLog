import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { CATEGORIES, isValidCategory } from "@/lib/categories";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const activeCategory =
    category && isValidCategory(category) ? category : undefined;

  const allPosts = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(activeCategory ? eq(posts.category, activeCategory) : undefined)
    .orderBy(desc(posts.createdAt));

  const tabs: { label: string; key: string | undefined }[] = [
    { label: "전체", key: undefined },
    ...CATEGORIES.map((c) => ({ label: c.label, key: c.key })),
  ];

  return (
    <main className="min-h-svh p-8 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <nav className="flex gap-4 border-b border-border pb-2">
          {tabs.map((tab) => {
            const isActive = activeCategory === tab.key;
            const href = tab.key ? `/?category=${tab.key}` : "/";
            return (
              <Link
                key={tab.label}
                href={href}
                className={
                  isActive
                    ? "text-sm font-semibold border-b-2 border-foreground pb-1"
                    : "text-sm text-muted-foreground pb-1"
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <ul className="space-y-6">
          {allPosts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.slug}`}
                className="block hover:underline"
              >
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <time className="text-sm text-muted-foreground">
                  {post.createdAt.toLocaleDateString("ko-KR")}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}