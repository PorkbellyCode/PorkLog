import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { projects, sideProjects } from "@/lib/projects";
import ProjectAccordion from "@/components/project-accordion";
import PrintButton from "@/components/print-button";
import SkillStack from "@/components/skill-stack";
import ContactLinks from "@/components/contact-links";
import TocRail from "@/components/toc-rail";
import type { TocItem } from "@/lib/toc";

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

// 오른쪽 목차 레일: 인트로와 각 섹션 h2(id)를 나열한다.
const TOC: TocItem[] = [
  { depth: 2, text: "소개", id: "intro" },
  { depth: 2, text: "경력", id: "career" },
  { depth: 2, text: "기술 스택", id: "stack" },
  { depth: 2, text: "프로젝트", id: "projects" },
  { depth: 2, text: "사이드 프로젝트", id: "side-projects" },
  { depth: 2, text: "학력", id: "education" },
];

export default function ResumePage() {
  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl space-y-10">
        {/* 인트로 */}
        <section id="intro" className="scroll-mt-20 space-y-4">
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
              <h1 className="font-display text-2xl font-bold text-fg-default sm:text-3xl">
                김형준
                <span className="ml-2 text-base font-normal text-fg-muted">Hyeongjun Kim (1990.05.01)</span>
              </h1>
              <p className="mt-1 text-sm text-fg-muted">보이는 것 이상을 생각하는 개발자</p>
            </div>
            <div className="ml-auto">
              <PrintButton />
            </div>
          </div>

          <p className="text-sm leading-relaxed text-fg-default">
            프로소프트에서 풀스택 개발자로 일하며 엔터프라이즈 시스템의 프론트엔드를 중심으로 백엔드 로직 수정과 쿼리 튜닝,
            폐쇄망 보안 조치까지 맡아 왔습니다. 연결회계 솔루션 구축에서는 60여 개 화면을 개발하고, 정적분석 기반
            예외처리로 83개 파일을 개선했습니다. Claude Code 등 AI 코딩 도구를 업무와 사이드 프로젝트에 적용하고 있습니다.
          </p>

          {/* 연락처 */}
          <ContactLinks />
        </section>

        {/* 경력 */}
        <section className="space-y-3">
          <h2 id="career" className="scroll-mt-20 text-xl font-bold text-fg-default border-b border-border-default pb-2">경력</h2>
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

        {/* 기술 스택 */}
        <section className="space-y-3">
          <h2 id="stack" className="scroll-mt-20 text-xl font-bold text-fg-default border-b border-border-default pb-2">기술 스택</h2>
          <SkillStack />
        </section>

        {/* 프로젝트 */}
        <section className="space-y-3">
          <h2 id="projects" className="scroll-mt-20 text-xl font-bold text-fg-default border-b border-border-default pb-2">프로젝트</h2>
          <ProjectAccordion projects={projects} />
        </section>

        {/* 사이드 프로젝트 */}
        <section className="space-y-3">
          <h2 id="side-projects" className="scroll-mt-20 text-xl font-bold text-fg-default border-b border-border-default pb-2">사이드 프로젝트</h2>
          <ul className="divide-y divide-border-default overflow-hidden rounded-lg border border-border-default">
            {sideProjects.map((p) => {
              const live = p.links.find((l) => l.label === "라이브");
              return (
                <li key={p.slug} className="space-y-1 bg-bg-default px-4 py-3">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-semibold text-fg-default">{p.name}</span>
                    <span className="text-xs text-fg-muted">{p.period}</span>
                  </p>
                  <p className="text-sm text-fg-default">{p.tagline}</p>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <Link href={`/portfolio#${p.slug}`} className="text-accent-fg hover:underline print:hidden">
                      자세히 보기
                    </Link>
                    {/* 인쇄물에서는 링크 href 가 보이지 않으므로 주소를 텍스트로 남긴다. */}
                    <span className="hidden text-fg-muted print:inline">
                      porklog.dev/portfolio#{p.slug}
                    </span>
                    {live && (
                      <a
                        href={live.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-fg-muted hover:text-accent-fg hover:underline"
                      >
                        {live.url.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 학력 */}
        <section className="space-y-3">
          <h2 id="education" className="scroll-mt-20 text-xl font-bold text-fg-default border-b border-border-default pb-2">학력</h2>
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
      <TocRail items={TOC} />
    </main>
  );
}