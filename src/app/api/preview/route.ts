import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";

// 에디터 미리보기 전용. 상세 페이지와 같은 renderMarkdown 을 써서
// 미리보기와 발행 결과가 어긋나지 않게 한다.
// 로그인 사용자(=관리자)만 허용. 업로드 라우트와 같은 방식이다.
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { markdown } = (await request.json()) as { markdown?: string };
  if (typeof markdown !== "string") {
    return NextResponse.json({ error: "markdown required" }, { status: 400 });
  }

  return NextResponse.json({ html: await renderMarkdown(markdown) });
}
