"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 컨텐츠 영역용 검색바. Primer 토큰 기반.
// URL 의 q 가 바뀌면 부모가 key prop 으로 이 컴포넌트를 새로 마운트해
// useState 초기값이 다시 잡힌다. (React 19 패턴)
export default function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit() {
    const trimmed = query.trim();
    router.push(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
  }

  return (
    <input
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSubmit();
      }}
      placeholder="제목 검색"
      aria-label="제목 검색"
      className="h-8 w-36 sm:w-48 rounded-md border border-border-default bg-bg-default px-3 text-sm text-fg-default placeholder:text-fg-muted focus:outline-none focus:border-accent-fg transition-colors"
    />
  );
}