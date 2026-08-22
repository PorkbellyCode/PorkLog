import { BetaAnalyticsDataClient } from "@google-analytics/data";

const propertyId = process.env.GA_PROPERTY_ID;

function getClient() {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GA_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
  });
}

export type ChannelStat = {
  channel: string;
  sessions: number;
};

// GA4 기본 채널 그룹(Direct, Organic Search 등)별 세션 수.
export async function getTrafficByChannel(days = 30): Promise<ChannelStat[]> {
  const [response] = await getClient().runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  });

  return (response.rows ?? []).map((row) => ({
    channel: row.dimensionValues?.[0]?.value || "(기타)",
    sessions: Number(row.metricValues?.[0]?.value ?? 0),
  }));
}

export type DeviceStat = {
  device: string;
  sessions: number;
};

// 기기 카테고리(desktop/mobile/tablet)별 세션 수.
export async function getTrafficByDevice(days = 30): Promise<DeviceStat[]> {
  const [response] = await getClient().runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [{ name: "deviceCategory" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  });

  return (response.rows ?? []).map((row) => ({
    device: row.dimensionValues?.[0]?.value || "(기타)",
    sessions: Number(row.metricValues?.[0]?.value ?? 0),
  }));
}
