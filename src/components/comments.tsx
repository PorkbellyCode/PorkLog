"use client";

import { useSyncExternalStore } from "react";
import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

// 사이트 마운트 후에만 Giscus 를 그려서 hydration mismatch 와
// 초기 렌더 시 잘못된 테마로 마운트되는 깜빡임을 함께 막는다.
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function Comments() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  // 마운트 전엔 자리만 비워둔다 (Giscus 가 잘못된 테마로 마운트 후
  // 재마운트되며 깜빡이는 걸 방지).
  if (!mounted) return <div aria-hidden className="min-h-[200px]" />;

  return (
    <Giscus
      repo="PorkbellyCode/PorkLog"
      repoId="R_kgDOSkixxg"
      category="Announcements"
      categoryId="DIC_kwDOSkixxs4C97_r"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      lang="ko"
      loading="lazy"
    />
  );
}