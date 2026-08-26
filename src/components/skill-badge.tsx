import { getSkillIcon } from "@/lib/stack";

export default function SkillBadge({ name }: { name: string }) {
  const icon = getSkillIcon(name);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-bg-subtle px-2.5 py-1 text-sm text-fg-default">
      {icon && (
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 bg-current"
          style={{
            maskImage: `url(/icons/${icon}.svg)`,
            WebkitMaskImage: `url(/icons/${icon}.svg)`,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
        />
      )}
      {name}
    </span>
  );
}
