"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 헤더용 컴팩트 검색바. 어두운 헤더 톤에 맞춰 반투명 입력칸.
// URL 의 q 가 바뀌면 부모(Header) 가 key prop 으로 이 컴포넌트를 새로 마운트해
// useState 초기값이 다시 잡힌다. (effect 로 외부 값을 state 에 복사하지 않는 React 19 패턴)
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
      className="h-8 w-40 sm:w-56 rounded-md border border-white/15 bg-white/10 px-3 text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/30 focus:bg-white/15 transition-colors"
    />
  );
}