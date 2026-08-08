import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getPostSummary,
  getTopPosts,
  getVisitSummary,
  getVisitTrend,
} from "@/lib/admin-stats";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import PeriodSelect from "@/components/admin/period-select";
import VisitTrendChart from "@/components/admin/visit-trend-chart";

const VALID_DAYS = [7, 30, 90];
const DEFAULT_DAYS = 30;

function parseDays(value: string | undefined): number {
  const parsed = Number(value);
  return VALID_DAYS.includes(parsed) ? parsed : DEFAULT_DAYS;
}

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const days = parseDays((await searchParams).days);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-fg-default">관리자 통계</h1>
        <PeriodSelect days={days} />
      </div>

      <Suspense key={days} fallback={<StatsSkeleton />}>
        <StatsContent days={days} />
      </Suspense>
    </main>
  );
}

async function StatsContent({ days }: { days: number }) {
  const [visitSummary, postSummary, visitTrend, topPosts] = await Promise.all([
    getVisitSummary(),
    getPostSummary(),
    getVisitTrend(days),
    getTopPosts(10),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="오늘 방문자" value={visitSummary.today} />
        <SummaryCard label="누적 방문자" value={visitSummary.total} />
        <SummaryCard label="총 게시물" value={postSummary.totalPosts} />
        <SummaryCard label="게시물 평균 조회수" value={postSummary.averageViews} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>방문자 추이</CardTitle>
          <CardDescription>최근 {days}일 일별 방문자 수</CardDescription>
        </CardHeader>
        <div className="px-6">
          <VisitTrendChart data={visitTrend} />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>인기 게시물 Top 10</CardTitle>
          <CardDescription>조회수 기준</CardDescription>
        </CardHeader>
        <div className="px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">순위</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead className="text-right">조회수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPosts.map((post, index) => (
                <TableRow key={post.id}>
                  <TableCell className="text-fg-muted">{index + 1}</TableCell>
                  <TableCell className="max-w-xs truncate">{post.title}</TableCell>
                  <TableCell className="text-fg-muted">{post.category}</TableCell>
                  <TableCell className="text-right font-mono">
                    {post.viewCount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {topPosts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-fg-muted">
                    아직 게시물이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="py-4">
      <CardHeader className="gap-1 px-4">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value.toLocaleString()}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
