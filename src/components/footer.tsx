import VisitorCounter from "@/components/visitor-counter";
import { GITHUB_URL, EMAIL } from "@/lib/site";

// Octicon path
const ICONS = {
  github:
    "M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z",
  mail: "M1.75 2A1.75 1.75 0 0 0 0 3.75v8.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25v-8.5A1.75 1.75 0 0 0 14.25 2Zm12.5 1.5a.25.25 0 0 1 .25.25v.852l-6 3.96-6-3.96V3.75a.25.25 0 0 1 .25-.25ZM1.5 5.81v6.44c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.81l-5.815 3.84a.75.75 0 0 1-.87 0Z",
  rss: "M2.002 2.725a.75.75 0 0 1 .797-.699C8.79 2.42 13.58 7.21 13.974 13.201a.75.75 0 0 1-1.497.098C12.13 8.02 7.98 3.87 2.7 3.522a.75.75 0 0 1-.699-.797ZM2 13a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm.84-5.32a.75.75 0 0 1 .82-.673 6.5 6.5 0 0 1 5.833 5.833.75.75 0 1 1-1.493.147 5 5 0 0 0-4.487-4.487.75.75 0 0 1-.673-.82Z",
};

const LINKS = [
  { label: "GitHub", href: GITHUB_URL, icon: ICONS.github, external: true },
  { label: "Email", href: `mailto:${EMAIL}`, icon: ICONS.mail, external: false },
  { label: "RSS", href: "/feed.xml", icon: ICONS.rss, external: false },
];

export default function Footer() {
  return (
    <footer className="border-t border-border-default">
      <div className="flex flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-fg-muted sm:flex-row">
        <p>© {new Date().getFullYear()} PorkLog</p>

        <div className="flex items-center gap-2">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              aria-label={l.label}
              title={l.label}
              {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-fg-default/5 hover:text-fg-default"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d={l.icon} />
              </svg>
            </a>
          ))}
        </div>

        <VisitorCounter />
      </div>
    </footer>
  );
}
