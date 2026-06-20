import { skillCategories, type SkillLevel } from "@/lib/stack";

const levelClass: Record<SkillLevel, string> = {
  3: "bg-accent-fg/15 text-accent-fg border-accent-fg/20",
  2: "bg-bg-subtle text-fg-default border-border-default",
  1: "bg-transparent text-fg-muted border-border-default",
};

export default function SkillStack() {
  return (
    <div className="space-y-4">
      {skillCategories.map((group) => (
        <div key={group.category} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
            {group.category}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.items.map((skill) => (
              <span
                key={skill.name}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm ${levelClass[skill.level]}`}
              >
                <span
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 bg-current"
                  style={{
                    maskImage: `url(/icons/${skill.icon}.svg)`,
                    WebkitMaskImage: `url(/icons/${skill.icon}.svg)`,
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                  }}
                />
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}