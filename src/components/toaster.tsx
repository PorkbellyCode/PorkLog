"use client";

import type { CSSProperties } from "react";
import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

// sonner 는 자체 팔레트·폰트 스택·radius 를 CSS 변수로 들고 있다.
// 그 변수들을 사이트 토큰으로 갈아끼워 톤을 맞춘다.
// 값이 --bg-default 같은 사이트 토큰을 가리키므로 라이트/다크는 자동으로 따라온다.
const TOAST_STYLE = {
  // sonner 는 font-family 를 직접 박아둬서(상속 안 함) 여기서 덮어야 한다.
  fontFamily: "var(--font-sans)",
  "--normal-bg": "var(--bg-default)",
  "--normal-text": "var(--fg-default)",
  "--normal-border": "var(--border-default)",
  "--normal-bg-hover": "var(--bg-subtle)",
  "--normal-border-hover": "var(--border-default)",
  "--border-radius": "var(--radius)",
  // 닫기 버튼이 참조하는 sonner 회색 스케일.
  "--gray2": "var(--bg-subtle)",
  "--gray4": "var(--border-default)",
  "--gray12": "var(--fg-muted)",
} as CSSProperties;

export default function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="top-right"
      closeButton
      style={TOAST_STYLE}
    />
  );
}
