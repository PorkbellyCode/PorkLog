export type CandidateKind = "release" | "article" | "repo";

// 수집 단계의 항목. 피드 항목·릴리스·GitHub 레포가 모두 이 모양으로 모인다.
export type DigestItem = {
  kind: CandidateKind;
  source: string;
  title: string;
  link: string;
  body: string; // 태그를 제거한 본문(최대 BODY_LIMIT 자)
  pubDate: Date;
  categories: string[];
};

// LLM 에 넘기는 후보. id 는 LLM 이 고른 항목을 코드가 다시 찾는 열쇠다.
export type Candidate = Omit<DigestItem, "pubDate" | "categories"> & { id: number };

export const BODY_LIMIT = 1500;
