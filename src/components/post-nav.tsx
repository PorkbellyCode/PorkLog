import Link from "next/link";

type Neighbor = { slug: string; title: string } | null;

// 작성일 기준 인접 글. prev = 더 오래된 글, next = 더 최신 글.
export default function PostNav({
  prev,
  next,
}: {
  prev: Neighbor;
  next: Neighbor;
}) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 grid grid-cols-1 gap-3 border-t border-border-default pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/posts/${prev.slug}`}
          className="group rounded-lg border border-border-default p-4 transition-colors hover:border-border-muted hover:bg-bg-subtle"
        >
          <span className="text-xs text-fg-muted">← 이전 글</span>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-fg-default group-hover:text-accent-fg">
            {prev.title}
          </p>
        </Link>
      ) : (
        <span />
      )}

      {next && (
        <Link
          href={`/posts/${next.slug}`}
          className="group rounded-lg border border-border-default p-4 text-right transition-colors hover:border-border-muted hover:bg-bg-subtle"
        >
          <span className="text-xs text-fg-muted">다음 글 →</span>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-fg-default group-hover:text-accent-fg">
            {next.title}
          </p>
        </Link>
      )}
    </nav>
  );
}
