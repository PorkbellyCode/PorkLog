# PorkLog

DB 기반 개인 기술 블로그. Next.js App Router + Neon Postgres + Drizzle ORM으로 만든 풀스택 프로젝트입니다.

> 진행 중인 학습 프로젝트입니다. 완성된 결과물보다 **점진적으로 쌓아 올린 git 커밋 흐름**에 신경 쓰며 만들고 있습니다.

## 기술 스택

**Core**
- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui

**Database**
- Neon Postgres (serverless) — `@neondatabase/serverless` HTTP 드라이버
- Drizzle ORM — 스키마 정의 + 마이그레이션 (`drizzle-kit push`)

**Content Pipeline**
- unified + remark + rehype — 마크다운 → HTML 비동기 변환
- rehype-pretty-code + Shiki — VS Code 동일 엔진의 코드 하이라이팅
- @tailwindcss/typography — `prose` 기반 마크다운 스타일

**Tooling**
- pnpm, dotenv

## 현재 기능

- [x] 홈 페이지: 글 목록 (최신순)
- [x] 상세 페이지: 슬러그 기반 라우팅 (`/posts/[slug]`) + 404 처리
- [x] 마크다운 렌더링 (h1~h6, 리스트, 강조 등)
- [x] 코드 블록 syntax highlighting

## 로드맵

- [ ] 어드민 페이지 + 인증 (Better Auth)
- [ ] 마크다운 에디터 (`@uiw/react-md-editor`)
- [ ] 입력 검증 (Zod)
- [ ] 댓글 (Giscus)
- [ ] 검색 (Pagefind)
- [ ] OG 이미지 (next/og)
- [ ] frosted glass 디자인 시스템
- [ ] Vercel 배포 + GitHub Actions CI

## 로컬 실행

### 사전 준비
1. [Neon Console](https://console.neon.tech)에서 Postgres 프로젝트 생성
2. 프로젝트 루트에 `.env.local` 생성 후 connection string 저장:
   ```
   DATABASE_URL="postgresql://..."
   ```

### 명령어
```bash
pnpm install
pnpm db:push       # 스키마 적용
pnpm dev           # 개발 서버 (http://localhost:3000)
pnpm db:studio     # DB GUI (선택)
```

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                  # 홈 (글 목록)
│   ├── posts/[slug]/page.tsx     # 상세 페이지
│   └── layout.tsx
├── components/ui/                # shadcn 컴포넌트
├── db/
│   ├── index.ts                  # Drizzle 클라이언트 (neon-http)
│   └── schema.ts                 # posts 테이블 스키마
└── lib/
drizzle.config.ts                 # Drizzle Kit 설정
```

## 개발 노트

이 프로젝트는 일부러 작은 단위로 커밋했습니다. **`git log`** 에서 각 기능이 어떤 순서로, 어떤 결정과 함께 쌓였는지 따라갈 수 있습니다.
