export type ProjectImage = {
  src: string;
  alt: string;
  // 이 화면에서 직접 한 일. 화면 이름이 아니라 작업 내용을 적는다.
  caption?: string;
  width: number;
  height: number;
};

export type Project = {
  name: string;
  period: string;
  org: string;
  summary: string;
  role: string;
  tasks: string[];
  tech: string[];
  images: ProjectImage[];
  links: { label: string; url: string }[];
};

// 기술 결정: 문제 → 선택 → 결과. 결과는 측정한 숫자가 있을 때만 적는다.
export type Decision = {
  title: string;
  problem: string;
  choice: string;
  result?: string;
};

// /portfolio 에 소개하는 사이드 프로젝트. Resume 에는 slug·tagline 만 요약으로 나간다.
export type SideProject = Project & {
  slug: string;
  status: { label: string; state: "live" | "dev" };
  tagline: string; // 카드·Resume 용 한 문장
  keyTech: string[]; // 개요에 보여줄 핵심 기술 4~5개
  decisions: Decision[];
  works: string; // 지금 되는 것
  gaps: string; // 아직 안 되는 것·제약
  asOf: string; // 스크린샷·설명 기준 시점
  access?: string; // 바로 써볼 수 없을 때의 안내
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
// 스크린샷은 public/portfolio/<slug>/ 에 두고 images에 경로 기재.
export const sideProjects: SideProject[] = [
  {
    slug: "porklog",
    name: "PorkLog",
    period: "2025.05.30 ~ 현재",
    org: "개인 프로젝트",
    status: { label: "운영 중", state: "live" },
    tagline: "기획부터 배포·운영까지 혼자 만든 개발 블로그. 주간 AI 뉴스가 매주 자동으로 올라옵니다.",
    summary: "포트폴리오 겸 개인 개발 블로그. 기획부터 개발·배포·운영까지 단독 수행",
    role: "1인 개발 (기획 · 개발 · 배포)",
    tasks: [
      "마크다운 에디터·이미지 업로드, 예약 발행·비공개 글, 시리즈 연속 읽기·태그·목차 등 블로그 핵심 기능 구현",
      "AI 기반 주간 Tech 뉴스 큐레이션 — RSS·GitHub·Hugging Face·OpenRouter 수집 후 LLM 요약, Cron으로 발행",
      "관리자용 방문자·조회수 통계 대시보드 구축, GA4 연동",
      "SEO 최적화(동적 sitemap·canonical·OG 카드)·RSS 피드, Vitest 단위 테스트와 GitHub Actions CI 구축",
    ],
    tech: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Neon",
      "Drizzle",
      "Better Auth",
      "Vitest",
      "GitHub Actions",
      "Vercel",
    ],
    keyTech: ["Next.js", "TypeScript", "Neon", "Drizzle", "Vercel"],
    decisions: [
      {
        title: "주간 AI 뉴스를 사람 손 없이 발행",
        problem: "RSS·GitHub·Hugging Face·OpenRouter 네 곳의 소식을 매주 손으로 모아 정리하는 일을 없애려고 했습니다.",
        choice:
          "Vercel Cron이 매주 네 곳을 병렬로 수집하고(Promise.allSettled) LLM이 요약해 dev-news 시리즈로 발행합니다. 한 곳이 실패해도 나머지로 진행하고, 같은 날짜의 글이 이미 있으면 건너뛰어 중복 발행을 막습니다. 호출은 CRON_SECRET으로 보호합니다.",
      },
      {
        title: "시리즈 회차를 서버가 매기도록 변경",
        problem: "작성 폼에서 회차를 직접 입력받아, 번호 관리와 검증 규칙이 사람에게 달려 있었습니다.",
        choice:
          "회차 입력칸과 스키마 검증을 없애고, 저장할 때 서버가 해당 시리즈의 마지막 회차 + 1을 매깁니다. 시리즈를 바꾸면 새 시리즈의 다음 번호를 받습니다.",
      },
      {
        title: "이미 공개된 글의 발행일시는 바꿀 수 없게",
        problem: "예약 발행을 넣자, 이미 공개된 글의 발행일시도 수정 화면에서 바꿀 수 있게 됐습니다.",
        choice:
          "서버가 발행 시각이 지난 글의 변경 값을 무시하고 기존 값을 유지합니다. 폼에서도 입력을 비활성화하고 이유를 안내해, 바뀌지 않는 값을 바꾼 것처럼 보이지 않게 했습니다. 이 규칙은 Vitest 테스트로 고정했습니다.",
      },
    ],
    works: "글 작성·예약 발행, 시리즈·태그·검색, 방문자 통계, 주간 AI 뉴스 자동 발행이 운영 중입니다.",
    gaps: "글은 관리자만 쓸 수 있고, 댓글은 GitHub 계정(Giscus)으로만 남길 수 있습니다.",
    asOf: "2026.10 기준",
    images: [
      {
        src: "/portfolio/porklog/home.png",
        alt: "PorkLog 홈 화면. 소개 히어로, 카테고리 탭, 검색창, 글 목록이 보인다.",
        caption: "홈 목록·카테고리 탭·제목/본문 검색과 Resume로 들어가는 히어로를 구현했습니다.",
        width: 1440,
        height: 900,
      },
      {
        src: "/portfolio/porklog/post-series.png",
        alt: "글 상세 상단에 dev-news 시리즈 9편의 목차가 있고 현재 글이 굵게 표시된다.",
        caption: "시리즈 목차를 만들었습니다. dev-news 시리즈 9편이 순서대로 나열되고, 지금 읽는 글은 굵게 표시됩니다.",
        width: 1440,
        height: 900,
      },
      {
        src: "/portfolio/porklog/toc-digest.png",
        alt: "AI 주간 Tech 뉴스 본문과 오른쪽에 펼쳐진 목차 레일. 읽는 절이 주황색으로 표시된다.",
        caption: "본문 목차를 오른쪽 레일로 펼치고, 읽고 있는 절을 따라가며 강조하도록 했습니다.",
        width: 1440,
        height: 900,
      },
      {
        src: "/portfolio/porklog/admin-stats.png",
        alt: "관리자 통계 대시보드. 방문자·게시물·평균 조회수 카드, 최근 30일 방문자 추이 차트, 인기 게시물 Top 10 표가 보인다.",
        caption:
          "관리자 통계 대시보드를 만들었습니다. 오늘·누적 방문자, 총 게시물, 평균 조회수 카드와 최근 30일 방문자 추이 차트, 인기 글 Top 10 표를 방문 기록과 조회수를 직접 집계해 보여줍니다.",
        width: 1440,
        height: 900,
      },
      {
        src: "/portfolio/porklog/mobile-dark.png",
        alt: "다크 모드로 본 PorkLog 홈의 모바일 화면.",
        caption: "390px 폭과 다크 모드에서도 같은 목록이 깨지지 않게 맞췄습니다.",
        width: 780,
        height: 1688,
      },
    ],
    links: [
      { label: "GitHub", url: "https://github.com/PorkbellyCode/PorkLog" },
      { label: "라이브", url: "https://porklog.dev" },
    ],
  },
  {
    slug: "workwrap",
    name: "WorkWrap",
    period: "2026.08.09 ~ 현재",
    org: "개인 프로젝트",
    status: { label: "개발 중 · 베타", state: "dev" },
    tagline: "음성으로 남긴 작업 메모를 전사해 쌓고, 하루치를 LLM으로 요약해 주는 서비스.",
    summary: "음성으로 남긴 작업 메모를 자동 전사해 쌓아두고, LLM으로 하루치를 요약해주는 개인 생산성 서비스 (개발 중)",
    role: "1인 개발 (기획 · 개발 · 배포)",
    tasks: [
      "음성 메모 녹음·전사 파이프라인 구축 — 브라우저별 오디오 포맷 대응, 전사 결과 실시간 스트리밍",
      "LLM 일일 요약을 SSE 스트리밍으로 구현, 재요약 시 버전을 누적해 비교 가능하도록 설계",
      "모바일 우선 UI와 PWA 적용 — 하단 탭 바·Drawer 기반 화면, shadcn/ui 라이트/다크 디자인 시스템",
      "Google OAuth 로그인과 관리자 승인제(승인·사용중지·재승인), 관리자 통계 대시보드 구축",
    ],
    tech: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Neon",
      "Drizzle",
      "Auth.js",
      "OpenAI API",
      "Vercel",
    ],
    keyTech: ["Next.js", "TypeScript", "OpenAI API", "Neon", "Auth.js"],
    decisions: [
      {
        title: "브라우저마다 다른 녹음 포맷 맞추기",
        problem:
          "Chrome·Firefox는 webm, Safari는 mp4만 녹음하는데, 전사 API는 파일 확장자로 포맷을 판별합니다.",
        choice:
          "mimeType과 확장자를 짝지은 후보 목록을 두고, MediaRecorder.isTypeSupported로 브라우저가 지원하는 첫 후보를 골라 녹음·업로드합니다.",
      },
      {
        title: "전사와 요약을 끝날 때까지 기다리지 않게",
        problem: "전사·요약은 응답까지 시간이 걸려, 완료될 때까지 빈 화면을 보게 됩니다.",
        choice:
          "두 API 모두 SSE로 스트리밍합니다. 전사는 delta 이벤트를 그때그때 보내고 done 이벤트에 전체 텍스트를 함께 실어, 클라이언트가 조각을 다시 이어붙이지 않아도 됩니다. 25MB 상한은 API를 호출하기 전에 걸러냅니다.",
      },
      {
        title: "재요약은 덮어쓰지 않고 버전으로 쌓기",
        problem: "같은 날 요약을 다시 만들면 이전 결과가 사라져 사용자가 어느 쪽이 나은지 비교할 수 없습니다.",
        choice:
          "요약을 저장할 때 해당 날짜의 마지막 버전 + 1로 새 행을 만들고, 조회는 버전 순으로 합니다.",
      },
    ],
    works: "음성 녹음과 전사, 하루 요약과 버전 비교, PWA 설치, 관리자 승인·사용중지가 동작합니다.",
    gaps: "관리자 승인을 받아야 쓸 수 있고, 녹음 한 건은 전사 API 상한인 25MB까지입니다.",
    asOf: "2026.10 기준",
    access: "관리자 승인제라 바로 사용은 어렵습니다. 화면은 아래 스크린샷으로 확인하세요.",
    images: [
      {
        src: "/portfolio/workwrap/dashboard.png",
        alt: "WorkWrap 메모 화면. 업무 탭, 날짜별 메모 카드, 텍스트 입력창, 큰 녹음 버튼, 하단 탭 바가 보인다.",
        caption:
          "메모 화면입니다. 업무 탭으로 메모를 나누고, 날짜별 메모를 고정·수정·삭제할 수 있게 했습니다. 큰 녹음 버튼과 하단 탭 바(메모·요약·관리)를 모바일 우선으로 구성했습니다.",
        width: 780,
        height: 1688,
      },
      {
        src: "/portfolio/workwrap/transcribe.png",
        alt: "녹음 중인 WorkWrap 화면. 파형과 녹음 시간이 보이고 전사된 문장이 입력창에 채워져 있다.",
        caption:
          "녹음 중 화면입니다. 파형을 그리며 녹음하면 전사된 문장이 입력창에 스트리밍으로 채워지도록 구현했습니다.",
        width: 780,
        height: 1688,
      },
      {
        src: "/portfolio/workwrap/summary.png",
        alt: "WorkWrap 일일 요약 화면. 버전 탭, 오늘 한 일과 진행 중인 일 요약, 복사·공유·삭제 버튼, 배경 정보 입력이 보인다.",
        caption:
          "일일 요약 화면입니다. 다시 요약하면 v1·v2처럼 버전이 쌓여 탭으로 비교할 수 있고, 사용자·업무 맥락 같은 배경 정보를 요약에 함께 쓸 수 있게 했습니다.",
        width: 780,
        height: 1688,
      },
      {
        src: "/portfolio/workwrap/admin.png",
        alt: "WorkWrap 관리 화면. 사용자·승인 대기·메모·요약 수 카드, 최근 14일 사용량 막대 차트, 사용자 목록이 보인다.",
        caption:
          "관리 화면입니다. 사용자·승인 대기·메모·요약 수 카드와 최근 14일 사용량 차트를 보여 주고, 사용자를 중지하거나 재승인할 수 있게 했습니다.",
        width: 1440,
        height: 900,
      },
    ],
    links: [
      { label: "GitHub", url: "https://github.com/PorkbellyCode/workwrap" },
      { label: "라이브", url: "https://workwrap-ochre.vercel.app" },
    ],
  },
  {
    slug: "crdd",
    name: "CRDD",
    period: "2026.09.02 ~ 현재",
    org: "개인 프로젝트",
    status: { label: "개발 중 · 베타", state: "dev" },
    tagline: "AI가 짠 코드를 내가 얼마나 설명할 수 있는지, 프로젝트 구조 위에 부채비율로 보여주는 서비스.",
    summary:
      "AI가 만든 코드를 개발자가 얼마나 이해하고 있는지 프로젝트 구조 위에 인지부채 비율로 보여주고, 코드 기반 퀴즈로 줄여나가는 서비스 (개발 중, 초기 MCP 서버 버전은 웹 안정화 후 완성 예정)",
    role: "1인 개발 (기획 · 개발 · 배포)",
    tasks: [
      "public 레포 주소만으로 그래프 추출 → 개념 지도까지 만드는 분석 파이프라인 구축 (porklog 기준 3.5초, LLM 호출 0회, 분석 직후 소스 삭제)",
      "개념별 부채비율 지도와, 커밋 고정 코드로 흐름·설계 이유·영향을 묻는 LLM 퀴즈 구현 — 힌트·설명 단계를 거쳐 점수에 반영",
      "재분석 시 파일 집합 유사도(Jaccard)로 개념 키를 이어받아 점수 이력이 끊기지 않도록 설계",
      "여러 LLM 제공자를 지원하는 BYOK 구조 — 사용자 API 키는 브라우저에만 보관",
    ],
    tech: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Turso",
      "Drizzle",
      "Auth.js",
      "Docker",
      "Fly.io",
      "GitHub Actions",
      "MCP",
    ],
    keyTech: ["Next.js", "TypeScript", "Turso", "Docker", "Fly.io"],
    decisions: [
      {
        title: "구조 지도는 LLM 없이 만들기",
        problem:
          "코드 구조 지도를 만드는 단계에서 LLM을 쓰면 API 키가 있어야 하고 응답도 느려집니다. 게다가 퀴즈 전에 소스를 서버에 남겨 두고 싶지 않았습니다.",
        choice:
          "얕은 clone(--depth 1)을 받아 구조 추출 도구(Graphify)를 자식 프로세스로 실행하고, 개념 이름은 규칙으로 붙입니다(LLM 이름 정리는 선택 단계). 끝나면 소스를 삭제하고, 퀴즈에 쓸 코드는 분석한 커밋 SHA로 고정한 raw 주소에서 파일 단위로 다시 가져옵니다. Node와 Python을 한 컨테이너에 담아 Fly.io에 배포합니다.",
        result: "porklog 기준 레포 주소 입력부터 지도까지 3.5초(clone 1.0초 · 추출 2.2초 · 이름·배치 0.3초), LLM 호출 0회.",
      },
      {
        title: "재분석해도 점수 이력이 이어지게",
        problem:
          "Graphify의 커뮤니티 번호는 크기순이라 분석할 때마다 다시 매겨집니다. 점수를 번호에 붙이면 재분석 뒤 엉뚱한 개념에 점수가 붙습니다.",
        choice:
          "개념마다 파일 집합 해시로 영속 키를 만들고, 재분석 때는 이전 개념과 파일 집합의 Jaccard 유사도가 0.5 이상인 쌍을 높은 순으로 1:1 매칭해 키를 이어받습니다. 짝을 못 찾은 개념만 새 키를 받습니다.",
      },
      {
        title: "퀴즈 진행을 순수 상태 머신으로 분리",
        problem:
          "같은 문항을 여러 번 찍어 맞히거나 '모르겠어요'로 넘어가도 점수가 같으면, 부채비율이 이해도를 나타내지 못합니다.",
        choice:
          "문항 진행을 first → hint → explanation → unresolved 상태 머신(순수 함수)으로 떼어 채점(LLM)·저장(DB)과 분리했습니다. 단계마다 한 번만 답할 수 있고, 배점은 첫 시도 1.0 · 힌트 후 0.6 · 설명 후 0.3 · 못 풂 0입니다.",
      },
    ],
    works: "레포 분석, 개념별 부채비율 지도, 퀴즈와 점수 반영, 여러 LLM 제공자 선택이 동작합니다.",
    gaps: "새 레포 분석은 GitHub 로그인이 필요하고 퀴즈에는 본인의 LLM API 키가 필요합니다. MCP 서버 버전은 웹이 안정된 뒤 완성할 예정입니다.",
    asOf: "2026.10 기준",
    images: [
      {
        src: "/portfolio/crdd/landing.png",
        alt: "CRDD 랜딩. 왼쪽에 소개 문구, 오른쪽에 줄마다 색 막대가 붙은 코드 화면이 있다.",
        caption:
          "랜딩 화면에서 서비스 개념을 코드 커버리지 거터로 구현했습니다. 줄 옆 색 막대가 첫 시도에 설명함·힌트 후 설명·설명 못함·아직 안 물음을 나타냅니다.",
        width: 1440,
        height: 900,
      },
      {
        src: "/portfolio/crdd/analysis.png",
        alt: "porklog 레포의 분석 결과. 13개 개념 중 2개를 측정했고 전체 부채비율 96%, 개념 지도와 선택한 개념의 퀴즈 시작 패널이 보인다.",
        caption:
          "porklog 레포를 실제로 분석한 결과입니다. 13개 개념 중 2개만 측정했고, 측정하지 않은 개념은 부채 100%로 계산해 전체 부채비율이 96%로 나옵니다. 개념을 고르면 오른쪽에 심볼·파일 목록과 퀴즈 시작 버튼이 나오도록 구현했습니다.",
        width: 1440,
        height: 900,
      },
      {
        src: "/portfolio/crdd/quiz.png",
        alt: "CRDD 퀴즈 화면. 문항 1/3, 커밋에 고정한 코드 조각, 내 답변과 채점·놓친 포인트 피드백이 보인다.",
        caption:
          "퀴즈 화면입니다. 분석한 커밋에 고정한 코드 조각을 보여 주고, 답변을 LLM이 채점해 놓친 포인트를 알려 줍니다. '모르겠어요'로 다음 단계로 넘길 수도 있습니다.",
        width: 1440,
        height: 900,
      },
    ],
    links: [
      { label: "GitHub", url: "https://github.com/PorkbellyCode/crdd" },
      { label: "라이브", url: "https://crdd.fly.dev" },
    ],
  },
];
