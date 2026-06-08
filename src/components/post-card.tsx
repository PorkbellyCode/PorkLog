import Link from "next/link";
import { categoryLabel, defaultThumbnail } from "@/lib/categories";
import DeletePostButton from "@/components/delete-post-button";
import ShareButton from "@/components/share-button";

type PostCardProps = {
  post: {
    id: number;
    slug: string;
    title: string;
    content: string;
    category: string;
    thumbnail: string | null;
    viewCount: number;
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
        "group flex h-full flex-col overflow-hidden rounded-lg border border-border-default bg-bg-default transition-colors hover:border-border-muted" +
        (featured ? " md:col-span-3" : "")
      }
    >
      <div
        className={
          featured
            ? "flex flex-1 flex-col md:grid md:grid-cols-2 md:gap-0"
            : "flex flex-1 flex-col"
        }
      >
        {/* 썸네일: 클릭 시 글로 이동 */}
        <Link href={`/posts/${post.slug}`} className="block aspect-video shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </Link>

        {/* 텍스트 영역 */}
        <div
          className={
            "flex flex-1 flex-col gap-2 p-4" +
            (featured ? " md:p-6 md:justify-center" : "")
          }
        >
          <p className="text-xs text-fg-muted">
            {categoryLabel(post.category)}
          </p>

          {/* 제목: 클릭 시 글로 이동 */}
          <Link href={`/posts/${post.slug}`}>
            <h2
              className={
                "font-semibold text-fg-default group-hover:text-accent-fg transition-colors " +
                (featured ? "text-2xl md:text-3xl" : "text-base")
              }
            >
              {post.title}
            </h2>
          </Link>

          <p
            className={
              "text-fg-muted " +
              (featured ? "text-base line-clamp-3" : "text-sm line-clamp-2")
            }
          >
            {preview}
          </p>

          {/* 날짜 줄: 좌측 날짜 + 우측 액션 버튼 (mt-auto 로 카드 하단 고정) */}
          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-fg-muted">
              <time>{post.createdAt.toLocaleDateString("ko-KR")}</time>
              <span
                className="inline-flex items-center gap-1"
                title={`조회 ${post.viewCount.toLocaleString("ko-KR")}`}
              >
                {/* Octicon: eye */}
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.831.88 9.577.43 8.899a1.62 1.62 0 0 1 0-1.798c.45-.678 1.367-1.932 2.637-3.023C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z" />
                </svg>
                {post.viewCount.toLocaleString("ko-KR")}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <ShareButton slug={post.slug} title={post.title} />
              {isAdmin && (
                <>
                  <Link
                    href={`/posts/edit/${post.id}`}
                    aria-label="수정"
                    title="수정"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:bg-fg-default/5 hover:text-fg-default transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      width="16"
                      height="16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z" />
                    </svg>
                  </Link>
                  <DeletePostButton id={post.id} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}