import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

// 상세 페이지와 에디터 미리보기(/api/preview)가 공유하는 단일 렌더 파이프라인.
// 두 화면이 다른 HTML 을 내지 않도록 여기 한 곳에서만 정의한다.
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    // 목차 앵커용 heading id. extractToc 와 같은 github-slugger 를 쓴다.
    .use(rehypeSlug)
    .use(rehypePrettyCode, { theme: "github-dark" })
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}
