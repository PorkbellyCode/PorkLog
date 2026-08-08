import Link from "next/link";

type TagBadgesProps = {
  tags: string[];
  // 지정 안 하면 전체 노출 (상세 페이지용)
  max?: number;
};

const tagClass =
  "inline-flex items-center rounded-md border border-accent-fg/20 bg-accent-fg/15 px-2.5 py-1 text-sm text-accent-fg transition-colors hover:bg-accent-fg/25";

export default function TagBadges({ tags, max }: TagBadgesProps) {
  if (tags.length === 0) return null;

  const visible = max ? tags.slice(0, max) : tags;
  const hiddenCount = max ? Math.max(0, tags.length - max) : 0;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((tag) => (
        <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`} className={tagClass}>
          {tag}
        </Link>
      ))}
      {hiddenCount > 0 && (
        <span className="inline-flex items-center rounded-md border border-border-default bg-bg-subtle px-2.5 py-1 text-sm text-fg-muted">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}