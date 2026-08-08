import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    setupFiles: ["./vitest.setup.ts"],
    // DB 통합 테스트가 같은 원격(Neon 테스트 브랜치) DB에 접근하므로
    // 테스트 파일을 병렬로 돌리면 간헐적으로 쓰기 직후 읽기가 안 보이는 문제가 있어 순차 실행한다.
    fileParallelism: false,
  },
});
