import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc, eq, ilike } from "drizzle-orm";
import Link from "next/link";
import { CATEGORIES, isValidCategory } from "@/lib/categories";
import SearchBar from "@/components/search-bar";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const query = q?.trim() ?? "";
  const isSearching = query.length > 0;

  // 유효하지 않은 카테고리 값은 전체(필터 없음)로 폴백한다.
  const activeCategory =
    category && isValidCategory(category) ? category : undefined;

  // 검색 중이면 제목 ilike 검색(카테고리 무시),
  // 아니면 카테고리 필터(없으면 전체).
  const whereClause = isSearching
    ? ilike(posts.title, `%${query}%`)
    : activeCategory
      ? eq(posts.category, activeCategory)
      : undefined;

  const allPosts = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(whereClause)
    .orderBy(desc(posts.createdAt));

  // 탭 목록: 맨 앞에 "전체"(key 없음), 그 뒤로 카테고리들.
  const tabs: { label: string; key: string | undefined }[] = [
    { label: "전체", key: undefined },
    ...CATEGORIES.map((c) => ({ label: c.label, key: c.key })),
  ];

  return (
    <main className="min-h-svh p-8 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <SearchBar initialQuery={query} />

        <nav className="flex gap-4 border-b border-border pb-2">
          {tabs.map((tab) => {
            const isActive = !isSearching && activeCategory === tab.key;
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

        {isSearching && (
          <p className="text-sm text-muted-foreground">
            &lsquo;{query}&rsquo; 검색 결과 {allPosts.length}건
          </p>
        )}

        {allPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isSearching
              ? "검색 결과가 없습니다."
              : "아직 글이 없습니다."}
          </p>
        ) : (
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
        )}
      </div>
    </main>
  );
}