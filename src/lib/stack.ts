export type SkillLevel = 1 | 2 | 3; // 3=주력, 2=보통, 1=입문

export type Skill = {
  name: string;
  icon: string; // public/icons/ 파일명(확장자 제외)
  level: SkillLevel;
};

export const skillCategories: { category: string; items: Skill[] }[] = [
  {
    category: "Frontend",
    items: [
      { name: "React", icon: "react", level: 3 },
      { name: "TypeScript", icon: "typescript", level: 3 },
      { name: "Vue.js", icon: "vue", level: 3 },
      { name: "JavaScript", icon: "javascript", level: 3 },
      { name: "Next.js", icon: "nextjs", level: 3 },
      { name: "Tailwind CSS", icon: "tailwindcss", level: 3 },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Java", icon: "java", level: 3 },
      { name: "Spring Boot", icon: "springboot", level: 3 },
    ],
  },
  {
    category: "Database",
    items: [
      { name: "Oracle", icon: "oracle", level: 3 },
      { name: "MariaDB", icon: "mariadb", level: 3 },
      { name: "MSSQL", icon: "mssql", level: 3 },
      { name: "PostgreSQL", icon: "postgresql", level: 3 },
      { name: "Neon", icon: "neon", level: 3 },
      { name: "Redis", icon: "redis", level: 3 },
      { name: "Drizzle ORM", icon: "drizzle", level: 3 },
    ],
  },
  {
    category: "Cloud",
    items: [
      { name: "Vercel", icon: "vercel", level: 2 },
      { name: "AWS", icon: "aws", level: 1 },
    ],
  },
  {
    category: "DevOps",
    items: [
      { name: "Docker", icon: "docker", level: 2 },
      { name: "GitHub Actions", icon: "githubactions", level: 2 },
      { name: "Nginx", icon: "nginx", level: 1 },
      { name: "Jenkins", icon: "jenkins", level: 1 },
      { name: "Ubuntu", icon: "ubuntu", level: 1 },
    ],
  },
];