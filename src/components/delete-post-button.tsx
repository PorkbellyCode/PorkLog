"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog } from "radix-ui";
import { toast } from "sonner";
import { deletePost } from "@/lib/post-actions";

export default function DeletePostButton({ id }: { id: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deletePost(id);
      if (result.ok) {
        toast.success("글을 삭제했습니다.");
        router.push("/");
        router.refresh();
      }
    });
  }

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button
          type="button"
          disabled={isPending}
          aria-label="삭제"
          title="삭제"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-fg-muted hover:bg-danger-fg/10 hover:text-danger-fg transition-colors disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
          </svg>
        </button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border-default bg-bg-default p-6 shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
          <AlertDialog.Title className="text-base font-semibold text-fg-default">
            글을 삭제할까요?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-fg-muted">
            이 작업은 되돌릴 수 없습니다. 글과 연결된 썸네일도 함께 삭제됩니다.
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="inline-flex h-9 cursor-pointer items-center rounded-md border border-border-default bg-bg-default px-3 text-sm font-medium text-fg-default hover:bg-fg-default/5 transition-colors"
              >
                취소
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex h-9 cursor-pointer items-center rounded-md bg-danger-fg px-3 text-sm font-medium text-white hover:bg-danger-fg/90 transition-colors"
              >
                삭제
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}