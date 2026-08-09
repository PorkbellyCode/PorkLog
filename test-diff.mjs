import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const md = `
\`\`\`diff
- const x = 1;
+ const x = 2;
  const y = 3;
\`\`\`
`;

const file = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypePrettyCode, { theme: "github-dark" })
  .use(rehypeStringify)
  .process(md);

console.log(String(file));
