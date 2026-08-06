import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="text-center">
        <p className="text-sm font-semibold text-fg-muted">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg-default sm:text-4xl">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-3 text-sm text-fg-muted">
          주소가 변경되었거나 삭제된 글일 수 있습니다.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-accent-fg px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-fg/90"
        >
          {/* Octicon: arrow-left */}
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L4.81 7.25h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
          </svg>
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
