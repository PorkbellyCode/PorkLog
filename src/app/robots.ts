import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 관리자·인증·API만 차단. /posts/[slug] 글 상세는 색인 대상이라 제외하지 않음.
      disallow: ["/posts/new", "/posts/edit/", "/login", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}