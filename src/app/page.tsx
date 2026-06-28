import { Suspense } from "react";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc, eq, ilike, count, type SQL } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { CATEGORIES, isValidCategory } from "@/lib/categories";
import { extractPreview } from "@/lib/post-preview";
import { getCommentCounts } from "@/lib/github-discussions";
import PostCard from "@/components/post-card";
import Pagination from "@/components/pagination";
import ContentSearch from "@/components/content-search";
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

  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = !!session;

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
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(whereClause)
    .orderBy(desc(posts.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  // Giscus(GitHub Discussions) 댓글 수: pathname -> count. 5분 캐시.
  const commentCounts = await getCommentCounts();

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
        {/* Resume 진입 히어로: 기본 랜딩(검색·카테고리·페이지네이션 아님)에서만 노출 */}
        {!isSearching && !activeCategory && currentPage === 1 && (
          <section className="rounded-lg border border-border-default bg-bg-subtle p-6 sm:p-8">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
              <img
                src="/khj.jpg"
                alt="김형준 프로필 사진"
                className="h-20 w-20 shrink-0 rounded-full border border-border-default object-cover sm:h-24 sm:w-24"
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-fg-default sm:text-3xl">
                  보여지는 것 이상을 생각하는 개발자
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  프론트엔드를 중심으로, 화면 너머의 동작까지 책임지는 풀스택 개발자입니다.
                </p>
                <Link
                  href="/resume"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-accent-fg px-4 py-2 text-sm font-medium text-white hover:bg-accent-fg/90 transition-colors"
                >
                  Resume 보기
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L11.94 8.75H2.75a.75.75 0 0 1 0-1.5h9.19L8.22 4.03a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        <nav className="flex items-center justify-between gap-4 border-b border-border-default pb-2">
          <div className="flex gap-4 overflow-x-auto">
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
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Suspense fallback={null}>
              <ContentSearch />
            </Suspense>
            {isAdmin && (
            <Link
              href="/posts/new"
              aria-label="새 글 작성"
              title="새 글 작성"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-fg-default/5 hover:text-fg-default transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
              </svg>
            </Link>
            )}
          </div>
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
                    isAdmin={isAdmin}
                    commentCount={commentCounts[`posts/${post.slug}`] ?? 0}
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