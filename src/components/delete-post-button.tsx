"use client";

import { useTransition } from "react";
import { deletePost } from "@/lib/post-actions";

export default function DeletePostButton({ id }: { id: number }) {
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        startTransition(() => {
            deletePost(id);
        });
    }

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm text-destructive hover:underline disabled:opacity-50"
        >
            {isPending ? "삭제 중..." : "삭제"}
        </button>
    );
}