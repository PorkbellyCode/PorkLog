import Link from "next/link";

// 단순 페이징: 이전 / 1 2 3 / 다음.
type PaginationProps = {
  currentPage: number;
  totalPages: number;
  // 현재 URL 의 다른 쿼리(category, q)를 보존하기 위해 호출자가 만들어 넘긴다.
  hrefForPage: (page: number) => string;
};

export default function Pagination({
  currentPage,
  totalPages,
  hrefForPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  const baseBtn =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-border-default px-2 text-sm";
  const enabled = "text-fg-default hover:bg-bg-subtle";
  const disabled = "text-fg-muted opacity-50 pointer-events-none";
  const active = "bg-bg-subtle font-semibold";

  return (
    <nav
      aria-label="페이지 이동"
      className="flex items-center justify-center gap-1"
    >
      <Link
        href={hrefForPage(currentPage - 1)}
        aria-label="이전 페이지"
        title="이전 페이지"
        className={`${baseBtn} ${currentPage <= 1 ? disabled : enabled}`}
      >
        {/* Octicon: chevron-left */}
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L6.06 8l3.72 3.72a.75.75 0 0 1 0 1.06Z" />
        </svg>
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefForPage(p)}
          aria-current={p === currentPage ? "page" : undefined}
          className={`${baseBtn} ${p === currentPage ? active : enabled}`}
        >
          {p}
        </Link>
      ))}
      <Link
        href={hrefForPage(currentPage + 1)}
        aria-label="다음 페이지"
        title="다음 페이지"
        className={`${baseBtn} ${currentPage >= totalPages ? disabled : enabled}`}
      >
        {/* Octicon: chevron-right */}
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </Link>
    </nav>
  );
}