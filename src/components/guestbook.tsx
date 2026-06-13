"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createEntry, editEntry, deleteEntry } from "@/lib/guestbook-actions";

type Entry = {
  id: number;
  authorId: string;
  content: string;
  images: string[];
  isSecret: boolean;
  updatedAt: Date | null;
  createdAt: Date;
};

type Props = {
  entries: Entry[];
  isAdmin: boolean;
  currentPage: number;
  totalPages: number;
};

const PAGE_SIZE_DISPLAY = 10;

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function uploadImage(file: File): Promise<string | null> {
  const res = await fetch(
    `/api/guestbook-upload?filename=${encodeURIComponent(file.name)}`,
    {
      method: "POST",
      headers: { "content-type": file.type },
      body: file,
    }
  );
  if (!res.ok) {
    const { error } = await res.json();
    toast.error(error ?? "이미지 업로드에 실패했습니다.");
    return null;
  }
  const { url } = await res.json();
  return url;
}

// 작성 폼
function CreateForm({ onCreated }: { onCreated: () => void }) {
  const [authorId, setAuthorId] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit() {
    setPending(true);
    const result = await createEntry({ authorId, password, content, images, isSecret });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("방명록에 글을 남겼습니다.");
    setAuthorId("");
    setPassword("");
    setContent("");
    setImages([]);
    setIsSecret(false);
    onCreated();
  }

  return (
    <div className="rounded-lg border border-border-default bg-bg-subtle p-4 space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="작성자 ID"
          value={authorId}
          onChange={(e) => setAuthorId(e.target.value)}
          maxLength={20}
          className="h-8 w-full rounded-md border border-border-default bg-bg-default px-3 text-sm text-fg-default placeholder:text-fg-muted focus:outline-none focus:border-accent-fg transition-colors"
        />
        <input
          type="password"
          placeholder="비밀번호 (4자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={20}
          className="h-8 w-full rounded-md border border-border-default bg-bg-default px-3 text-sm text-fg-default placeholder:text-fg-muted focus:outline-none focus:border-accent-fg transition-colors"
        />
      </div>
      <textarea
        placeholder="방명록을 남겨주세요. (500자 이내)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={500}
        rows={3}
        className="w-full rounded-md border border-border-default bg-bg-default px-3 py-2 text-sm text-fg-default placeholder:text-fg-muted focus:outline-none focus:border-accent-fg transition-colors resize-none"
      />

      {/* 업로드된 이미지 미리보기 */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt="" className="h-20 w-20 rounded-md object-cover border border-border-default" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger-fg text-white text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* 이미지 첨부 */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg-default transition-colors disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h.94a.76.76 0 0 1 .03-.03l6.077-6.078a1.75 1.75 0 0 1 2.474 0l1.326 1.326a.25.25 0 0 0 .354 0l1.698-1.697a.25.25 0 0 0 0-.354L12.78 4.09a.25.25 0 0 0-.354 0L10.78 5.735a.75.75 0 0 1-1.06-1.06l1.644-1.645a1.75 1.75 0 0 1 2.475 0l1.613 1.614a1.75 1.75 0 0 1 0 2.474l-1.698 1.698a1.75 1.75 0 0 1-2.474 0l-1.326-1.326a.25.25 0 0 0-.354 0L3.022 15H14.25a.25.25 0 0 0 .25-.25v-1a.75.75 0 0 1 1.5 0v1A1.75 1.75 0 0 1 14.25 16.5H1.75A1.75 1.75 0 0 1 0 14.75V2.75C0 1.784.784 1 1.75 1h4.5a.75.75 0 0 1 0 1.5Z" />
            </svg>
            {uploading ? "업로드 중..." : "이미지 첨부"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />

          {/* 비밀글 */}
          <label className="inline-flex items-center gap-1.5 text-sm text-fg-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(e) => setIsSecret(e.target.checked)}
              className="rounded"
            />
            비밀글
          </label>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending || uploading}
          className="h-8 px-4 rounded-md bg-accent-fg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "등록 중..." : "등록"}
        </button>
      </div>
    </div>
  );
}

// 개별 항목
function EntryItem({ entry, isAdmin, onChanged }: { entry: Entry; isAdmin: boolean; onChanged: () => void }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  const [editContent, setEditContent] = useState(entry.content);
  const [editImages, setEditImages] = useState<string[]>(entry.images);
  const [editIsSecret, setEditIsSecret] = useState(entry.isSecret);
  const [deletePassword, setDeletePassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isBlurred = entry.isSecret && !isAdmin;

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    setEditImages((prev) => [...prev, ...urls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleEdit() {
    setPending(true);
    const result = await editEntry(entry.id, {
      password: editPassword,
      content: editContent,
      images: editImages,
      isSecret: editIsSecret,
    });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("수정되었습니다.");
    setShowEdit(false);
    setEditPassword("");
    onChanged();
  }

  async function handleDelete() {
    setPending(true);
    const result = await deleteEntry(entry.id, isAdmin ? undefined : deletePassword);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("삭제되었습니다.");
    setShowDeleteConfirm(false);
    onChanged();
  }

  return (
    <div className="rounded-lg border border-border-default bg-bg-default p-4 space-y-3">
      {/* 헤더: 작성자 + 날짜 + 버튼 */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-fg-default">{entry.authorId}</span>
            {entry.isSecret && (
              <span className="inline-flex items-center gap-0.5 text-xs text-fg-muted">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
                  <path d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25ZM10.5 6V4a2.5 2.5 0 0 0-5 0v2Z" />
                </svg>
                비밀글
              </span>
            )}
          </div>
          <p className="text-xs text-fg-muted">
            {formatDate(entry.createdAt)}
            {entry.updatedAt && (
              <span className="ml-2 text-fg-muted">(수정됨 · {formatDate(entry.updatedAt)})</span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/* 수정 버튼: 관리자 제외 모두 */}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => { setShowEdit(!showEdit); setShowDeleteConfirm(false); }}
              aria-label="수정"
              title="수정"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-fg-muted hover:bg-fg-default/5 hover:text-fg-default transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z" />
              </svg>
            </button>
          )}
          {/* 삭제 버튼: 모두 */}
          <button
            type="button"
            onClick={() => { setShowDeleteConfirm(!showDeleteConfirm); setShowEdit(false); }}
            aria-label="삭제"
            title="삭제"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-fg-muted hover:bg-danger-fg/10 hover:text-danger-fg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 본문 */}
      {isBlurred ? (
        <p className="text-sm text-fg-default select-none blur-md pointer-events-none">
          {entry.content}
        </p>
      ) : (
        <p className="text-sm text-fg-default whitespace-pre-wrap">{entry.content}</p>
      )}

      {/* 이미지 */}
      {entry.images.length > 0 && (
        <div className={`flex flex-wrap gap-2 ${isBlurred ? "blur-md pointer-events-none select-none" : ""}`}>
          {entry.images.map((url, i) => (
            <img key={i} src={url} alt="" className="h-24 w-24 rounded-md object-cover border border-border-default" />
          ))}
        </div>
      )}

      {/* 수정 폼 (인라인) */}
      {showEdit && (
        <div className="mt-2 space-y-2 border-t border-border-default pt-3">
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
            className="h-8 w-full rounded-md border border-border-default bg-bg-subtle px-3 text-sm text-fg-default placeholder:text-fg-muted focus:outline-none focus:border-accent-fg transition-colors"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full rounded-md border border-border-default bg-bg-subtle px-3 py-2 text-sm text-fg-default focus:outline-none focus:border-accent-fg transition-colors resize-none"
          />

          {editImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {editImages.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="h-20 w-20 rounded-md object-cover border border-border-default" />
                  <button
                    type="button"
                    onClick={() => setEditImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger-fg text-white text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg-default transition-colors disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h.94a.76.76 0 0 1 .03-.03l6.077-6.078a1.75 1.75 0 0 1 2.474 0l1.326 1.326a.25.25 0 0 0 .354 0l1.698-1.697a.25.25 0 0 0 0-.354L12.78 4.09a.25.25 0 0 0-.354 0L10.78 5.735a.75.75 0 0 1-1.06-1.06l1.644-1.645a1.75 1.75 0 0 1 2.475 0l1.613 1.614a1.75 1.75 0 0 1 0 2.474l-1.698 1.698a1.75 1.75 0 0 1-2.474 0l-1.326-1.326a.25.25 0 0 0-.354 0L3.022 15H14.25a.25.25 0 0 0 .25-.25v-1a.75.75 0 0 1 1.5 0v1A1.75 1.75 0 0 1 14.25 16.5H1.75A1.75 1.75 0 0 1 0 14.75V2.75C0 1.784.784 1 1.75 1h4.5a.75.75 0 0 1 0 1.5Z" />
                </svg>
                {uploading ? "업로드 중..." : "이미지 첨부"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <label className="inline-flex items-center gap-1.5 text-sm text-fg-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editIsSecret}
                  onChange={(e) => setEditIsSecret(e.target.checked)}
                  className="rounded"
                />
                비밀글
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowEdit(false); setEditPassword(""); }}
                className="h-8 px-3 rounded-md border border-border-default text-sm text-fg-muted hover:bg-bg-subtle transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleEdit}
                disabled={pending || uploading}
                className="h-8 px-4 rounded-md bg-accent-fg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {pending ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 (인라인) */}
      {showDeleteConfirm && (
        <div className="mt-2 border-t border-border-default pt-3 space-y-2">
          {!isAdmin && (
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="h-8 w-full rounded-md border border-border-default bg-bg-subtle px-3 text-sm text-fg-default placeholder:text-fg-muted focus:outline-none focus:border-accent-fg transition-colors"
            />
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm text-fg-muted">정말 삭제하시겠습니까?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); }}
                className="h-8 px-3 rounded-md border border-border-default text-sm text-fg-muted hover:bg-bg-subtle transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="h-8 px-4 rounded-md bg-danger-fg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {pending ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 페이지네이션
function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const router = useRouter();

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const baseBtn = "inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-border-default px-2 text-sm";

  return (
    <nav aria-label="페이지 이동" className="flex items-center justify-center gap-1">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => router.push(`/guestbook?page=${currentPage - 1}`)}
        className={`${baseBtn} ${currentPage <= 1 ? "text-fg-muted opacity-50 pointer-events-none" : "text-fg-default hover:bg-bg-subtle"}`}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L6.06 8l3.72 3.72a.75.75 0 0 1 0 1.06Z" />
        </svg>
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => router.push(`/guestbook?page=${p}`)}
          aria-current={p === currentPage ? "page" : undefined}
          className={`${baseBtn} ${p === currentPage ? "bg-bg-subtle font-semibold text-fg-default" : "text-fg-default hover:bg-bg-subtle"}`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => router.push(`/guestbook?page=${currentPage + 1}`)}
        className={`${baseBtn} ${currentPage >= totalPages ? "text-fg-muted opacity-50 pointer-events-none" : "text-fg-default hover:bg-bg-subtle"}`}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>
    </nav>
  );
}

// 메인 클라이언트 컴포넌트
export default function Guestbook({ entries, isAdmin, currentPage, totalPages }: Props) {
  const router = useRouter();

  function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <CreateForm onCreated={refresh} />

      {entries.length === 0 ? (
        <p className="text-sm text-fg-muted text-center py-8">아직 방명록이 없습니다. 첫 번째로 남겨보세요!</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <EntryItem key={entry.id} entry={entry} isAdmin={isAdmin} onChanged={refresh} />
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}