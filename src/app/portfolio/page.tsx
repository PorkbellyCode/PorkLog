import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { sideProjects, type Decision, type SideProject } from "@/lib/projects";
import ProjectGallery from "@/components/project-gallery";
import SkillBadge from "@/components/skill-badge";

const DESCRIPTION =
  "혼자 기획·개발·배포한 사이드 프로젝트 PorkLog, WorkWrap, CRDD의 화면과 기술 결정.";

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

// 개요: 카드 격자 대신 목차처럼 한 줄씩 훑는 목록. 줄 전체가 아래 섹션 앵커다.
function Overview() {
  return (
    <nav aria-label="프로젝트 개요">
      <ul className="divide-y divide-border-default border-y border-border-default">
        {sideProjects.map((p, i) => {
          const cover = p.images[0];
          return (
            <li key={p.slug}>
              <a
                href={`#${p.slug}`}
                className="group grid grid-cols-[6.5rem_1fr] items-center gap-4 py-5 transition-colors hover:bg-bg-subtle sm:grid-cols-[13rem_1fr] sm:gap-6 sm:px-2"
              >
                <div className="aspect-[16/10] overflow-hidden rounded-md border border-border-default bg-[#1f2328] dark:border-white/20">
                  {cover ? (
                    <Image
                      src={cover.src}
                      alt=""
                      width={cover.width}
                      height={cover.height}
                      sizes="(min-width: 640px) 208px, 104px"
                      preload={i === 0}
                      className={`h-full w-full object-cover ${cover.height > cover.width ? "object-[50%_25%]" : "object-top"}`}
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center px-2 text-center text-xs text-white/60">
                      스크린샷 준비 중
                    </span>
                  )}
                </div>
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-display text-2xl font-bold tracking-tight text-fg-default transition-colors group-hover:text-accent-fg sm:text-3xl">
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
                </div>
              </a>
            </li>
          );
        })}
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
          <div key={r.label} className="grid grid-cols-[2.25rem_1fr] gap-3">
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

function ProjectSection({ p }: { p: SideProject }) {
  return (
    <section id={p.slug} aria-labelledby={`${p.slug}-title`} className="scroll-mt-20 space-y-8 border-t border-border-default pt-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 id={`${p.slug}-title`} className="font-display text-4xl font-bold tracking-tight text-fg-default sm:text-5xl">
            {p.name}
          </h2>
          <Status status={p.status} />
        </div>
        <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-fg-muted">
          <span>{p.period}</span>
          <span>{p.role}</span>
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-fg-default">{p.tagline}</p>

        {p.access && (
          <p className="max-w-2xl border-l-4 border-accent-brand bg-bg-subtle px-4 py-3 text-sm leading-relaxed text-fg-default">
            {p.access}
          </p>
        )}

        <dl className="grid max-w-3xl gap-x-8 gap-y-3 text-sm leading-relaxed sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-fg-default">지금 되는 것</dt>
            <dd className="mt-1 text-fg-muted">{p.works}</dd>
          </div>
          <div>
            <dt className="font-semibold text-fg-default">아직 안 되는 것</dt>
            <dd className="mt-1 text-fg-muted">{p.gaps}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-5">
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
        <ProjectGallery images={p.images} />
        <p className="font-mono text-xs text-fg-muted">{p.asOf}</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-fg-default">기술 결정</h3>
        <div className="mt-1 divide-y divide-border-default">
          {p.decisions.map((d) => (
            <DecisionItem key={d.title} decision={d} />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs text-fg-muted">사용 기술 전체</p>
        <div className="flex flex-wrap gap-1.5 opacity-75 [&>span]:px-2 [&>span]:py-0.5 [&>span]:text-xs">
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
      <div className="mx-auto w-full max-w-5xl space-y-14">
        <section className="space-y-4">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-fg-default sm:text-5xl">
            혼자 만들고
            <br />
            직접 운영하는 서비스
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-fg-muted">
            기획부터 배포까지 혼자 맡은 사이드 프로젝트 3개입니다. 모두 Next.js·TypeScript 풀스택이고 LLM API를
            연동했습니다. 회사 프로젝트는 고객사 시스템이라 화면을 공개할 수 없습니다. 대신 맡은 역할과 성과는{" "}
            <Link href="/resume" className="text-accent-fg underline underline-offset-4">
              Resume
            </Link>
            에 정리했습니다.
          </p>
        </section>

        <Overview />

        <div className="space-y-16">
          {sideProjects.map((p) => (
            <ProjectSection key={p.slug} p={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
