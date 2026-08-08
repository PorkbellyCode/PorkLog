"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// 컨텐츠 영역용 검색바. Primer 토큰 기반.
// URL 의 q 가 바뀌면 부모가 key prop 으로 이 컴포넌트를 새로 마운트해
// useState 초기값이 다시 잡힌다. (React 19 패턴)
export default function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit() {
    const trimmed = query.trim();
    // 기존 tag/category 파라미터는 유지하고 q 만 갱신 (동시 필터링 지원).
    // 필터가 바뀌므로 page 는 초기화한다.
    const params = new URLSearchParams(searchParams);
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <input
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSubmit();
      }}
      placeholder="검색"
      aria-label="검색"
      className="h-8 w-36 sm:w-48 rounded-md border border-border-default bg-bg-default px-3 text-sm text-fg-default placeholder:text-fg-muted focus:outline-none focus:border-accent-fg transition-colors"
    />
  );
}