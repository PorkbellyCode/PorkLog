// OpenRouter 공식 Data API(rankings-daily)로 "지난주 대비 사용량 급상승 모델"을 계산한다.
// 벤치마크 점수는 이 API로 제공되지 않아 다루지 않는다(요청 시 뺀 부분).

export type TrendingModel = {
  modelSlug: string;
  thisWeekTokens: number;
  lastWeekTokens: number;
  growthRatio: number; // (thisWeek - lastWeek) / lastWeek
};

const TOP_N = 10;

type RankingsDailyRow = { date: string; model_permaslug: string; total_tokens: string };
type RankingsDailyResponse = { data: RankingsDailyRow[] };

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function fetchOpenRouterTrending(): Promise<TrendingModel[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const now = new Date();
  const end = isoDate(new Date(now.getTime() - 24 * 60 * 60 * 1000)); // 가장 최근 완료된 UTC 일
  const start = isoDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)); // 2주 전부터
  const cutoff = isoDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)); // 이번 주/지난 주 경계

  const url = `https://openrouter.ai/api/v1/datasets/rankings-daily?start_date=${start}&end_date=${end}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) {
    throw new Error(`OpenRouter Data API 요청 실패: HTTP ${res.status}`);
  }
  const { data } = (await res.json()) as RankingsDailyResponse;

  const thisWeek = new Map<string, number>();
  const lastWeek = new Map<string, number>();
  for (const row of data) {
    const bucket = row.date >= cutoff ? thisWeek : lastWeek;
    bucket.set(row.model_permaslug, (bucket.get(row.model_permaslug) ?? 0) + Number(row.total_tokens));
  }

  // 지난주에도 사용량이 있던 모델만 "급상승"으로 비교한다(0 → N 신규 진입은 별도 성격이라 제외).
  const withGrowth: TrendingModel[] = [];
  for (const [modelSlug, thisWeekTokens] of thisWeek) {
    const lastWeekTokens = lastWeek.get(modelSlug) ?? 0;
    if (lastWeekTokens <= 0) continue;
    withGrowth.push({
      modelSlug,
      thisWeekTokens,
      lastWeekTokens,
      growthRatio: (thisWeekTokens - lastWeekTokens) / lastWeekTokens,
    });
  }

  return withGrowth.sort((a, b) => b.growthRatio - a.growthRatio).slice(0, TOP_N);
}
