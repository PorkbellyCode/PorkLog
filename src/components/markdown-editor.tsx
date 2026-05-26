"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";

// react-md-editor는 브라우저 전용이므로 SSR을 피하기 위해 dynamic import를 사용한다.
// SSR : false dynamic imports는 반드시 클라이언트 컴포넌트 안에서 호출해야 한다.
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function MarkdownEditor({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div data-color-mode="light">
            <MDEditor
                value={value}
                onChange={(val) => onChange(val || "")}
                height={400}
            />
        </div>
    );
}