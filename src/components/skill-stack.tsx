import { skillCategories } from "@/lib/stack";
import SkillBadge from "@/components/skill-badge";

export default function SkillStack() {
  return (
    <div className="space-y-5">
      {skillCategories.map((group) => (
        <div key={group.category} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-fg-default">
            {group.category}
          </p>
          <div className="space-y-1.5">
            {group.groups.map((g) => (
              <div key={g.label} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <p className="w-32 shrink-0 text-xs text-fg-muted">{g.label}</p>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((skill) => (
                    <SkillBadge key={skill.name} name={skill.name} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
