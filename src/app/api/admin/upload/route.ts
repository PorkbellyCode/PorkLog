import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// 어드민 보호: 세션이 없으면 업로드 거부.
async function ensureAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

export async function POST(request: Request): Promise<NextResponse> {
  const unauth = await ensureAdmin();
  if (unauth) return unauth;

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");
  if (!filename) {
    return NextResponse.json({ error: "filename required" }, { status: 400 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: "허용되지 않는 이미지 형식입니다." },
      { status: 400 },
    );
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "이미지 크기는 4MB 이하만 가능합니다." },
      { status: 400 },
    );
  }

  if (!request.body) {
    return NextResponse.json({ error: "body required" }, { status: 400 });
  }

  const blob = await put(filename, request.body, {
    access: "public",
    addRandomSuffix: true,
    contentType,
  });

  return NextResponse.json({ url: blob.url });
}