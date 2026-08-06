"use client";

// Resume 페이지 전용. 브라우저 인쇄 대화상자를 띄워 "PDF로 저장"을 유도한다.
// 별도 PDF 생성 라이브러리 없이 print 스타일만으로 처리한다.
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-sm text-fg-default transition-colors hover:bg-bg-subtle print:hidden"
    >
      {/* Octicon: download */}
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z" />
        <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z" />
      </svg>
      PDF로 저장
    </button>
  );
}
