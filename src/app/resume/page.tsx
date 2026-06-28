import type { Metadata } from "next";
import { projects, sideProjects } from "@/lib/projects";
import ProjectAccordion from "@/components/project-accordion";
import SkillStack from "@/components/skill-stack";

export const metadata: Metadata = {
  title: "Resume",
  description: "보여지는 것 이상을 고려하는 개발자 김형준의 소개 페이지",
};

const STACK = [
  "Vue.js",
  "React",
  "TypeScript",
  "JavaScript",
  "HTML/CSS",
  "Java",
  "Spring Boot",
];

const STRENGTHS = [
  {
    title: "복잡한 엔터프라이즈 UI",
    desc: "상용 그리드 커스텀, 다국어·개인화, 다수의 핵심 화면 개발 등 복잡도 높은 프론트엔드를 다룹니다.",
  },
  {
    title: "풀스택 이해도",
    desc: "백엔드 로직 수정, 쿼리 튜닝, 상용 솔루션(DRM·SSO) 연동까지 화면 너머의 동작을 파악하고 처리합니다.",
  },
  {
    title: "품질과 보안 의식",
    desc: "정적분석 기반 예외처리, 보안 취약점 조치, 다수의 결함 개선 완수 등 코드 품질과 보안을 챙깁니다.",
  },
];

export default function ResumePage() {
  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl space-y-10">
        {/* 인트로 */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src="/khj.jpg"
              alt="김형준 증명사진"
              className="h-16 w-16 shrink-0 rounded-full border border-border-default object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-fg-default">
                김형준
                <span className="ml-2 text-base font-normal text-fg-muted">Hyeongjun Kim (1990.05.01)</span>
              </h1>
              <p className="mt-1 text-sm text-fg-muted">보여지는 것 이상을 고려하는 개발자</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-fg-default">
            프로소프트에서 풀스택 개발자로 일하며, 대규모 엔터프라이즈 시스템과 B2B 솔루션을 구축·고도화해 왔습니다.
            상용 그리드가 기본 제공하지 않는 기능의 커스텀 개발, 복잡한 상태 관리, 다국어·개인화 처리 등 복잡도 높은
            프론트엔드 UI/UX 최적화를 주력으로 하면서, 백엔드 로직 수정과 쿼리 튜닝, 폐쇄망 환경의 보안 조치까지
            완결성 있게 수행했습니다. 프론트엔드를 중심에 두되, 화면 너머의 동작까지 이해하고 책임지는 개발을 지향합니다.
          </p>
        </section>

        {/* 경력 */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-fg-default">경력</h2>
          <div className="flex items-start gap-3 rounded-lg border border-border-default bg-bg-subtle p-4">
            <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true" className="mt-0.5 shrink-0 text-fg-muted">
              <path d="M6.75 0h2.5C10.216 0 11 .784 11 1.75V3h2.25c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 13.25 15H2.75A1.75 1.75 0 0 1 1 13.25v-8.5C1 3.784 1.784 3 2.75 3H5V1.75C5 .784 5.784 0 6.75 0Zm-.25 3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Zm-3.75 1.5a.25.25 0 0 0-.25.25v2.5h11v-2.5a.25.25 0 0 0-.25-.25Zm10.5 4.25h-11v4.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25Z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-fg-default">프로소프트</p>
              <p className="mt-0.5 text-xs text-fg-muted">2023.7 ~ 현재 · 풀스택 개발</p>
            </div>
          </div>
        </section>

        {/* 학력 */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-fg-default">학력</h2>
          <div className="flex items-start gap-3 rounded-lg border border-border-default bg-bg-subtle p-4">
            <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true" className="mt-0.5 shrink-0 text-fg-muted">
              <path d="M8.211.146a.75.75 0 0 0-.422 0l-7 2.1A.75.75 0 0 0 .5 2.974v.526a.75.75 0 0 0 .75.75h13.5a.75.75 0 0 0 .75-.75v-.526a.75.75 0 0 0-.289-.728l-7-2.1ZM2.5 5.75a.75.75 0 0 0-1.5 0v6.5a.75.75 0 0 0 1.5 0Zm4 0a.75.75 0 0 0-1.5 0v6.5a.75.75 0 0 0 1.5 0Zm4 0a.75.75 0 0 0-1.5 0v6.5a.75.75 0 0 0 1.5 0Zm4 0a.75.75 0 0 0-1.5 0v6.5a.75.75 0 0 0 1.5 0ZM1.5 15.25a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1-.75-.75Z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-fg-default">LaGuardia Community College</p>
              <p className="mt-0.5 text-xs text-fg-muted">Computer Science 졸업 (미국 뉴욕)</p>
            </div>
          </div>
        </section>

        {/* 기술 스택 */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-fg-default">기술 스택</h2>
          <SkillStack />
        </section>

        {/* 강점 */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-fg-default">강점</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {STRENGTHS.map((s) => (
              <div key={s.title} className="rounded-lg border border-border-default bg-bg-default p-4">
                <p className="text-sm font-semibold text-fg-default">{s.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-fg-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 프로젝트 */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-fg-default">프로젝트</h2>
          <ProjectAccordion projects={projects} />
        </section>

        {/* 사이드 프로젝트 */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-fg-default">사이드 프로젝트</h2>
          <ProjectAccordion projects={sideProjects} />
        </section>

        {/* 연락처 */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-fg-default">연락처</h2>
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: "GitHub",
                href: "https://github.com/PorkbellyCode",
                external: true,
                path: "M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z",
              },
              {
                label: "이메일",
                href: "mailto:PorkbellyCode@gmail.com",
                external: false,
                path: "M1.75 2A1.75 1.75 0 0 0 0 3.75v8.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25v-8.5A1.75 1.75 0 0 0 14.25 2Zm12.5 1.5a.25.25 0 0 1 .25.25v.852l-6 3.96-6-3.96V3.75a.25.25 0 0 1 .25-.25ZM1.5 5.81v6.44c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.81l-5.815 3.84a.75.75 0 0 1-.87 0Z",
              },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="inline-flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-sm text-fg-default transition-colors hover:bg-bg-subtle"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d={c.path} />
                </svg>
                {c.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}