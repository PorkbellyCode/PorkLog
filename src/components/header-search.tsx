"use client";

import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/search-bar";

// URL 의 q 를 읽어 SearchBar 의 key 와 initialQuery 로 넘긴다.
// key 가 바뀌면 SearchBar 가 새로 마운트되면서 useState 초기값이 갱신된다.
export default function HeaderSearch() {
  const q = useSearchParams().get("q") ?? "";
  return <SearchBar key={q} initialQuery={q} />;
}