import Link from "next/link";

type SeriesPost = { slug: string; title: string };

// 같은 시리즈에 속한 글 목록. 현재 글은 링크 대신 강조 표시한다.
export default function SeriesNav({
  series,
  entries,
  currentSlug,
}: {
  series: string;
  entries: SeriesPost[];
  currentSlug: string;
}) {
  if (entries.length < 2) return null;

  const currentIndex = entries.findIndex((e) => e.slug === currentSlug);

  return (
    <section className="mb-8 rounded-lg border border-border-default bg-bg-subtle px-4 py-3">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-fg-default">
        {/* Octicon: stack */}
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M7.122.392a1.75 1.75 0 0 1 1.756 0l5.003 2.902c.83.481.83 1.68 0 2.162L8.878 8.358a1.75 1.75 0 0 1-1.756 0L2.119 5.456a1.25 1.25 0 0 1 0-2.162ZM8.125 1.69a.248.248 0 0 0-.25 0l-4.63 2.685 4.63 2.685a.248.248 0 0 0 .25 0l4.63-2.685ZM1.601 7.789a.75.75 0 0 1 1.025-.273l5.249 3.044a.248.248 0 0 0 .25 0l5.249-3.044a.75.75 0 0 1 .752 1.298l-5.248 3.044a1.75 1.75 0 0 1-1.756 0L1.874 8.814A.75.75 0 0 1 1.6 7.789Zm0 3.5a.75.75 0 0 1 1.025-.273l5.249 3.044a.248.248 0 0 0 .25 0l5.249-3.044a.75.75 0 0 1 .752 1.298l-5.248 3.044a1.75 1.75 0 0 1-1.756 0l-5.248-3.044a.75.75 0 0 1-.273-1.025Z" />
        </svg>
        {series}
        <span className="font-normal text-fg-muted">
          ({currentIndex + 1}/{entries.length})
        </span>
      </p>

      <ol className="mt-3 space-y-1.5">
        {entries.map((entry, i) => {
          const isCurrent = entry.slug === currentSlug;
          return (
            <li key={entry.slug} className="flex gap-2 text-sm">
              <span className="shrink-0 tabular-nums text-fg-muted">{i + 1}.</span>
              {isCurrent ? (
                <span className="font-semibold text-fg-default">{entry.title}</span>
              ) : (
                <Link
                  href={`/posts/${entry.slug}`}
                  className="text-fg-muted transition-colors hover:text-accent-fg"
                >
                  {entry.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
