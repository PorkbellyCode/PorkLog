"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

// mounted 여부를 useSyncExternalStore 로 표현.
// - 서버 / 첫 클라이언트 렌더: getServerSnapshot() => false
// - 마운트 후 클라이언트 렌더: getSnapshot() => true
// 이로써 hydration mismatch 없이, useEffect+setState 없이 "마운트 가드"를 만든다.
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  // 자리 차지를 위한 동일 크기 플레이스홀더
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="테마 전환"
        className="fixed top-4 right-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-md border border-default bg-subtle"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="fixed top-4 right-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-md border border-default bg-subtle text-default hover:bg-muted transition-colors"
    >
      {isDark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8 0a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V.75A.75.75 0 0 1 8 0Zm0 13a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 13ZM2.343 2.343a.75.75 0 0 1 1.06 0l1.061 1.06a.75.75 0 0 1-1.06 1.061l-1.06-1.06a.75.75 0 0 1 0-1.06Zm9.193 9.193a.75.75 0 0 1 1.06 0l1.061 1.06a.75.75 0 0 1-1.06 1.061l-1.061-1.06a.75.75 0 0 1 0-1.061ZM16 8a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 16 8Zm-13 0a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 3 8Zm10.657-5.657a.75.75 0 0 1 0 1.06l-1.061 1.061a.75.75 0 1 1-1.06-1.06l1.06-1.061a.75.75 0 0 1 1.06 0Zm-9.193 9.193a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 1 1-1.061-1.06l1.06-1.061a.75.75 0 0 1 1.061 0Z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.598 1.591a.749.749 0 0 1 .785-.175 7.001 7.001 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96 5.5 5.5 0 0 0 7.046-7.046.75.75 0 0 1 .175-.786Zm1.616 1.945a7 7 0 0 1-7.678 7.678 5.499 5.499 0 1 0 7.678-7.678Z" />
        </svg>
      )}
    </button>
  );
}