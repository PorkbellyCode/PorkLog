import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc, eq, ilike, count, type SQL } from "drizzle-orm";
import { CATEGORIES, isValidCategory } from "@/lib/categories";
import { extractPreview } from "@/lib/post-preview";
import PostCard from "@/components/post-card";
import Pagination from "@/components/pagination";
import Link from "next/link";

const PAGE_SIZE = 9;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const isSearching = query.length > 0;

  const activeCategory =
    sp.category && isValidCategory(sp.category) ? sp.category : undefined;

  const rawPage = Number(sp.page);
  const currentPage =
    Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const whereClause: SQL | undefined = isSearching
    ? ilike(posts.title, `%${query}%`)
    : activeCategory
      ? eq(posts.category, activeCategory)
      : undefined;

  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(posts)
    .where(whereClause);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const pagePosts = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      content: posts.content,
      category: posts.category,
      thumbnail: posts.thumbnail,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(whereClause)
    .orderBy(desc(posts.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  const tabs: { label: string; key: string | undefined }[] = [
    { label: "전체", key: undefined },
    ...CATEGORIES.map((c) => ({ label: c.label, key: c.key })),
  ];

  function hrefForPage(page: number): string {
    const params = new URLSearchParams();
    if (isSearching) params.set("q", query);
    if (activeCategory) params.set("category", activeCategory);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <nav className="flex gap-4 border-b border-border-default pb-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = !isSearching && activeCategory === tab.key;
            const href = tab.key ? `/?category=${tab.key}` : "/";
            return (
              <Link
                key={tab.label}
                href={href}
                className={
                  isActive
                    ? "text-sm font-semibold text-fg-default border-b-2 border-fg-default pb-1 whitespace-nowrap"
                    : "text-sm text-fg-muted hover:text-fg-default pb-1 whitespace-nowrap"
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {isSearching && (
          <p className="text-sm text-fg-muted">
            &lsquo;{query}&rsquo; 검색 결과 {totalCount}건
          </p>
        )}

        {pagePosts.length === 0 ? (
          <p className="text-sm text-fg-muted py-8 text-center">
            {isSearching ? "검색 결과가 없습니다." : "아직 글이 없습니다."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pagePosts.map((post, idx) => {
                const featured = !isSearching && idx === 0;
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    preview={extractPreview(post.content)}
                    featured={featured}
                  />
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hrefForPage={hrefForPage}
            />
          </>
        )}
      </div>
    </main>
  );
}