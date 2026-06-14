"use client";

import * as Accordion from "@radix-ui/react-accordion";
import type { Project } from "@/lib/projects";

export default function ProjectAccordion({ projects }: { projects: Project[] }) {
  return (
    <Accordion.Root
      type="single"
      collapsible
      defaultValue="project-0"
      className="divide-y divide-border-default overflow-hidden rounded-lg border border-border-default"
    >
      {projects.map((project, i) => (
        <Accordion.Item key={i} value={`project-${i}`} className="bg-bg-default">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-subtle">
              <span className="min-w-0">
                <span className="text-sm font-semibold text-fg-default">{project.name}</span>
                <span className="ml-2 text-xs text-fg-muted">{project.org}</span>
              </span>
              <svg
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
                className="shrink-0 text-fg-muted transition-transform group-data-[state=open]:rotate-180"
              >
                <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z" />
              </svg>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="px-4 pb-4 pt-1">
            <p className="mb-2 text-xs text-fg-muted">
              {project.period} · {project.role}
            </p>
            <p className="mb-3 text-sm text-fg-default">{project.summary}</p>

            {project.tasks.length > 0 && (
              <ul className="mb-3 list-disc space-y-1 pl-5">
                {project.tasks.map((task, j) => (
                  <li key={j} className="text-sm text-fg-default">
                    {task}
                  </li>
                ))}
              </ul>
            )}

            {project.tech.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {project.tech.map((t, j) => (
                  <span
                    key={j}
                    className="rounded-md border border-border-default bg-bg-subtle px-2 py-0.5 text-xs text-fg-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {project.images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {project.images.map((img, j) => (
                  <img
                    key={j}
                    src={img.src}
                    alt={img.alt}
                    className="h-32 rounded-md border border-border-default object-cover"
                  />
                ))}
              </div>
            )}

            {project.links.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {project.links.map((link, j) => (
                  <a
                    key={j}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-accent-fg hover:underline"
                  >
                    {link.label}
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                      <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z" />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}