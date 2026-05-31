"use client";

import { useState, useTransition } from "react";
import {
  createPost,
  updatePost,
  type PostFormState,
} from "@/lib/post-actions";
import MarkdownEditor from "@/components/markdown-editor";
import { CATEGORIES } from "@/lib/categories";

type PostFormProps = {
  post?: {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: string;
    thumbnail: string | null;
  };
};

export default function PostForm({ post }: PostFormProps) {
  const isEdit = post !== undefined;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [category, setCategory] = useState<string>(post?.category ?? "");
  const [thumbnail, setThumbnail] = useState<string | null>(
    post?.thumbnail ?? null,
  );
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [state, setState] = useState<PostFormState>({});
  const [isPending, startTransition] = useTransition();

  async function handleThumbnailChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailError(null);
    setUploading(true);
    try {
      const res = await fetch(
        `/api/upload?filename=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          headers: { "content-type": file.type },
          body: file,
        },
      );
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "" }));
        throw new Error(error || "업로드에 실패했습니다.");
      }
      const { url } = (await res.json()) as { url: string };
      setThumbnail(url);
    } catch (err) {
      setThumbnailError(
        err instanceof Error ? err.message : "업로드에 실패했습니다.",
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleSubmit() {
    startTransition(async () => {
      const payload = { title, slug, content, category, thumbnail };
      const result = isEdit
        ? await updatePost(post.id, payload)
        : await createPost(payload);
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
          <p key={msg} className="text-sm text-destructive">{msg}</p>
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
          <p key={msg} className="text-sm text-destructive">{msg}</p>
        ))}
      </div>

      <div className="space-y-1">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="" disabled>카테고리 선택</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        {fieldErrors.category?.map((msg) => (
          <p key={msg} className="text-sm text-destructive">{msg}</p>
        ))}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">썸네일 (선택)</label>
        {thumbnail && (
          <div className="flex items-start gap-3">
            <img
              src={thumbnail}
              alt="썸네일 미리보기"
              className="h-24 w-24 rounded-md object-cover border border-input"
            />
            <button
              type="button"
              onClick={() => setThumbnail(null)}
              className="text-sm text-destructive hover:underline"
            >
              제거
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleThumbnailChange}
          disabled={uploading}
          className="block w-full text-sm"
        />
        {uploading && <p className="text-sm text-muted-foreground">업로드 중…</p>}
        {thumbnailError && <p className="text-sm text-destructive">{thumbnailError}</p>}
        {fieldErrors.thumbnail?.map((msg) => (
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
        disabled={isPending || uploading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {isPending ? "저장 중…" : isEdit ? "수정 완료" : "발행"}
      </button>
    </div>
  );
}