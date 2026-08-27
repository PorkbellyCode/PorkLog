import Link from "next/link";

type TagBadgesProps = {
  tags: string[];
  // 지정 안 하면 전체 노출 (상세 페이지용)
  max?: number;
  // 현재 활성화된 검색어·카테고리 등 태그 클릭 시 함께 유지할 파라미터
  extraParams?: Record<string, string>;
};

const tagClass =
  "text-sm text-accent-fg transition-colors hover:underline hover:underline-offset-4";

function tagHref(tag: string, extraParams?: Record<string, string>): string {
  const params = new URLSearchParams(extraParams);
  params.set("tag", tag);
  return `/?${params.toString()}`;
}

export default function TagBadges({ tags, max, extraParams }: TagBadgesProps) {
  if (tags.length === 0) return null;

  const visible = max ? tags.slice(0, max) : tags;
  const hiddenCount = max ? Math.max(0, tags.length - max) : 0;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {visible.map((tag) => (
        <Link key={tag} href={tagHref(tag, extraParams)} className={tagClass}>
          #{tag}
        </Link>
      ))}
      {hiddenCount > 0 && (
        <span className="text-sm text-fg-muted">+{hiddenCount}</span>
      )}
    </div>
  );
}