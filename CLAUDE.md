Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# PorkLog — Claude Code 작업 규칙

취업 포트폴리오용 개발 블로그(https://porklog.dev). Next.js 16 App Router · Neon Postgres + Drizzle · Better Auth(관리자 전용) · Vercel.
기능 목록과 스택은 `README.md`를 먼저 읽는다.

## 명령

- 패키지 매니저: **pnpm**
- 린트: `pnpm lint --max-warnings=0`
- 타입체크: `pnpm typecheck`
- 테스트: `pnpm test`
- 위 세 가지가 CI와 같다. 작업 완료 전에 반드시 통과시킨다.

## 공통 규칙

- 답변·주석·커밋 메시지는 한국어.
- `git stash` 금지. 작업을 분리해야 하면 git worktree를 쓴다.
- 커밋은 사용자가 확인한 뒤에만 한다. 이 레포는 작은 단위 커밋 흐름 자체가 포트폴리오다.
- `.env*`는 읽거나 수정하지 않는다.
- `pnpm db:push`는 실행하지 않는다(운영 DB에 바로 반영됨). 스키마를 바꾸면 사용자에게 알리고 사용자가 실행한다.
- 자기 담당 범위 밖 파일은 직접 고치지 말고, 담당자에게 메시지로 요청한다.

## 에이전트 팀 구성

리드(메인 세션)가 **설계자**다. 팀원은 `.claude/agents/`에 정의돼 있다.

| 이름 | 정의 | 모델 | 역할 |
|---|---|---|---|
| 리드 | (메인 세션) | Opus | 요구사항 정리, 설계안, 작업 분배, 최종 판단 |
| frontend | `frontend` | Sonnet | 페이지·컴포넌트·스타일·Resume 콘텐츠 |
| backend | `backend` | Sonnet | Server Actions·API 라우트·DB·인증·마크다운 파이프라인·Tech Digest |
| critic | `critic` | Opus | 설계와 코드의 허점 찾기, 린트·타입체크·테스트 실행 (코드 수정 안 함) |
| reader | `reader` | Sonnet | 블로그 독자·채용 담당자 관점에서 화면 문구·Resume·UX 평가 (코드 수정 안 함) |

### 작업 유형별 조합 — 매번 전원을 띄우지 않는다

- **기능 설계 논의**: 리드 + critic + reader
- **구현**: 리드 + frontend 및/또는 backend(필요한 쪽만) + critic
- **UX·문구·Resume 점검**: 리드 + reader
- **버그 조사**: 리드 + backend/frontend + critic (가설을 서로 반박하게 한다)

### 진행 순서

1. **계획** — 리드가 요구사항을 정리하고 설계안을 1~3개 낸다. 바꿀 파일과 담당자를 명시한다.
2. **검토** — critic(필요하면 reader)이 설계안을 반박한다. 리드는 반박을 반영해 안을 확정한다. 최대 2라운드.
3. **구현** — frontend/backend가 자기 담당 파일만 고친다. 둘이 맞물리는 타입·Server Action 시그니처·API 응답 형태는 backend가 먼저 정하고 frontend에 알린다.
4. **검증** — critic이 `pnpm lint --max-warnings=0` · `pnpm typecheck` · `pnpm test`를 돌리고 리뷰한다. 실패하면 담당자에게 돌려보낸다.
5. **보고** — 리드가 바뀐 내용, 남은 위험, 커밋 제안 메시지를 사용자에게 요약한다.

리드는 팀원이 끝나기 전에 직접 구현하지 않는다.

## 담당 범위

- **frontend**: `src/app/**/{page,layout,loading,error,not-found}.tsx`, `src/app/globals.css`, `src/app/login/login-animation.json`, `src/app/icon.svg`, `src/components/**`, `src/lib/{projects,stack,site,auth-client,utils}.ts`
- **backend**: `src/app/api/**`, `src/app/feed.xml/**`, `src/app/{robots,sitemap}.ts`, 위에 없는 `src/lib/**`(`tech-digest/` 포함), `src/db/**`, `drizzle/**`, `scripts/**`
- **공유 계약**(backend 소유, 바꾸기 전 frontend에 알림): `src/lib/post-schema.ts`, `src/db/schema.ts`의 타입, `src/lib/post-actions.ts`의 Server Action 시그니처, API 응답 형태
- 범위가 애매하면 리드가 정한다.
