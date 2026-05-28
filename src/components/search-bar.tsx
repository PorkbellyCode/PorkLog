"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ initialQuery }: { initialQuery: string }) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);

    function handleSubmit() {
        const trimmed = query.trim();
        // 검색어가 있으면 ?q= 로, 없으면 전체 검색
        router.push(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
    }

    return (
        <div className="flex gap-2">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
                }}
                placeholder="제목 검색"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
                type="button"
                onClick={handleSubmit}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
                검색
            </button>
        </div>
    );
}