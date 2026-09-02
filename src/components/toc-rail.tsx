"use client";

import { useEffect, useRef, useState } from "react";
import type { TocItem } from "@/lib/toc";

// 헤더(h-14=56px) 아래 여유를 둔 기준선. 이 선 위에 있는 마지막 헤딩을 active로 본다.
const SCAN_LINE = 96;

export default function TocRail({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const ticking = useRef(false);

  useEffect(() => {
    if (items.length < 2) return;

    function updateActive() {
      ticking.current = false;
      let current = items[0]?.id ?? null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el || el.getBoundingClientRect().top > SCAN_LINE) break;
        current = item.id;
      }
      setActiveId(current);
    }

    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(updateActive);
    }

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <div className="group fixed right-2 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
      {/* 접힌 상태: 짧은 가로 눈금들 */}
      <ul className="flex flex-col items-end gap-1.5 group-hover:invisible group-focus-within:invisible">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-label={item.text}
                className={`block h-0.5 rounded-full transition-all ${
                  isActive
                    ? "w-6 bg-fg-default"
                    : item.depth === 3
                      ? "w-2.5 bg-fg-muted/40 hover:bg-fg-muted"
                      : "w-4 bg-fg-muted/40 hover:bg-fg-muted"
                }`}
              />
            </li>
          );
        })}
      </ul>

      {/* 펼친 상태: 목차 텍스트 패널 */}
      <nav className="absolute right-0 top-1/2 hidden max-h-[70vh] w-56 -translate-y-1/2 overflow-y-auto rounded-lg border border-border-default bg-bg-subtle p-3 shadow-lg group-hover:block group-focus-within:block">
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id} className={item.depth === 3 ? "pl-4" : undefined}>
              <a
                href={`#${item.id}`}
                className={`block text-sm transition-colors hover:text-accent-fg ${
                  item.id === activeId ? "font-medium text-accent-fg" : "text-fg-muted"
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
