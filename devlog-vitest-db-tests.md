왜 필요했나

CLAUDE.md에 "버그 수정" 같은 모호한 목표를 "재현 테스트 작성 후 통과 확인" 같은 검증 가능한 기준으로 바꾸라는 원칙을 적어두고도, 정작 이 프로젝트엔 테스트 코드가 한 줄도 없었다. package.json에 테스트 러너가 없고, `*.test.ts` 파일도 없고, CI(`ci.yml`)도 lint·typecheck만 돌 뿐 테스트 단계가 없었다.

특히 위험한 지점은 `post-actions.ts`의 `updatePost`였다. 시리즈가 그대로면 회차(`seriesOrder`)를 유지하고, 바뀌면 새 시리즈의 다음 번호로 재계산하고, 없어지면 null로 돌리는 3갈래 분기가 있는데, 이걸 확인할 방법이 매번 관리자 페이지에서 직접 눌러보는 것뿐이었다. `post-schema.ts`의 zod 검증(slug 정규식, 태그 개수·길이 제한)도 마찬가지였다.

이참에 Vitest를 도입해서 최소한 이 두 파일부터 테스트를 붙여보기로 했다.

설계: mock이냐 실제 DB냐

`post-schema.ts`는 순수 함수라 고민할 게 없었다. 문제는 `post-actions.ts`였다. DB(`db`)와 인증(`requireSession`)에 의존하는 서버 액션이라, 여기서 선택지가 갈렸다.

하나는 `db`/`auth` 모듈을 통째로 mock 처리하는 방식이다. 인프라가 필요 없고 빠르지만, drizzle의 체이닝 쿼리 빌더(`.select().from().where()`)를 흉내 내는 mock 자체가 번거롭고, mock이 실제 쿼리 동작과 어긋나면 "테스트는 통과하는데 실제로는 깨지는" 상황이 생길 수 있다.

다른 하나는 진짜 DB에 대고 통합 테스트를 돌리는 방식이다. 신뢰도는 높지만 이 프로젝트는 `drizzle-orm/neon-http`를 쓰기 때문에 아무 로컬 Postgres에나 붙일 수가 없다. Neon의 HTTP 엔드포인트가 있어야 한다.

신뢰도를 택해서 실제 DB 쪽으로 갔다. 다만 Neon 테스트 브랜치를 만들려면 API 키나 콘솔 접근이 필요한데 나한테는 그게 없었다. `.env.local`에 `NEON_API_KEY` 같은 것도 없었고, 무엇보다 `.env.local`의 `DATABASE_URL`은 실제 운영 중인 블로그 DB였다. 여기다 대고 truncate가 섞인 테스트를 돌리는 건 절대 안 될 일이었다. 그래서 브랜치 생성은 직접 해달라고 요청했고, 받은 연결 문자열은 `.env.test`(gitignore의 `.env*`에 이미 걸려 있음)에만 저장하기로 했다. `vitest.setup.ts`는 `.env.test`가 없으면 곧바로 에러를 던지게 만들어서, 실수로 프로덕션 DB로 새는 경로 자체를 막았다.

구현: 세 단계

1. 순수 로직 테스트. `vitest`를 설치하고 `vitest.config.ts`에 `@/*` 경로 alias를 연결한 뒤, `post-schema.ts`에 대해 slug 정규식(7케이스), 태그 개수·길이 경계값, thumbnail 빈 문자열→null 변환, category 유효성까지 15개 케이스를 작성했다.

2. DB 통합 테스트. 받은 연결 문자열로 `.env.test`를 만들고 `drizzle-kit push`로 스키마를 동기화했다. `vitest.setup.ts`는 `.env.test`를 로드한 뒤 `db`를 동적 import로 늦춰서 불러오고(정적 import로 쓰면 env가 세팅되기 전에 `neon(process.env.DATABASE_URL!)`이 먼저 실행돼버린다), 매 테스트 뒤 `posts` 테이블을 truncate했다. `post-actions.test.ts`에서는 `@/lib/auth`, `next/headers`, `next/cache`, `@vercel/blob`을 mock 처리하고(인증·Next 런타임 API·외부 스토리지 호출까지 실제로 태울 이유는 없으니) `createPost`/`updatePost`/`deletePost`를 실제 DB에 대고 9개 케이스로 검증했다. slug 중복 체크, 시리즈 회차 3갈래 분기, 썸네일 교체 시 이전 blob 삭제 호출까지 전부 포함했다.

```ts
const { db } = await import("@/db");
const { posts } = await import("@/db/schema");

afterEach(async () => {
  await db.delete(posts);
});
```

3. CI 연결. `ci.yml`에 Lint·Typecheck 다음으로 `pnpm test` 단계를 추가했다. `DATABASE_URL`은 로컬처럼 `.env.test` 파일이 아니라 `secrets.TEST_DATABASE_URL`로 주입하게 했다. dotenv는 이미 값이 있는 환경변수를 덮어쓰지 않으니, CI에서는 `.env.test` 파일 없이 Actions Secrets 값이 그대로 쓰인다.

```yaml
- name: Test
  run: pnpm test
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

트러블슈팅: 세 군데서 막혔다

첫 번째는 설치 자체였다. 프로젝트 디렉터리에서 `pnpm add -D vitest`를 돌리면 store 경로를 확인하려고 만들었다 지우는 임시 파일에서 `EPERM: operation not permitted, unlink`가 계속 났다. `npm`으로 바꿔도 똑같았다. 원인을 붙잡고 있기보다 별도 디렉터리에 `package.json`·`pnpm-lock.yaml`·`src`만 복사해서 거기서 설치하고 테스트까지 돌려본 다음, 통과한 파일만 프로젝트로 옮기는 쪽을 택했다.

두 번째는 플랫폼 불일치였다. 이미 설치돼 있던 `node_modules`는 macOS(darwin-arm64)용이었는데, 리눅스 컨테이너에서 검증해보려니 `drizzle-kit push`를 돌릴 때 esbuild가 "설치된 건 darwin-arm64용인데 여긴 linux-arm64가 필요하다"며 실패했다. 별도로 리눅스 네이티브 `node_modules`를 새로 설치해서 스키마 push와 테스트 실행 모두 거기서 검증했다.

세 번째가 제일 오래 걸렸다. `post-actions.test.ts`를 단독으로 돌리면 9개 전부 통과하는데, `post-schema.test.ts`와 같이 돌리면 `createPost` 관련 3개 테스트가 간헐적으로 실패했다. `result.ok`는 `true`인데 곧바로 이어지는 `db.select()`가 방금 insert한 row를 못 찾는 식이었다. db 인스턴스가 두 개로 쪼개졌나 싶어 `testDb === dbModule.db`로 동일성부터 확인했는데 `true`였다. 순수 스크립트(`tsx`)로 동일한 insert-then-select 패턴을 재현해도 항상 성공했다. 결국 남는 원인은 Vitest가 기본적으로 테스트 파일들을 병렬 워커로 돌린다는 점이었고, `vitest.config.ts`에 `fileParallelism: false`를 추가해 파일을 순차 실행하게 하니 세 번 연속 24/24로 안정적으로 통과했다. 같은 원격 DB를 여러 워커가 동시에 두드릴 때 쓰기 직후 읽기가 안 보이는 현상이 있었던 것으로 보인다.

남은 것

GitHub 저장소 Settings → Secrets and variables → Actions에 `TEST_DATABASE_URL`을 아직 등록 안 했다. 등록 전까지는 CI의 Test 단계가 빈 연결 문자열로 실패할 테니, 이건 push 전에 직접 해야 한다.

`admin-stats.ts`의 통계 쿼리나 better-auth 관련 흐름은 아직 테스트가 없다. 이번엔 위험도가 가장 높다고 판단한 `post-actions.ts`부터 손을 댔고, 나머지는 필요할 때 같은 패턴(mock + 실제 test DB)으로 이어서 붙이면 된다.

mock 기반 단위 테스트는 아예 안 만들었다. 지금은 신뢰도를 우선해서 전부 실제 DB 통합 테스트로 짰는데, 나중에 순수 로직만 빠르게 검증하고 싶은 케이스가 늘어나면 그때 mock 방식을 다시 검토할 것 같다.
