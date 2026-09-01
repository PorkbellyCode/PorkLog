// Hugging Face 공식 모델 목록 API. sort=trending 값은 API가 거부하므로(확인함),
// 기본 응답에 포함된 trendingScore 필드를 기준으로 직접 정렬한다.

export type TrendingModel = {
  id: string;
  url: string;
  likes: number;
  downloads: number;
  pipelineTag: string | null;
};

const MODEL_COUNT = 10;
const FETCH_SIZE = MODEL_COUNT * 2; // trendingScore로 다시 정렬할 여유분

type HfModel = {
  id: string;
  likes: number;
  downloads: number;
  pipeline_tag?: string;
  trendingScore?: number;
};

export async function fetchTrendingModels(): Promise<TrendingModel[]> {
  const res = await fetch(`https://huggingface.co/api/models?limit=${FETCH_SIZE}`);
  if (!res.ok) {
    throw new Error(`Hugging Face API 요청 실패: HTTP ${res.status}`);
  }
  const data = (await res.json()) as HfModel[];

  return data
    .slice()
    .sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0))
    .slice(0, MODEL_COUNT)
    .map((m) => ({
      id: m.id,
      url: `https://huggingface.co/${m.id}`,
      likes: m.likes,
      downloads: m.downloads,
      pipelineTag: m.pipeline_tag ?? null,
    }));
}
