"use client";

import { toast } from "sonner";
import { EMAIL, GITHUB_URL, SITE_URL } from "@/lib/site";

// 홈 히어로의 연락처 링크와 같은 형식. 인쇄를 감안해 크기만 한 단계 크게 둔다.
const chipClass =
  "inline-flex cursor-pointer items-center gap-1.5 font-mono text-sm text-fg-muted transition-colors hover:text-accent-fg";

const LINKS = [
  {
    label: "블로그",
    href: SITE_URL,
    display: "porklog.dev",
    external: true,
    path: "M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25Zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0Z",
  },
  {
    label: "GitHub",
    href: GITHUB_URL,
    display: "github.com/PorkbellyCode",
    external: true,
    path: "M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z",
  },
];

// 이메일은 mailto 대신 클릭 시 클립보드에 복사한다.
function EmailChip() {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      toast.success("이메일 주소가 복사되었습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };
  return (
    <button type="button" onClick={copy} className={chipClass}>
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="currentColor"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M1.75 2A1.75 1.75 0 0 0 0 3.75v8.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25v-8.5A1.75 1.75 0 0 0 14.25 2Zm12.5 1.5a.25.25 0 0 1 .25.25v.852l-6 3.96-6-3.96V3.75a.25.25 0 0 1 .25-.25ZM1.5 5.81v6.44c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.81l-5.815 3.84a.75.75 0 0 1-.87 0Z" />
      </svg>
      {EMAIL}
    </button>
  );
}

export default function ContactLinks() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
      {LINKS.map((c) => (
        <a
          key={c.label}
          href={c.href}
          {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
          className={chipClass}
        >
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="currentColor"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d={c.path} />
          </svg>
          {c.display}
        </a>
      ))}
      <EmailChip />
    </div>
  );
}
