"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
  const [isDragging, setIsDragging] = useState(false);
  const [state, setState] = useState<PostFormState>({});
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // input(파일 선택) 과 드래그앤드롭이 공유하는 업로드 로직.
  async function uploadThumbnail(file: File) {
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
    }
  }

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadThumbnail(file);
    e.target.value = ""; // 같은 파일 다시 선택해도 onChange 가 발火하도록 초기화
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadThumbnail(file);
  }

  function handleBack() {
    // 폼 화면은 보통 홈/상세에서 진입하므로 직전 화면으로 복귀.
    // 단, history 가 없는 직진입(북마크·새 탭) 대비로 홈 폴백.
    if (window.history.length > 1) router.back();
    else router.push("/");
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

  const inputClass =
    "w-full h-11 rounded-md border border-border-default bg-bg-default px-3 text-sm text-fg-default placeholder:text-fg-muted focus:border-accent-fg focus:outline-none focus:ring-2 focus:ring-accent-fg/30 transition-colors";

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-fg-default">
          {isEdit ? "글 수정" : "새 글 작성"}
        </h1>
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로"
          title="뒤로"
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-fg-muted hover:bg-fg-default/5 hover:text-fg-default transition-colors"
        >
          {/* Octicon: arrow-left */}
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L4.81 7.25h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
          </svg>
        </button>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-fg-default">
          제목 <span className="text-danger-fg">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className={inputClass}
        />
        {fieldErrors.title?.map((msg) => (
          <p key={msg} className="text-sm text-danger-fg">{msg}</p>
        ))}
      </div>

      {/* 슬러그 + 카테고리: 모바일 1열, sm 이상 2열 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-fg-default">
            슬러그 <span className="text-danger-fg">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug (예: my-first-post)"
            className={inputClass}
          />
          {fieldErrors.slug?.map((msg) => (
            <p key={msg} className="text-sm text-danger-fg">{msg}</p>
          ))}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-fg-default">
            카테고리 <span className="text-danger-fg">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>카테고리 선택</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          {fieldErrors.category?.map((msg) => (
            <p key={msg} className="text-sm text-danger-fg">{msg}</p>
          ))}
        </div>
      </div>

      {/* 본문: 화면의 주 영역 */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-fg-default">
          본문 <span className="text-danger-fg">*</span>
        </label>
        <MarkdownEditor value={content} onChange={setContent} />
        {fieldErrors.content?.map((msg) => (
          <p key={msg} className="text-sm text-danger-fg">{msg}</p>
        ))}
      </div>

      {/* 썸네일: 본문 아래로 이동 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-fg-default">썸네일</label>

        {thumbnail && (
          <div className="flex items-start gap-3">
            <img
              src={thumbnail}
              alt="썸네일 미리보기"
              className="h-24 w-24 rounded-md object-cover border border-border-default"
            />
            <button
              type="button"
              onClick={() => setThumbnail(null)}
              className="text-sm text-danger-fg hover:underline"
            >
              제거
            </button>
          </div>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploading) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={
            "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-8 text-center transition-colors " +
            (isDragging
              ? "border-accent-fg bg-accent-fg/5"
              : "border-border-default bg-bg-subtle")
          }
        >
          <p className="text-sm text-fg-muted">
            {thumbnail
              ? "다른 이미지로 교체하려면 여기에 드래그"
              : "이미지를 여기로 드래그하세요"}
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-md border border-border-default bg-bg-default px-3 py-1.5 text-sm font-medium text-fg-default hover:bg-fg-default/5 disabled:opacity-50 transition-colors"
          >
            파일 선택
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleThumbnailChange}
            disabled={uploading}
            className="hidden"
          />
        </div>

        {uploading && <p className="text-sm text-fg-muted">업로드 중…</p>}
        {thumbnailError && <p className="text-sm text-danger-fg">{thumbnailError}</p>}
        {fieldErrors.thumbnail?.map((msg) => (
          <p key={msg} className="text-sm text-danger-fg">{msg}</p>
        ))}
      </div>

      {state.formError && (
        <p className="text-sm text-danger-fg">{state.formError}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || uploading}
        className="rounded-md bg-accent-fg px-4 py-2 text-sm font-medium text-white hover:bg-accent-fg/90 disabled:opacity-50 transition-colors"
      >
        {isPending ? "저장 중…" : "저장"}
      </button>
    </div>
  );
}