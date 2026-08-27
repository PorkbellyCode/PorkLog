import type { Metadata } from "next";
import Image from "next/image";
import { projects, sideProjects } from "@/lib/projects";
import ProjectAccordion from "@/components/project-accordion";
import PrintButton from "@/components/print-button";
import SkillStack from "@/components/skill-stack";
import ContactLinks from "@/components/contact-links";

export const metadata: Metadata = {
  title: "Resume",
  description: "보이는 것 이상을 생각하는 개발자 김형준의 경력과 프로젝트.",
  alternates: { canonical: "/resume" },
  openGraph: {
    title: "김형준 | Resume",
    description: "보이는 것 이상을 생각하는 개발자 김형준의 경력과 프로젝트.",
    images: [{ url: "/og-resume.png", width: 1200, height: 630, alt: "김형준 | Resume" }],
    type: "profile",
  },
};

const STRENGTHS = [
  {
    title: "풀스택 이해도",
    desc: "백엔드 로직 수정, 쿼리 튜닝, 상용 솔루션(DRM·SSO) 연동까지 화면 너머의 동작을 파악하고 처리합니다.",
  },
  {
    title: "AI 활용 개발",
    desc: "Claude Code 등 AI 코딩 도구를 실무에 접목해 생산성을 높이고, PorkLog의 AI 기반 주간 Tech 뉴스 큐레이션 기능을 직접 설계·구현했습니다.",
  },
  {
    title: "복잡한 엔터프라이즈 UI",
    desc: "상용 그리드 커스텀, 다국어·개인화, 다수의 핵심 화면 개발 등 복잡도 높은 프론트엔드를 다룹니다.",
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
            <Image
              src="/khj.jpg"
              alt="김형준 증명사진"
              width={72}
              height={96}
              priority
              className="aspect-[3/4] w-16 shrink-0 rounded-lg border border-border-default object-cover"
            />
            <div>
              <h1 className="font-display text-2xl font-bold text-fg-default">
                김형준
                <span className="ml-2 text-base font-normal text-fg-muted">Hyeongjun Kim (1990.05.01)</span>
              </h1>
              <p className="mt-1 text-sm text-fg-muted">보이는 것 이상을 고려하는 개발자</p>
            </div>
            <div className="ml-auto">
              <PrintButton />
            </div>
          </div>

          <p className="text-sm leading-relaxed text-fg-default">
            프로소프트에서 풀스택 개발자로 일하며, 대규모 엔터프라이즈 시스템과 B2B 솔루션을 구축·고도화해 왔습니다.
            상용 그리드가 기본 제공하지 않는 기능의 커스텀 개발, 복잡한 상태 관리, 다국어·개인화 처리 등 복잡도 높은
            프론트엔드 UI/UX 최적화를 주력으로 하면서, 백엔드 로직 수정과 쿼리 튜닝, 폐쇄망 환경의 보안 조치까지
            완결성 있게 수행했습니다. 최근 생산성 향상에 큰 관심이 있어, Claude Code 등 AI 코딩 도구를
            업무와 사이드 프로젝트에 적극 적용하고 있습니다.
            프론트엔드를 중심에 두되, 화면 너머의 동작까지 이해하고 책임지는 개발을 지향합니다.
          </p>

          {/* 연락처 */}
          <ContactLinks />
        </section>

        {/* 기술 스택 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-fg-default border-b border-border-default pb-2">기술 스택</h2>
          <SkillStack />
        </section>

        {/* 강점 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-fg-default border-b border-border-default pb-2">강점</h2>
          <div className="grid gap-3 sm:grid-cols-2">
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
          <h2 className="text-lg font-bold text-fg-default border-b border-border-default pb-2">프로젝트</h2>
          <ProjectAccordion projects={projects} />
        </section>

        {/* 사이드 프로젝트 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-fg-default border-b border-border-default pb-2">사이드 프로젝트</h2>
          <ProjectAccordion projects={sideProjects} />
        </section>

        {/* 경력 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-fg-default border-b border-border-default pb-2">경력</h2>
          <div className="flex items-start gap-3 rounded-lg border border-border-default bg-bg-subtle p-4">
            <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true" className="mt-0.5 shrink-0 text-fg-muted">
              <path d="M6.75 0h2.5C10.216 0 11 .784 11 1.75V3h2.25c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 13.25 15H2.75A1.75 1.75 0 0 1 1 13.25v-8.5C1 3.784 1.784 3 2.75 3H5V1.75C5 .784 5.784 0 6.75 0Zm-.25 3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Zm-3.75 1.5a.25.25 0 0 0-.25.25v2.5h11v-2.5a.25.25 0 0 0-.25-.25Zm10.5 4.25h-11v4.5c0 .138.112.25.25.25h10.5a.25.25 0 0 1 .25-.25Z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-fg-default">프로소프트</p>
              <p className="mt-0.5 text-xs text-fg-muted">2023.7 ~ 현재 · 풀스택 개발</p>
            </div>
          </div>
        </section>

        {/* 학력 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-fg-default border-b border-border-default pb-2">학력</h2>
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
      </div>
    </main>
  );
}