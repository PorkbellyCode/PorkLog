import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 썸네일·본문 이미지는 Vercel Blob 에 저장된다.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
