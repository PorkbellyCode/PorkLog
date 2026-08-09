"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { X } from "lucide-react";
import {
  createPost,
  updatePost,
  type PostFormState,
} from "@/lib/post-actions";
import { MAX_TAGS, MAX_TAG_LENGTH } from "@/lib/post-schema";
import MarkdownEditor from "@/components/markdown-editor";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/categories";

type PostFormProps = {
  post?: {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: string;
    thumbnail: string | null;
    series: string | null;
    tags: string[];
    isPrivate: boolean;
    publishedAt: Date;
  };
};

// datetime-local input 은 "YYYY-MM-DDTHH:mm" (로컬 타임존, 초 단위 없음) 형식을 요구한다.
function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

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
  const [series, setSeries] = useState(post?.series ?? "");
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [isPrivate, setIsPrivate] = useState(post?.isPrivate ?? false);
  const [publishedAt, setPublishedAt] = useState(
    toDatetimeLocalValue(post?.publishedAt ?? new Date()),
  );
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [state, setState] = useState<PostFormState>({});
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 입력값 정규화 후 태그로 추가. 엔터 입력이 유일한 추가 경로다.
  function addTag() {
    const value = tagInput.trim().toLowerCase();
    setTagInput("");
    if (!value) return;
    if (value.length > MAX_TAG_LENGTH) {
      setTagError(`태그는 ${MAX_TAG_LENGTH}자 이내로 입력하세요.`);
      return;
    }
    if (tags.includes(value)) {
      setTagError(null);
      return;
    }
    if (tags.length >= MAX_TAGS) {
      setTagError(`태그는 최대 ${MAX_TAGS}개까지 입력할 수 있습니다.`);
      return;
    }
    setTagError(null);
    setTags([...tags, value]);
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault(); // 폼 제출 방지
      addTag();
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

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
      const payload = {
        title,
        slug,
        content,
        category,
        thumbnail,
        series: series.trim() || null,
        tags,
        isPrivate,
        publishedAt: new Date(publishedAt),
      };
      const result = isEdit
        ? await updatePost(post.id, payload)
        : await createPost(payload);

      if (result.ok) {
        toast.success(isEdit ? "글을 수정했습니다." : "글을 작성했습니다.");
        router.push(isEdit ? `/posts/${result.slug ?? slug}` : "/");
        router.refresh();
        return;
      }

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

      {/* 태그: 카테고리 하위 세부 분류. 엔터로 추가. */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-fg-default">태그</label>
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border-default bg-bg-default px-3 py-2 focus-within:border-accent-fg focus-within:ring-2 focus-within:ring-accent-fg/30 transition-colors">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-md border border-accent-fg/20 bg-accent-fg/15 px-2.5 py-1 text-sm text-accent-fg"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`${tag} 태그 제거`}
                className="text-accent-fg/70 hover:text-accent-fg"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={tags.length === 0 ? "태그 입력 후 Enter (예: react)" : ""}
            className="h-7 min-w-24 flex-1 border-none bg-transparent text-sm text-fg-default placeholder:text-fg-muted focus:outline-none"
          />
        </div>
        {tagError && <p className="text-sm text-danger-fg">{tagError}</p>}
        {fieldErrors.tags?.map((msg) => (
          <p key={msg} className="text-sm text-danger-fg">{msg}</p>
        ))}
      </div>

      {/* 시리즈: 비워두면 단발성 글이다. 회차는 저장 시 서버에서 자동으로 매겨진다. */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-fg-default">시리즈</label>
        <input
          type="text"
          value={series}
          onChange={(e) => setSeries(e.target.value)}
          placeholder="연재 시리즈명 (비우면 단독 글)"
          className={inputClass}
        />
        {fieldErrors.series?.map((msg) => (
          <p key={msg} className="text-sm text-danger-fg">{msg}</p>
        ))}
      </div>

      {/* 공개 설정: 발행일시(미래로 지정하면 예약발행) + 비공개 여부 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-fg-default">발행일시</label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className={inputClass}
          />
          {fieldErrors.publishedAt?.map((msg) => (
            <p key={msg} className="text-sm text-danger-fg">{msg}</p>
          ))}
        </div>

        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm font-medium text-fg-default">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 rounded border-border-default"
            />
            비공개 (관리자만 열람 가능)
          </label>
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
            <Image
              src={thumbnail}
              alt="썸네일 미리보기"
              width={96}
              height={96}
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