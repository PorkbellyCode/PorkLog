"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog } from "radix-ui";

// 작성 중인 내용이 있을 때(when) 페이지 이탈을 확인 모달로 한 번 막는다.
// - 새로고침·탭 닫기·외부 사이트 이동: beforeunload. 브라우저 기본 창만 뜨고 문구는 못 바꾼다.
// - 브라우저 뒤로가기(마우스 뒤로 버튼·스와이프 포함): App Router 에는 이동을 막는 API 가 없어서,
//   현재 URL 로 history 항목을 하나 더 쌓아 두고 뒤로가기로 빠지면 다시 쌓은 뒤 모달을 띄운다.
// - 사이트 내부 링크 클릭: Next Link 보다 먼저 캡처 단계에서 가로챈다.
export default function LeaveGuard({ when }: { when: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const whenRef = useRef(when);
  const armedRef = useRef(false);
  const leavingRef = useRef(false);
  // 새 탭·북마크로 바로 들어와 돌아갈 이전 페이지가 없는 경우. 이때는 홈으로 보낸다.
  const directEntryRef = useRef(false);
  // 링크 클릭으로 모달이 열렸을 때의 목적지. null 이면 뒤로가기로 열린 것.
  const pendingHrefRef = useRef<string | null>(null);

  useEffect(() => {
    whenRef.current = when;
  }, [when]);

  // 처음으로 변경이 생겼을 때 한 번만 history 항목을 쌓는다.
  useEffect(() => {
    if (!when || armedRef.current) return;
    armedRef.current = true;
    directEntryRef.current = window.history.length === 1;
    window.history.pushState(null, "", window.location.href);
  }, [when]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!whenRef.current || leavingRef.current) return;
      e.preventDefault();
      e.returnValue = ""; // Safari 등 구형 동작 대응
    }

    function handlePopState() {
      if (!armedRef.current || leavingRef.current) return;
      // 변경을 전부 되돌린 상태라면 막지 않고 한 칸 더 뒤로 간다.
      if (!whenRef.current) {
        leavingRef.current = true;
        if (directEntryRef.current) router.replace("/");
        else window.history.back();
        return;
      }
      window.history.pushState(null, "", window.location.href);
      pendingHrefRef.current = null;
      setOpen(true);
    }

    function handleClick(e: MouseEvent) {
      if (!whenRef.current) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest("a");
      if (!anchor || !anchor.href || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;
      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) return; // 외부 링크는 beforeunload 가 처리
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return; // 같은 페이지 안의 앵커 이동
      }
      e.preventDefault();
      e.stopPropagation();
      pendingHrefRef.current = url.pathname + url.search + url.hash;
      setOpen(true);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleClick, true);
    };
  }, [router]);

  function handleLeave() {
    leavingRef.current = true;
    const href = pendingHrefRef.current;
    if (href) {
      // 쌓아 둔 history 항목을 목적지로 교체해서 뒤로가기 기록이 원래와 같게 남도록 한다.
      router.replace(href);
    } else if (directEntryRef.current) {
      router.replace("/");
    } else {
      window.history.go(-2); // 쌓아 둔 항목 + 작성 페이지를 건너뛴다.
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border-default bg-bg-default p-6 shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
          <AlertDialog.Title className="text-base font-semibold text-fg-default">
            작성 중인 내용이 있어요
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-fg-muted">
            페이지를 나가면 저장하지 않은 내용이 사라집니다.
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="inline-flex h-9 cursor-pointer items-center rounded-md border border-border-default bg-bg-default px-3 text-sm font-medium text-fg-default hover:bg-fg-default/5 transition-colors"
              >
                계속 작성
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={handleLeave}
                className="inline-flex h-9 cursor-pointer items-center rounded-md bg-danger-fg px-3 text-sm font-medium text-white hover:bg-danger-fg/90 transition-colors"
              >
                나가기
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
