import type { Metadata } from "next";
import { sideProjects, type Decision, type SideProject } from "@/lib/projects";
import ProjectGallery from "@/components/project-gallery";
import SkillBadge from "@/components/skill-badge";
import TocRail from "@/components/toc-rail";
import type { TocItem } from "@/lib/toc";

// 오른쪽 목차 레일: 프로젝트 섹션(id=slug)만 나열한다.
const TOC: TocItem[] = sideProjects.map((p) => ({ depth: 2, text: p.name, id: p.slug }));

const DESCRIPTION =
  "사이드 프로젝트 PorkLog, WorkWrap, CRDD의 핵심 기능과 기술 결정.";

export const metadata: Metadata = {
  title: "Portfolio",
  description: DESCRIPTION,
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "김형준 | Portfolio",
    description: DESCRIPTION,
    siteName: "PorkLog",
    locale: "ko_KR",
    images: [{ url: "/portfolio/porklog/home.png", width: 1440, height: 900, alt: "PorkLog 홈 화면" }],
    type: "website",
  },
};

function Status({ status }: { status: SideProject["status"] }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-default px-2.5 py-0.5 text-xs text-fg-default">
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${status.state === "live" ? "bg-[#1a7f37] dark:bg-[#3fb950]" : "bg-[#9a6700] dark:bg-[#d29922]"}`}
      />
      {status.label}
    </span>
  );
}

// 개요: 목차처럼 한 줄씩 훑는 목록. 줄 전체가 아래 섹션 앵커다.
function Overview() {
  return (
    <nav aria-label="프로젝트 개요">
      <ul className="divide-y divide-border-default border-y border-border-default">
        {sideProjects.map((p) => (
          <li key={p.slug}>
            <a
              href={`#${p.slug}`}
              className="group block space-y-1 py-3.5 transition-colors hover:bg-bg-subtle sm:px-2"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-display text-xl font-bold tracking-tight text-fg-default transition-colors group-hover:text-accent-fg">
                  {p.name}
                </span>
                <Status status={p.status} />
              </div>
              <p className="text-sm leading-relaxed text-fg-default">{p.tagline}</p>
              <ul className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-xs text-fg-muted">
                {p.keyTech.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function DecisionItem({ decision }: { decision: Decision }) {
  const rows: { label: string; text: string; strong?: boolean }[] = [
    { label: "문제", text: decision.problem },
    { label: "선택", text: decision.choice },
  ];
  if (decision.result) rows.push({ label: "결과", text: decision.result, strong: true });

  return (
    <article className="grid gap-3 py-6 sm:grid-cols-[13rem_1fr] sm:gap-8">
      <h4 className="font-display text-lg font-semibold leading-snug text-fg-default">{decision.title}</h4>
      <dl className="space-y-3 text-sm leading-relaxed">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[3rem_1fr] gap-3">
            <dt className={`pt-px font-mono text-xs ${r.strong ? "font-semibold text-accent-fg" : "text-fg-muted"}`}>
              {r.label}
            </dt>
            <dd className={r.strong ? "font-medium text-fg-default" : "text-fg-default"}>{r.text}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z" />
    </svg>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <h3 className="text-sm font-semibold text-fg-muted">{children}</h3>;
}

function ProjectSection({ p }: { p: SideProject }) {
  return (
    <section id={p.slug} aria-labelledby={`${p.slug}-title`} className="scroll-mt-20 space-y-10 py-14 first:pt-0 last:pb-0">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 id={`${p.slug}-title`} className="font-display text-3xl font-bold tracking-tight text-fg-default sm:text-4xl">
            {p.name}
          </h2>
          <Status status={p.status} />
        </div>
        <p className="font-mono text-xs text-fg-muted">
          {p.period} · {p.asOf}
        </p>
        <p className="max-w-2xl text-lg leading-relaxed text-fg-default">{p.tagline}</p>

        {p.access && (
          <p className="max-w-2xl border-l-2 border-border-default pl-4 text-sm leading-relaxed text-fg-muted">
            {p.access}
          </p>
        )}

        <div className="flex flex-wrap gap-5 pt-1">
          {p.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-fg hover:underline hover:underline-offset-4"
            >
              {link.label}
              <ExternalIcon />
            </a>
          ))}
        </div>
      </header>

      <div className="space-y-3">
        <SectionLabel>주요 기능</SectionLabel>
        <ul className="max-w-3xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-fg-default marker:text-fg-muted">
          {p.tasks.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-1">
        <SectionLabel>기술 결정</SectionLabel>
        <div className="divide-y divide-border-default">
          {p.decisions.map((d) => (
            <DecisionItem key={d.title} decision={d} />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>화면</SectionLabel>
        <ProjectGallery images={p.images} />
      </div>

      <div className="space-y-3">
        <SectionLabel>사용 기술</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {p.tech.map((t) => (
            <SkillBadge key={t} name={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PortfolioPage() {
  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-fg-default sm:text-4xl">
          Portfolio
        </h1>

        <Overview />

        <div className="divide-y divide-border-default">
          {sideProjects.map((p) => (
            <ProjectSection key={p.slug} p={p} />
          ))}
        </div>
      </div>
      <TocRail items={TOC} />
    </main>
  );
}
