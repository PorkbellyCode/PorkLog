import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // worktree 사본(.claude/worktrees)의 테스트가 함께 돌지 않도록 제외한다.
    exclude: [...configDefaults.exclude, ".claude/**"],
  },
});
