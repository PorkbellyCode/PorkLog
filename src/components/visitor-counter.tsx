"use client";

import { useEffect, useState } from "react";

type Stats = { today: number; total: number };

export default function VisitorCounter() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/visit", { method: "POST" })
      .then((r) => r.json())
      .then((data: Stats) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // 로딩 중엔 레이아웃 안 흔들리게 자리만 비워둔다.
  if (!stats) return <span className="tabular-nums">방문자 집계 중…</span>;

  return (
    <span className="tabular-nums">
      오늘 {stats.today.toLocaleString("ko-KR")} · 누적{" "}
      {stats.total.toLocaleString("ko-KR")}
    </span>
  );
}