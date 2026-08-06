"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="text-center">
        <p className="text-sm font-semibold text-danger-fg">Error</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg-default sm:text-4xl">
          문제가 발생했습니다
        </h1>
        <p className="mt-3 text-sm text-fg-muted">
          잠시 후 다시 시도해주세요. 문제가 계속되면 알려주시면 감사하겠습니다.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-fg-muted">
            오류 코드: {error.digest}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-md bg-accent-fg px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-fg/90"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-border-default px-4 py-2 text-sm font-medium text-fg-default transition-colors hover:bg-fg-default/5"
          >
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
