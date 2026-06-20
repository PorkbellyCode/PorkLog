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
      ".NET 기반 레거시 WMS를 React 기반으로 전환",
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
    role: "프론트엔드 개발",
    tasks: [
      "MDI(Multi-Document Interface) 구조 최적화, 403/404 에러 핸들링 등 코어 기능 개발",
      "테마·색약 모드·메뉴 폭 등 개인화 설정 기능 개발",
      "메뉴·검색 팝업의 다국어 구조를 하드코딩에서 동적 코드 기반으로 재설계",
      "여러 프로젝트와 병행하며 지속적으로 코어 고도화 진행",
    ],
    tech: ["Vue.js", "TypeScript", "JavaScript", "Java", "Spring Boot", "MariaDB", "Oracle"],
    images: [],
    links: [],
  },
  {
    name: "모바일 경영자료실",
    period: "2024.06 ~ 2024.09",
    org: "현대로템",
    summary: "경영진 대상 민감 문서를 안전하게 열람·보관하고 접근 권한을 통제하는 시스템 구축",
    role: "프론트엔드 개발",
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
    role: "프론트엔드 개발",
    tasks: [
      "내부거래 대사, 결산자료 모니터링, 전표 일괄 입력 등 다수의 핵심 프로그램 실개발·유지보수",
      "상용 그리드가 기본 제공하지 않는 복사/붙여넣기 시 숨김 컬럼 처리·유효성 검증 로직 커스텀 개발",
      "탭 영역 동적 스크롤링 및 다국어 렌더링 성능 개선",
      "정적 분석 기반으로 다수 파일의 예외 처리 로직 구체화",
      "짧은 기간 동안 다수의 화면 개발과 결함 개선 요청을 완수하여 통합 테스트 통과에 핵심 기여",
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
    summary: "포트폴리오 겸 개인 개발 블로그. 기획부터 개발·배포까지 단독 수행",
    role: "1인 개발 (기획 · 개발 · 배포)",
    tasks: [
      "포스트 CRUD, 마크다운 에디터, 방문자 카운팅, 댓글(Giscus) 등 블로그 핵심 기능 구현",
      "Drizzle ORM · Neon Postgres 기반 데이터 모델링",
      "Better Auth 기반 관리자 인증, Vercel 자동 배포 구성",
    ],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Neon Postgres", "Drizzle ORM"],
    images: [],
    links: [
      { label: "GitHub", url: "https://github.com/PorkbellyCode/PorkLog" },
      { label: "라이브", url: "https://pork-log.vercel.app" },
    ],
  },
];