import { NextRequest, NextResponse } from "next/server";
import { fetchWeeklyTechNews } from "@/lib/tech-digest/fetch-feeds";
import { fetchGithubTrending, type GithubTrending } from "@/lib/tech-digest/fetch-github";
import { fetchTrendingModels as fetchHfTrendingModels } from "@/lib/tech-digest/fetch-huggingface";
import { fetchOpenRouterTrending } from "@/lib/tech-digest/fetch-openrouter";
import { summarizeWeeklyTechNews } from "@/lib/tech-digest/summarize";
import { createDigestPost } from "@/lib/tech-digest/create-digest-post";

// Vercel Cron 응답이 캐싱되지 않고 매번 실제로 실행되도록 강제.
export const dynamic = "force-dynamic";

const EMPTY_GITHUB: GithubTrending = { repos: [], developers: [] };

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // 소스 4종 병렬 수집. 개별 소스 실패는 전체를 막지 않고 콘솔에만 남긴다
    // (fetch-feeds.ts 의 개별 피드 실패 처리와 동일한 방침).
    const [itemsResult, githubResult, hfResult, openRouterResult] = await Promise.allSettled([
      fetchWeeklyTechNews(),
      fetchGithubTrending(),
      fetchHfTrendingModels(),
      fetchOpenRouterTrending(),
    ]);

    if (itemsResult.status === "rejected") console.error("RSS 수집 실패:", itemsResult.reason);
    if (githubResult.status === "rejected") console.error("GitHub 트렌딩 수집 실패:", githubResult.reason);
    if (hfResult.status === "rejected") console.error("Hugging Face 트렌딩 수집 실패:", hfResult.reason);
    if (openRouterResult.status === "rejected") console.error("OpenRouter 트렌딩 수집 실패:", openRouterResult.reason);

    const items = itemsResult.status === "fulfilled" ? itemsResult.value : [];
    const github = githubResult.status === "fulfilled" ? githubResult.value : EMPTY_GITHUB;
    const hfModels = hfResult.status === "fulfilled" ? hfResult.value : [];
    const openRouterModels = openRouterResult.status === "fulfilled" ? openRouterResult.value : [];

    const hasContent =
      items.length > 0 || github.repos.length > 0 || hfModels.length > 0 || openRouterModels.length > 0;
    if (!hasContent) {
      return NextResponse.json({ status: "skipped", reason: "no_items" });
    }

    const post = await summarizeWeeklyTechNews({ items, github, hfModels, openRouterModels });
    const result = await createDigestPost(post);

    return NextResponse.json(result);
  } catch (err) {
    console.error("주간 AI 테크뉴스 다이제스트 생성 실패:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
