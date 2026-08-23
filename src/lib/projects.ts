export type Project = {
  name: string;
  period: string;
  org: string;
  summary: string;
  role: string;
  tasks: string[];
  tech: string[];
  images: { src: string; alt: string }[];
  links: { label: string; url: string }[];
};

// 회사 프로젝트 (시간순). 새 프로젝트는 객체 하나만 추가하면 됩니다.
// 스크린샷은 public/projects/ 에 두고 images에 경로 기재. (예: "/projects/wms-1.png")
export const projects: Project[] = [
  {
    name: "WMS React 마이그레이션",
    period: "2023.07 ~ 2024.03",
    org: "CTR",
    summary: "노후화된 .NET 기반 창고관리시스템(WMS)을 React 환경으로 전환",
    role: "프론트엔드 개발",
    tasks: [
      ".NET 기반 레거시 WMS의 화면 약 20개를 React로 마이그레이션·개발",
      "화면 응답 속도를 저해하던 DB 쿼리 튜닝·최적화 병행",
      "창고 관리 시스템 UI/UX 응답성 개선",
    ],
    tech: ["React", "JavaScript", "MSSQL"],
    images: [],
    links: [],
  },
  {
    name: "KonaFramework 개발 · 고도화",
    period: "2024.03 ~ 현재",
    org: "프로소프트 (자사)",
    summary: "신규 프로젝트 수주 대비 자사 공통 프레임워크의 범용성·완성도 향상",
    role: "풀스택 개발",
    tasks: [
      "MDI(Multi-Document Interface) 구조 최적화, 403/404 에러 핸들링 등 코어 기능 개발",
      "MariaDB·Oracle 기반 쿼리 작성 및 성능 튜닝",
      "메뉴·검색 팝업의 다국어 구조를 하드코딩에서 동적 코드 기반으로 재설계",
      "Redis를 활용한 리프레시 토큰 저장·검증 기반 인증 세션 관리 기능 개발",
      "여러 프로젝트와 병행하며 지속적으로 코어 고도화 진행",
    ],
    tech: ["Vue.js", "TypeScript", "JavaScript", "Java", "Spring Boot", "Redis", "MariaDB", "Oracle"],
    images: [],
    links: [],
  },
  {
    name: "모바일 경영자료실",
    period: "2024.06 ~ 2024.09",
    org: "현대로템",
    summary: "경영진 대상 민감 문서를 안전하게 열람·보관하고 접근 권한을 통제하는 시스템 구축",
    role: "풀스택 개발",
    tasks: [
      "문서뷰어·2단계 인증(2FA)·DRM 암복호화·그룹웨어 SSO 등 외부 솔루션 통합 아키텍처 구현",
      "모의해킹 결과에 따른 보안 조치를 운영·개발 환경에 즉시 반영",
      "외부 솔루션 라이선스 갱신 가이드 작성·배포",
    ],
    tech: ["Vue.js", "TypeScript", "JavaScript", "Java", "Spring Boot", "MariaDB"],
    images: [],
    links: [],
  },
  {
    name: "방산 보안포탈",
    period: "2024.08 ~ 2024.11",
    org: "현대로템 / 현대오토에버",
    summary: "방산망(폐쇄망) 환경의 엄격한 보안·결재·이력 관리 프로세스를 위한 보안포탈 구축",
    role: "풀스택 개발",
    tasks: [
      "기술관리·발송대장·신원조사 등 프로세스의 DB 테이블 레이아웃 설계 및 화면 기획·개발",
      "관리자 IP 통제, Refresh Token 기반 세션 제어 등 보안 특화 로직 개발",
      "보안 취약점 점검에 따른 암호화·SQL Injection 예외 처리 적용",
      "일 단위 G/W 인터페이스(DB to DB) 연동 배치 작업 및 대규모 마이그레이션 수행",
    ],
    tech: ["Vue.js", "TypeScript", "Java", "Spring Boot", "MSSQL"],
    images: [],
    links: [],
  },
  {
    name: "연결회계 솔루션 구축",
    period: "2024.12 ~ 2025.09",
    org: "KPMG / CJ올리브네트웍스",
    summary: "기존 연결회계솔루션과 자사 프레임워크를 융합하고 그룹사의 복잡한 재무 요구사항 반영",
    role: "풀스택 개발 · AA(애플리케이션 아키텍트)",
    tasks: [
      "내부거래 대사, 결산자료 모니터링, 전표 일괄 입력 등 60여 개 화면 실개발·유지보수",
      "프로젝트 전반에서 재사용되는 공통 컴포넌트 설계·개발",
      "전역 에러 핸들링 및 공통 로직 아키텍처 설계",
      "상용 그리드가 기본 제공하지 않는 복사/붙여넣기 시 숨김 컬럼 처리·유효성 검증 로직 커스텀 개발",
      "탭 영역 동적 스크롤링 및 다국어 렌더링 성능 개선",
      "정적분석·보안취약점 도구(SonarQube·Sparrow·Fortify) 기반 예외처리 및 취약점 조치 — 광범위 Exception 로직을 특정 예외로 전환해 83개 파일 개선",
      "통합테스트 단계에서 JIRA 이슈 265건 처리(결함 약 126건, 기능 개선·추가 약 79건 포함)로 통합 테스트 통과에 핵심 기여",
    ],
    tech: ["Vue.js", "TypeScript", "Java", "Spring Boot", "Oracle"],
    images: [],
    links: [],
  },
  {
    name: "SRM 시스템 유지보수",
    period: "2025.10 ~ 현재",
    org: "CTR",
    summary: "SRM(공급망 관리) 시스템 유지보수 및 개선 (진행 중)",
    role: "프론트엔드 개발",
    tasks: [
      "[주요 업무 — 추후 정리]",
    ],
    tech: [".NET Framework", "JavaScript", "MSSQL", "React", "Blazor", "Vue.js"],
    images: [],
    links: [],
  },
];

// 사이드 프로젝트. 개인 프로젝트는 여기에 추가합니다.
export const sideProjects: Project[] = [
  {
    name: "PorkLog",
    period: "2025.05.30 ~ 현재",
    org: "개인 프로젝트",
    summary: "포트폴리오 겸 개인 개발 블로그. 기획부터 개발·배포·운영까지 단독 수행",
    role: "1인 개발 (기획 · 개발 · 배포)",
    tasks: [
      "포스트 CRUD, 마크다운 에디터·이미지 업로드, 코드 하이라이팅 등 블로그 핵심 기능 구현",
      "게시글 시리즈 연속 읽기, 태그 분류, 목차(TOC)·예상 읽기시간·이전/다음 글 이동 기능 개발",
      "AI 기반 주간 Tech 뉴스 크롤링·큐레이션 기능 개발",
      "관리자용 방문자·조회수 통계 대시보드 구축, GA4 연동",
      "Vitest 기반 단위 테스트 작성",
      "GitHub Actions 기반 CI(lint·typecheck) 구축",
      "SEO 최적화(동적 sitemap·robots·canonical·OG 카드), RSS 피드 구현",
      "Drizzle ORM · Neon Postgres 기반 데이터 모델링, Better Auth 기반 관리자 인증, Vercel 자동 배포 구성",
    ],
    tech: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Neon Postgres",
      "Drizzle ORM",
      "Better Auth",
      "Vitest",
      "GitHub Actions",
      "Vercel",
    ],
    images: [],
    links: [
      { label: "GitHub", url: "https://github.com/PorkbellyCode/PorkLog" },
      { label: "라이브", url: "https://porklog.dev" },
    ],
  },
  {
    name: "WorkWrap",
    period: "2026.08.09 ~ 현재",
    org: "개인 프로젝트",
    summary: "음성으로 남긴 작업 메모를 자동 전사해 쌓아두고, LLM으로 하루치를 요약해주는 개인 생산성 서비스 (개발 중)",
    role: "1인 개발 (기획 · 개발 · 배포)",
    tasks: [
      "shadcn/ui(Base UI 프리미티브) 기반으로 전체 UI 재구축, 라이트/다크 모드를 처음부터 함께 지원하는 모노톤 디자인 시스템 적용",
      "초대 코드·매직링크 인증을 Google OAuth로 재설계, 로그인은 개방하되 관리자 승인 후 서비스를 이용하는 구조로 전환",
      "일일 작업 요약 기능을 SSE 스트리밍으로 구현, 재요약 시 덮어쓰지 않고 버전을 누적해 비교 가능하도록 설계",
      "음성 메모 녹음·전사 파이프라인 구축 — 브라우저별 오디오 포맷 대응, 전사 결과 실시간 스트리밍 표시",
      "관리자용 통계 대시보드 구축, 사용자·일자별 이용 현황 집계를 DB 쿼리로 처리하고 색각 이상까지 검증한 무채색 차트 적용",
      "Drizzle ORM · Neon Postgres 기반 데이터 모델링, Auth.js(NextAuth) 인증 연동, Vercel 자동 배포 구성",
    ],
    tech: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Neon Postgres",
      "Drizzle ORM",
      "Auth.js",
      "OpenAI API",
      "Vercel",
    ],
    images: [],
    links: [{ label: "GitHub", url: "https://github.com/PorkbellyCode/workwrap" }],
  },
];