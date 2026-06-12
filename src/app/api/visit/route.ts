import { cookies } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { siteVisits } from "@/db/schema";

// KST(Asia/Seoul) 기준 오늘 "YYYY-MM-DD" (en-CA 로케일이 이 형식)
function kstToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// 해당 KST 날짜의 '다음 자정' UTC 시각 (쿠키 만료용). KST 자정 = UTC -9h.
function kstNextMidnight(todayKst: string): Date {
  const [y, m, d] = todayKst.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0) - 9 * 60 * 60 * 1000);
}

export async function POST() {
  try {
    const today = kstToday();
    const cookieStore = await cookies();
    const alreadyToday = cookieStore.get("visited_on")?.value === today;

    if (!alreadyToday) {
      // 오늘 행 +1 (없으면 생성). 원자적 upsert.
      await db
        .insert(siteVisits)
        .values({ visitDate: today, count: 1 })
        .onConflictDoUpdate({
          target: siteVisits.visitDate,
          set: { count: sql`${siteVisits.count} + 1` },
        });

      // 다음 KST 자정까지 "오늘 방문함" 표시
      cookieStore.set("visited_on", today, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        expires: kstNextMidnight(today),
      });
    }

    const [todayRow] = await db
      .select({ count: siteVisits.count })
      .from(siteVisits)
      .where(eq(siteVisits.visitDate, today));

    const [totalRow] = await db
      .select({ total: sql<number>`coalesce(sum(${siteVisits.count}), 0)` })
      .from(siteVisits);

    return Response.json({
      today: todayRow?.count ?? 0,
      total: Number(totalRow?.total ?? 0),
    });
  } catch {
    return Response.json({ today: 0, total: 0 }, { status: 200 });
  }
}