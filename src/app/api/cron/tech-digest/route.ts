import { NextRequest, NextResponse } from "next/server";
import { fetchWeeklyTechNews } from "@/lib/tech-digest/fetch-feeds";
import { summarizeWeeklyTechNews } from "@/lib/tech-digest/summarize";
import { createDigestPost } from "@/lib/tech-digest/create-digest-post";

// Vercel Cron 응답이 캐싱되지 않고 매번 실제로 실행되도록 강제.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const items = await fetchWeeklyTechNews();

    if (items.length === 0) {
      return NextResponse.json({ status: "skipped", reason: "no_items" });
    }

    const post = await summarizeWeeklyTechNews(items);
    const result = await createDigestPost(post);

    return NextResponse.json(result);
  } catch (err) {
    console.error("주간 개발자 뉴스 다이제스트 생성 실패:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}