"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { VisitTrendPoint } from "@/lib/admin-stats";

const chartConfig = {
  count: {
    label: "방문자 수",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// "YYYY-MM-DD" -> "MM/DD"
function formatDate(date: string) {
  const [, month, day] = date.split("-");
  return `${month}/${day}`;
}

export default function VisitTrendChart({ data }: { data: VisitTrendPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 12, top: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value: unknown) => formatDate(String(value))}
            />
          }
        />
        <defs>
          <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          dataKey="count"
          type="monotone"
          fill="url(#fillCount)"
          stroke="var(--color-count)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
