import type { TocItem } from "@/lib/toc";

export default function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;

  return (
    <details
      open
      className="mb-8 rounded-lg border border-border-default bg-bg-subtle px-4 py-3"
    >
      <summary className="cursor-pointer list-none text-sm font-semibold text-fg-default marker:content-none">
        <span className="inline-flex items-center gap-1.5">
          {/* Octicon: list-unordered */}
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M5.75 2.5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5Zm0 5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5Zm0 5h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5ZM2 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
          </svg>
          목차
        </span>
      </summary>

      <nav className="mt-3">
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id} className={item.depth === 3 ? "pl-4" : undefined}>
              <a
                href={`#${item.id}`}
                className="text-sm text-fg-muted transition-colors hover:text-accent-fg"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
