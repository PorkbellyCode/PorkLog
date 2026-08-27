import { cache, Suspense } from "react";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { and, desc, eq, ilike, lte, or, count, arrayContains, type SQL } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { CATEGORIES, categoryLabel, isValidCategory, type CategoryKey } from "@/lib/categories";
import { extractPreview } from "@/lib/post-preview";
import { getCommentCounts } from "@/lib/github-discussions";
import { GITHUB_URL, EMAIL } from "@/lib/site";
import PostCard from "@/components/post-card";
import Pagination from "@/components/pagination";
import ContentSearch from "@/components/content-search";
import Spinner from "@/components/spinner";
import Link from "next/link";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

const PAGE_SIZE = 10;

// PostList 와 NewPostLink 가 각자 세션을 보므로 요청 단위로 한 번만 조회한다.
const getIsAdmin = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return !!session;
});

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string; q?: string; page?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const isSearching = (sp.q?.trim() ?? "").length > 0;

  return {
    // 카테고리·태그·페이지·검색 등 모든 쿼리 조합의 정본은 홈("/").
    alternates: { canonical: "/" },
    // 검색 결과는 thin/중복 콘텐츠라 색인에서 제외 (크롤은 허용).
    robots: isSearching ? { index: false, follow: true } : undefined,
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const isSearching = query.length > 0;
  const activeTag = sp.tag?.trim() || undefined;

  const activeCategory =
    sp.category && isValidCategory(sp.category) ? sp.category : undefined;

  const rawPage = Number(sp.page);
  const currentPage =
    Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const tabs: { label: string; key: string | undefined }[] = [
    { label: "전체", key: undefined },
    ...CATEGORIES.map((c) => ({ label: c.label, key: c.key })),
  ];

  // 카테고리 탭 클릭 시 검색어·태그는 유지하고 카테고리만 갈아끼운다.
  function hrefForCategory(key: string | undefined): string {
    const params = new URLSearchParams();
    if (isSearching) params.set("q", query);
    if (activeTag) params.set("tag", activeTag);
    if (key) params.set("category", key);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Resume 진입 히어로: 기본 랜딩(검색·카테고리·태그·페이지네이션 아님)에서만 노출 */}
        {!isSearching && !activeTag && !activeCategory && currentPage === 1 && (
          <section>
            <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-fg-default sm:text-3xl">
              보이는 것 이상을
              <br />
              <span className="text-accent-brand">생각하는</span> 개발자
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-muted">
              프론트엔드를 중심으로, 화면 너머의 동작까지 책임지는 풀스택 개발자입니다.
            </p>
            {/* Resume·GitHub·이메일을 같은 형식의 텍스트 링크로 한 줄에 둔다.
              * Resume 만 액센트 + semibold 로 두어 주 액션임을 드러낸다.
              * 이미 오렌지라 hover 는 색이 아니라 밑줄로 준다. */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href="/resume"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-accent-fg transition-all hover:underline hover:underline-offset-4"
              >
                {/* Octicon: briefcase */}
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true" className="shrink-0">
                  <path d="M6.75 0h2.5C10.216 0 11 .784 11 1.75V3h2.25c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 13.25 15H2.75A1.75 1.75 0 0 1 1 13.25v-8.5C1 3.784 1.784 3 2.75 3H5V1.75C5 .784 5.784 0 6.75 0Zm-.25 3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Zm-3.75 1.5a.25.25 0 0 0-.25.25v2.5h11v-2.5a.25.25 0 0 0-.25-.25Zm10.5 4.25h-11v4.5c0 .138.112.25.25.25h10.5a.25.25 0 0 1 .25-.25Z" />
                </svg>
                Resume
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-fg-muted transition-colors hover:text-accent-fg"
              >
                {/* Octicon: mark-github */}
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true" className="shrink-0">
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
                </svg>
                {GITHUB_URL.replace(/^https?:\/\//, "")}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-fg-muted transition-colors hover:text-accent-fg"
              >
                {/* Octicon: mail */}
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true" className="shrink-0">
                  <path d="M1.75 2A1.75 1.75 0 0 0 0 3.75v8.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25v-8.5A1.75 1.75 0 0 0 14.25 2Zm12.5 1.5a.25.25 0 0 1 .25.25v.852l-6 3.96-6-3.96V3.75a.25.25 0 0 1 .25-.25ZM1.5 5.81v6.44c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.81l-5.815 3.84a.75.75 0 0 1-.87 0Z" />
                </svg>
                {EMAIL}
              </a>
            </div>
          </section>
        )}

        <nav className="flex items-center justify-between gap-4 border-b border-border-default pb-2">
          <div className="flex gap-4 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeCategory === tab.key;
              const href = hrefForCategory(tab.key);
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
            <Suspense fallback={null}>
              <NewPostLink />
            </Suspense>
          </div>
        </nav>

        {/* 목록은 별도 경계로 분리한다. key 가 바뀌면 다시 suspend 되므로
            같은 세그먼트 안에서 카테고리·태그·검색·페이지가 바뀔 때도 폴백이 뜬다. */}
        <Suspense
          key={`${activeCategory ?? ""}|${activeTag ?? ""}|${query}|${currentPage}`}
          fallback={<ListFallback />}
        >
          <PostList
            query={query}
            isSearching={isSearching}
            activeTag={activeTag}
            activeCategory={activeCategory}
            currentPage={currentPage}
          />
        </Suspense>
      </div>
    </main>
  );
}

async function PostList({
  query,
  isSearching,
  activeTag,
  activeCategory,
  currentPage,
}: {
  query: string;
  isSearching: boolean;
  activeTag: string | undefined;
  activeCategory: CategoryKey | undefined;
  currentPage: number;
}) {
  const isAdmin = await getIsAdmin();

  // 검색·태그·카테고리는 모두 동시 적용(AND). 검색은 제목 또는 본문에 매칭되면 인정.
  // 비관리자에게는 비공개 글, 발행일시가 아직 안 지난(예약) 글을 추가로 숨긴다.
  const conditions = [
    isSearching
      ? or(ilike(posts.title, `%${query}%`), ilike(posts.content, `%${query}%`))
      : undefined,
    activeTag ? arrayContains(posts.tags, [activeTag]) : undefined,
    activeCategory ? eq(posts.category, activeCategory) : undefined,
    isAdmin ? undefined : eq(posts.isPrivate, false),
    isAdmin ? undefined : lte(posts.publishedAt, new Date()),
  ].filter((c): c is SQL => c !== undefined);

  const whereClause: SQL | undefined =
    conditions.length > 0 ? and(...conditions) : undefined;

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
      tags: posts.tags,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      isPrivate: posts.isPrivate,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(whereClause)
    .orderBy(desc(posts.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  // Giscus(GitHub Discussions) 댓글 수: pathname -> count. 5분 캐시.
  const commentCounts = await getCommentCounts();

  function hrefForPage(page: number): string {
    const params = new URLSearchParams();
    if (isSearching) params.set("q", query);
    if (activeTag) params.set("tag", activeTag);
    if (activeCategory) params.set("category", activeCategory);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  // 태그 뱃지 클릭 시 함께 유지할 검색어·카테고리 (태그 자체는 뱃지 쪽에서 채운다).
  const tagLinkExtraParams: Record<string, string> = {};
  if (isSearching) tagLinkExtraParams.q = query;
  if (activeCategory) tagLinkExtraParams.category = activeCategory;

  const activeFilterLabels: string[] = [];
  if (isSearching) activeFilterLabels.push(`‘${query}’ 검색`);
  if (activeTag) activeFilterLabels.push(`태그 ‘${activeTag}’`);
  if (activeCategory) activeFilterLabels.push(categoryLabel(activeCategory));
  const isFiltering = activeFilterLabels.length > 0;

  return (
    <>
      {isFiltering && (
        <p className="text-sm text-fg-muted">
          {activeFilterLabels.join(" · ")} 결과 {totalCount}건
        </p>
      )}

      {pagePosts.length === 0 ? (
        <p className="text-sm text-fg-muted py-8 text-center">
          {isFiltering ? "조건에 맞는 글이 없습니다." : "아직 글이 없습니다."}
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
                  tagExtraParams={tagLinkExtraParams}
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
    </>
  );
}

async function NewPostLink() {
  if (!(await getIsAdmin())) return null;

  return (
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
  );
}

function ListFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-fg-muted">
      <Spinner className="h-10 w-10" />
    </div>
  );
}
