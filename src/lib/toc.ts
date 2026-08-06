import GithubSlugger from "github-slugger";

export type TocItem = {
  depth: 2 | 3;
  text: string;
  id: string;
};

// 인라인 마크다운 표기를 걷어내 heading 의 실제 렌더 텍스트를 얻는다.
// rehype-slug 가 보는 텍스트(하위 노드의 문자열)와 일치시키기 위한 처리다.
function plainText(heading: string): string {
  return heading
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/<[^>]+>/g, "")
    .trim();
}

// 본문 마크다운에서 h2·h3 만 뽑아 목차를 만든다.
// slug 는 rehype-slug 와 동일한 github-slugger 로 생성해 앵커가 어긋나지 않게 한다.
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inCodeFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    const match = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!match) continue;

    const text = plainText(match[2]);
    if (!text) continue;

    items.push({
      depth: match[1].length as 2 | 3,
      text,
      id: slugger.slug(text),
    });
  }

  return items;
}

// 한국어 기준 분당 500자로 잡은 대략적인 읽기 시간(분). 최소 1분.
const CHARS_PER_MINUTE = 500;

export function readingTime(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~\-|]/g, "")
    .replace(/\s+/g, "");

  return Math.max(1, Math.ceil(text.length / CHARS_PER_MINUTE));
}
