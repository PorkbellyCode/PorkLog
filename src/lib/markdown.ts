import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
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
    // javascript: 같은 위험 URL·속성을 제거한다(GitHub 기본 스키마, 코드 블록의 language-* class 허용).
    // 기본 스키마는 id 에 user-content- 접두사를 붙이므로, 제목 id 는 sanitize 뒤에 rehypeSlug 로 만든다.
    // 하이라이트가 만드는 span/style 도 sanitize 에 지워지지 않도록 하이라이트보다 앞에 둔다.
    // remark-rehype 가 각주 id 에 이미 user-content- 를 붙이므로 sanitize 가 한 번 더 붙이지 않게 접두사를 끈다.
    .use(rehypeSanitize, { ...defaultSchema, clobberPrefix: "" })
    // 목차 앵커용 heading id. extractToc 와 같은 github-slugger 를 쓴다.
    .use(rehypeSlug)
    .use(rehypePrettyCode, { theme: "github-dark" })
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}
