"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import "@uiw/react-md-editor/markdown-editor.css";

// react-md-editor는 브라우저 전용이므로 SSR을 피하기 위해 dynamic import를 사용한다.
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

function useMounted(): boolean {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );
}

export default function MarkdownEditor({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const { resolvedTheme } = useTheme();
    const mounted = useMounted();
    const colorMode = mounted && resolvedTheme === "dark" ? "dark" : "light";

    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function uploadImage(file: File): Promise<string | null> {
        try {
            const res = await fetch(
                `/api/upload?filename=${encodeURIComponent(file.name)}`,
                {
                    method: "POST",
                    headers: { "content-type": file.type },
                    body: file,
                },
            );
            if (!res.ok) return null;
            const { url } = (await res.json()) as { url: string };
            return url;
        } catch {
            return null;
        }
    }

    // 현재 textarea 의 커서 위치에 텍스트를 삽입한다. (없으면 끝에 append)
    function insertAtCursor(snippet: string) {
        const textarea =
            containerRef.current?.querySelector<HTMLTextAreaElement>(
                ".w-md-editor-text-input",
            );
        if (!textarea) {
            onChange(value + snippet);
            return;
        }
        const start = textarea.selectionStart ?? value.length;
        const end = textarea.selectionEnd ?? value.length;
        onChange(value.slice(0, start) + snippet + value.slice(end));
    }

    // 드롭/붙여넣기/파일선택이 공유하는 업로드 + 삽입 로직.
    async function handleFiles(files: File[]) {
        const images = files.filter((f) => f.type.startsWith("image/"));
        if (images.length === 0) return;

        setError(null);
        setUploading(true);
        try {
            const urls = await Promise.all(images.map(uploadImage));
            const ok = urls.filter((u): u is string => !!u);
            if (ok.length < images.length) {
                setError("일부 이미지 업로드에 실패했습니다.");
            }
            if (ok.length > 0) {
                insertAtCursor(ok.map((u) => `![](${u})`).join("\n") + "\n");
            }
        } finally {
            setUploading(false);
        }
    }

    return (
        <div ref={containerRef} data-color-mode={colorMode} className="space-y-1">
            <MDEditor
                value={value}
                onChange={(val) => onChange(val || "")}
                height={400}
                // 툴바의 기본 '이미지' 버튼만 파일 선택 동작으로 교체. 나머지는 그대로.
                commandsFilter={(command) =>
                    command.keyCommand === "image"
                        ? { ...command, execute: () => fileInputRef.current?.click() }
                        : command
                }
                textareaProps={{
                    onDragOver: (e) => {
                        if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
                    },
                    onDrop: (e) => {
                        if (e.dataTransfer?.files?.length) {
                            e.preventDefault();
                            void handleFiles(Array.from(e.dataTransfer.files));
                        }
                    },
                    onPaste: (e) => {
                        const files = Array.from(e.clipboardData?.items ?? [])
                            .filter((it) => it.type.startsWith("image/"))
                            .map((it) => it.getAsFile())
                            .filter((f): f is File => !!f);
                        if (files.length) {
                            e.preventDefault();
                            void handleFiles(files);
                        }
                    },
                }}
            />

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    if (files.length) void handleFiles(files);
                    e.target.value = "";
                }}
            />

            {uploading && <p className="text-sm text-fg-muted">이미지 업로드 중…</p>}
            {error && <p className="text-sm text-danger-fg">{error}</p>}
        </div>
    );
}