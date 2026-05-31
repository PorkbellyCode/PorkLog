import Link from "next/link";
import { categoryLabel, defaultThumbnail } from "@/lib/categories";
import DeletePostButton from "@/components/delete-post-button";

type PostCardProps = {
  post: {
    id: number;
    slug: string;
    title: string;
    content: string;
    category: string;
    thumbnail: string | null;
    createdAt: Date;
  };
  preview: string;
  // 가장 최신 글: 3열 폭의 큰 카드.
  featured?: boolean;
  isAdmin?: boolean;
};

export default function PostCard({
  post,
  preview,
  featured,
  isAdmin,
}: PostCardProps) {
  const imageSrc = post.thumbnail ?? defaultThumbnail(post.category);

  return (
    <div
      className={
        "group overflow-hidden rounded-lg border border-border-default bg-bg-default transition-colors hover:border-border-muted" +
        (featured ? " md:col-span-3" : "")
      }
    >
      <Link href={`/posts/${post.slug}`} className="block">
        <div className={featured ? "grid md:grid-cols-2 gap-0" : "block"}>
          {/* 썸네일 */}
          <div
            className={
              featured
                ? "aspect-video md:aspect-auto md:h-full"
                : "aspect-video"
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* 텍스트 영역 */}
          <div
            className={
              "flex flex-col gap-2 p-4" +
              (featured ? " md:p-6 md:justify-center" : "")
            }
          >
            <p className="text-xs text-fg-muted">
              {categoryLabel(post.category)}
            </p>
            <h2
              className={
                "font-semibold text-fg-default group-hover:text-accent-fg transition-colors " +
                (featured ? "text-2xl md:text-3xl" : "text-base")
              }
            >
              {post.title}
            </h2>
            <p
              className={
                "text-fg-muted " +
                (featured ? "text-base line-clamp-3" : "text-sm line-clamp-2")
              }
            >
              {preview}
            </p>
            <time className="text-xs text-fg-muted mt-auto">
              {post.createdAt.toLocaleDateString("ko-KR")}
            </time>
          </div>
        </div>
      </Link>

      {isAdmin && (
        <div className="flex items-center justify-end gap-4 border-t border-border-default px-4 py-2">
          <Link
            href={`/posts/edit/${post.id}`}
            className="text-sm text-fg-muted hover:text-fg-default hover:underline"
          >
            수정
          </Link>
          <DeletePostButton id={post.id} />
        </div>
      )}
    </div>
  );
}
