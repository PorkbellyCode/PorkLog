import { unstable_cache } from "next/cache";

const ENDPOINT = "https://api.github.com/graphql";
const OWNER = "PorkbellyCode";
const NAME = "PorkLog";
const CATEGORY_ID = "DIC_kwDOSkixxs4C97_r"; // Giscus "Announcements" 카테고리

const QUERY = `
  query ($owner: String!, $name: String!, $categoryId: ID!) {
    repository(owner: $owner, name: $name) {
      discussions(first: 100, categoryId: $categoryId) {
        nodes {
          title
          comments { totalCount }
        }
      }
    }
  }
`;

// Giscus mapping="pathname", strict="0" → Discussion title 은 글의 pathname.
// 예: 글 /posts/my-slug 의 Discussion title === "/posts/my-slug".
// pathname -> 댓글 수(top-level) 맵 반환. 실패 시 빈 객체.
async function fetchCommentCounts(): Promise<Record<string, number>> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return {};

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { owner: OWNER, name: NAME, categoryId: CATEGORY_ID },
      }),
      cache: "no-store", // 캐싱은 아래 unstable_cache 가 담당
    });
    if (!res.ok) return {};

    const json = (await res.json()) as {
      data?: {
        repository?: {
          discussions?: {
            nodes?: { title: string; comments: { totalCount: number } }[];
          };
        };
      };
    };

    const nodes = json.data?.repository?.discussions?.nodes ?? [];
    const counts: Record<string, number> = {};
    for (const node of nodes) {
      // giscus 가 제목에 선행 슬래시를 넣는 경우/안 넣는 경우 모두 매칭되도록 정규화
      const key = node.title.replace(/^\//, "");
      counts[key] = node.comments.totalCount;
    }
    return counts;
  } catch {
    return {};
  }
}

// 홈 진입마다 GitHub 를 때리지 않도록 5분 캐시.
export const getCommentCounts = unstable_cache(
  fetchCommentCounts,
  ["github-comment-counts"],
  { revalidate: 300 },
);