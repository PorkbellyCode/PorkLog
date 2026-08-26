export type Skill = {
  name: string;
  icon?: string; // public/icons/ 파일명(확장자 제외). 없으면 텍스트만 표시
};

export type SkillGroup = {
  label: string;
  items: Skill[];
};

export type SkillCategory = {
  category: string;
  groups: SkillGroup[];
};

// 기술스택 밖의 기술(프로젝트 사용기술 등)에 대한 아이콘 보충 매핑
const extraIcons: Record<string, string> = {
  "Better Auth": "betterauth",
  "Auth.js": "authdotjs",
  "OpenAI API": "openai",
  ".NET Framework": "dotnet",
  Blazor: "blazor",
};

// 기술명으로 아이콘 파일명을 찾는다. 없으면 undefined.
export function getSkillIcon(name: string): string | undefined {
  if (extraIcons[name]) return extraIcons[name];
  for (const category of skillCategories) {
    for (const group of category.groups) {
      const found = group.items.find((s) => s.name === name);
      if (found) return found.icon;
    }
  }
  return undefined;
}

export const skillCategories: SkillCategory[] = [
  {
    category: "Frontend",
    groups: [
      {
        label: "Languages",
        items: [
          { name: "TypeScript", icon: "typescript" },
          { name: "JavaScript", icon: "javascript" },
        ],
      },
      {
        label: "Frameworks",
        items: [
          { name: "Next.js", icon: "nextjs" },
          { name: "Vue.js", icon: "vue" },
        ],
      },
      {
        label: "Libraries / Tools",
        items: [
          { name: "React", icon: "react" },
          { name: "Tailwind CSS", icon: "tailwindcss" },
          { name: "shadcn/ui", icon: "shadcnui" },
          { name: "Vitest", icon: "vitest" },
        ],
      },
    ],
  },
  {
    category: "Backend",
    groups: [
      { label: "Languages", items: [{ name: "Java", icon: "java" }] },
      { label: "Frameworks", items: [{ name: "Spring Boot", icon: "springboot" }] },
      {
        label: "ORMs",
        items: [{ name: "MyBatis" }, { name: "JPA" }, { name: "Drizzle", icon: "drizzle" }],
      },
    ],
  },
  {
    category: "Database",
    groups: [
      {
        label: "Engines",
        items: [
          { name: "PostgreSQL", icon: "postgresql" },
          { name: "Oracle", icon: "oracle" },
          { name: "MSSQL", icon: "mssql" },
          { name: "MariaDB", icon: "mariadb" },
          { name: "Redis", icon: "redis" },
        ],
      },
    ],
  },
  {
    category: "Cloud & DevOps",
    groups: [
      { label: "Platforms", items: [{ name: "Vercel", icon: "vercel" }, { name: "Neon", icon: "neon" }] },
      { label: "CI/CD", items: [{ name: "GitHub Actions", icon: "githubactions" }] },
      { label: "Tools", items: [{ name: "Docker", icon: "docker" }] },
    ],
  },
];
