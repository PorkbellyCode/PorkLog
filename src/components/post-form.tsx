"use client";

import { useState, useTransition } from "react";
import { createPost, updatePost, type PostFormState, } from "@/lib/post-actions";
import MarkdownEditor from "@/components/markdown-editor";
import { CATEGORIES, DEFAULT_CATEGORY } from "@/lib/categories";

type PostFormProps = {
  // 수정 모드일 때만 전달된다. 없으면 작성 모드.
  post?: {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: string;
  };
};
export default function PostForm({ post }: PostFormProps) {
  const isEdit = post !== undefined;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [category, setCategory] = useState(post?.category ?? DEFAULT_CATEGORY);
  const [state, setState] = useState<PostFormState>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const result = isEdit
        ? await updatePost(post.id, { title, slug, content, category })
        : await createPost({ title, slug, content, category });
      // 성공 시 서버 액션이 redirect 하므로 여기로 돌아오지 않는다.
      // 돌아왔다면 검증 실패 또는 slug 중복이다.
      setState(result);
    });
  }

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <div className="w-full max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">
        {isEdit ? "글 수정" : "새 글 작성"}
      </h1>

      <div className="space-y-1">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {fieldErrors.title?.map((msg) => (
          <p key={msg} className="text-sm text-destructive">
            {msg}
          </p>
        ))}
      </div>

      <div className="space-y-1">
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug (예: my-first-post)"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {fieldErrors.slug?.map((msg) => (
          <p key={msg} className="text-sm text-destructive">
            {msg}
          </p>
        ))}
      </div>

      <div className="space-y-1">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {fieldErrors.category?.map((msg) => (
          <p key={msg} className="text-sm text-destructive">
            {msg}
          </p>
        ))}
      </div>

      <div className="space-y-1">
        <MarkdownEditor value={content} onChange={setContent} />
        {fieldErrors.content?.map((msg) => (
          <p key={msg} className="text-sm text-destructive">
            {msg}
          </p>
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
        {isPending ? "저장 중…" : isEdit ? "수정 완료" : "발행"}
      </button>
    </div>
  );
}