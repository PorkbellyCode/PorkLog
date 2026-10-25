import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 썸네일·본문 이미지는 Vercel Blob 에 저장된다.
    // 테크뉴스 고정 썸네일은 절대 URL 로 저장돼 외부 이미지로 취급되므로 따로 허용한다.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "porklog.dev", pathname: "/tech-news.webp" },
    ],
  },
};

export default nextConfig;
