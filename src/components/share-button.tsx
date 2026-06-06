"use client";

import { useState } from "react";

// 글 단위 공유 버튼.
// 모바일 등 navigator.share 지원 환경: 네이티브 공유 시트.
// 미지원(주로 데스크톱): 클립보드 복사 + "복사됨" 피드백.
export default function ShareButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    // 카드 등 상위 링크로의 전파/기본 이동 차단
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/posts/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // 사용자가 공유 시트를 닫은 경우 등은 조용히 무시
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 접근 실패 시에도 조용히 무시
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="공유"
      title={copied ? "복사됨" : "공유"}
      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-fg-muted hover:bg-fg-default/5 hover:text-fg-default transition-colors"
    >
      {copied ? (
        // Octicon: check
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
        </svg>
      ) : (
        // Octicon: paper-airplane (종이비행기)
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M1.592 2.712 14.038 7.4a.75.75 0 0 1 0 1.4L1.592 13.488a.75.75 0 0 1-1.005-.886L1.79 8.25H7.5a.25.25 0 0 0 0-.5H1.79L.587 3.598a.75.75 0 0 1 1.005-.886Z" />
        </svg>
      )}
    </button>
  );
}