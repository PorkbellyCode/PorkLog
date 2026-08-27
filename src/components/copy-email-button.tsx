"use client";

import { toast } from "sonner";
import { EMAIL } from "@/lib/site";

type Props = {
  className?: string;
  // 호출부의 글자 크기에 맞춘다. (히어로 text-xs = 14, Resume text-sm = 16)
  iconSize?: number;
};

// 이메일은 mailto 로 메일 앱을 여는 대신 클릭 시 클립보드에 복사한다.
// 홈 히어로와 Resume 이 같이 쓴다.
export default function CopyEmailButton({ className, iconSize = 16 }: Props) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      toast.success("이메일 주소가 복사되었습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="클릭하면 이메일 주소가 복사됩니다"
      className={className}
    >
      {/* Octicon: mail */}
      <svg
        viewBox="0 0 16 16"
        width={iconSize}
        height={iconSize}
        fill="currentColor"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M1.75 2A1.75 1.75 0 0 0 0 3.75v8.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25v-8.5A1.75 1.75 0 0 0 14.25 2Zm12.5 1.5a.25.25 0 0 1 .25.25v.852l-6 3.96-6-3.96V3.75a.25.25 0 0 1 .25-.25ZM1.5 5.81v6.44c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.81l-5.815 3.84a.75.75 0 0 1-.87 0Z" />
      </svg>
      {EMAIL}
    </button>
  );
}
