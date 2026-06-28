# PorkLog

DB 기반 개인 기술 블로그 겸 포트폴리오입니다. 기획부터 개발·배포까지 직접 수행한 1인 풀스택 프로젝트로, 완성된 결과물만큼이나 **작은 단위로 쌓아 올린 커밋 흐름**에 신경 쓰며 만들고 있습니다.

🔗 **라이브** → https://pork-log.vercel.app

## 기술 스택

| 분류 | 사용 기술 |
| --- | --- |
| **Core** | Next.js 16 (App Router), React 19, TypeScript (strict) |
| **Styling** | Tailwind CSS v4, shadcn/ui, GitHub Primer 스타일 디자인 |
| **Database** | Neon Postgres (serverless), Drizzle ORM |
| **Auth** | Better Auth (관리자 전용) |
| **Content** | `@uiw/react-md-editor`, unified · remark · rehype, Shiki, remark-gfm |
| **Comments** | Giscus (GitHub Discussions) |
| **Storage** | Vercel Blob |
| **기타** | Zod (검증), sonner (토스트), bcryptjs, next-themes |
| **Deploy** | Vercel |

## 진행 상황

핵심 블로그 기능은 완료된 상태이며, 현재 포트폴리오용 **About Me 페이지를 개발 중**입니다.
아래는 커밋 이력 기준 진행 상황입니다. (자세한 흐름은 [`git log`](https://github.com/PorkbellyCode/PorkLog/commits) 참고)

### ✅ 완료

- [x] 게시글 CRUD — 마크다운 작성(에디터·이미지 업로드)·렌더링·코드 하이라이팅
- [x] 관리자 인증 (Better Auth, 회원가입 비활성화)
- [x] 카테고리 분류 + 상단 카테고리 탭
- [x] 제목 검색 · 페이지네이션
- [x] 댓글 (Giscus) + 목록 댓글 수 집계
- [x] 방명록 (익명 작성, 글별 비밀번호 보호)
- [x] 조회수 · 사이트 방문자 카운팅
- [x] 다크 / 라이트 모드
- [x] GitHub 스타일 디자인 시스템 적용 (frosted glass에서 전환)
- [x] 토스트 알림 ·
- [x] 게시글 내보내기
- [x] Vercel 자동 배포

### 🚧 진행 중

- [ ] Resume 페이지 — 구조·내용 지속 업데이트 예정

### 📋 예정

- [ ] 홈 화면 구조 개선 (Resume 페이지 진입점 추가)
- [ ] 게시글 시리즈 연속 읽기 기능

---

> 이 프로젝트는 일부러 작은 단위로 커밋했습니다. `git log`에서 각 기능이 어떤 순서로, 어떤 결정과 함께 쌓였는지 따라갈 수 있습니다.
