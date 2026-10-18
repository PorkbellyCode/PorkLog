import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { buildWeeklyDigest } from "@/lib/tech-digest/pipeline";
import { createDigestPost, digestExists, getRecentDigestLinks } from "@/lib/tech-digest/create-digest-post";

// Vercel Cron 응답이 캐싱되지 않고 매번 실제로 실행되도록 강제.
export const dynamic = "force-dynamic";
// 수집 + LLM 호출(최대 120초 x 2회)이 기본 한도를 넘을 수 있다.
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET 환경변수가 설정되지 않았습니다.");
    return NextResponse.json({ error: "cron_secret_not_configured" }, { status: 500 });
  }
  if (!isAuthorizedCron(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // 오늘 글이 이미 있으면 수집·LLM 호출 전에 끝낸다(비용 방지).
    if (await digestExists()) {
      return NextResponse.json({ status: "skipped", reason: "duplicate_slug" });
    }

    const built = await buildWeeklyDigest(await getRecentDigestLinks());
    if (built.status === "skipped") {
      return NextResponse.json(built);
    }

    const result = await createDigestPost(built.post);
    return NextResponse.json({ ...result, ...built.stats });
  } catch (err) {
    console.error("주간 개발 뉴스 다이제스트 생성 실패:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
