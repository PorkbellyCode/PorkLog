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
        className={`${baseBtn} ${currentPage <= 1 ? disabled : enabled}`}
      >
        이전
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
        className={`${baseBtn} ${currentPage >= totalPages ? disabled : enabled}`}
      >
        다음
      </Link>
    </nav>
  );
}