"use client";

import { useState, useTransition } from "react";
import { createPost, type CreatePostState } from "@/lib/post-actions";
import MarkdownEditor from "@/components/markdown-editor";
import { map } from "zod";

export default function PostForm() {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [state, setState] = useState<CreatePostState>({});
    const [isPending, startTransition] = useTransition();

    function handleSubmit() { 
        startTransition(async () => {
            const result = await createPost({ title, slug, content });
            // 성공 시 서버 액션이 redirect한다.
            // 만약 돌아왔다면, 검증 실패 또는 slug 중복 case 이므로 에러를 보여준다.
            setState(result);
        });
    }

    const fieldErrors = state.fieldErrors || {};

    return (
        <div className="w-full max-w-2xl space-y-4">
            <h1 className="text-xl font-semibold">새 글 작성</h1>

            <div className="space-y-1">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                {fieldErrors.title?.map((msg) => (
                    <p key={msg} className="text-sm text-destructive">{msg}</p>
                ))}
            </div>

            <div className="space-y-1">
                <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="slug (예 : my-first-post)"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                {fieldErrors.slug?.map((msg) => (
                    <p key={msg} className="text-sm text-destructive">{msg}</p>
                ))}
            </div>

            <div className="space-y-1">
                <MarkdownEditor value={content} onChange={setContent} />
                {fieldErrors.content?.map((msg) => (
                    <p key={msg} className="text-sm text-destructive">{msg}</p>
                ))}
            </div>

            {state.formError && (
                <p className="text-sm text-destructive">{state.formError}</p>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
                {isPending ? "저장 중..." : "저장"}
            </button>
        </div>
    );
}