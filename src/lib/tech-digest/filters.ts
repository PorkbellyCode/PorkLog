import type { DigestItem } from "./types";

// ── 릴리스 ────────────────────────────────────────────

const PRERELEASE_WORD = /\b(canary|rc|beta|alpha|experimental|nightly)\b/i;
const PRERELEASE_NEXT = /-next\b/i;

// 제목에서 첫 번째 x.y(.z) 버전을 뽑는다. "TypeScript 6.0" 처럼 패치가 없으면 0 으로 본다.
export function parseReleaseVersion(title: string): { major: number; minor: number; patch: number } | null {
  // "vscode-typescript/v1.0.0", "react-devtools@8.0.0" 같은 하위 패키지 태그는 제외한다.
  if (title.includes("/") || /@\d/.test(title)) return null;
  const match = title.match(/(\d+)\.(\d+)(?:\.(\d+))?/);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3] ?? 0) };
}

// 프리릴리스가 아니고 마이너 이상(x.y.0)인 릴리스인가.
export function isStableMinorRelease(title: string): boolean {
  if (PRERELEASE_WORD.test(title) || PRERELEASE_NEXT.test(title)) return false;
  const version = parseReleaseVersion(title);
  return version !== null && version.patch === 0;
}

// 패치 릴리스라도 보안 수정이면 소개할 가치가 있다.
export function isSecurityRelease(title: string, body: string): boolean {
  if (PRERELEASE_WORD.test(title) || PRERELEASE_NEXT.test(title)) return false;
  if (parseReleaseVersion(title) === null) return false;
  return /\bsecurity\b|CVE-\d{4}-\d+/i.test(`${title} ${body}`);
}

// 저장소 릴리스 중 (마이너 이상이거나 보안 패치인) 가장 최근 1개.
export function pickLatestStableRelease(items: DigestItem[]): DigestItem | undefined {
  return items
    .slice()
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .find((item) => isStableMinorRelease(item.title) || isSecurityRelease(item.title, item.body));
}

// ── 피드 항목 ─────────────────────────────────────────

// 카테고리 허용 목록이 있으면 그중 하나를 가진 항목만 남긴다(OpenAI 고객 사례는 카테고리가 비어 있거나 Startup 이다).
export function matchesCategoryAllowList(categories: string[], allow: string[] | undefined): boolean {
  if (!allow) return true;
  return categories.some((c) => allow.includes(c));
}

// ── GitHub 레포 / 모델 ────────────────────────────────

const EXCLUDED_KEYWORDS = /nsfw|uncensored|abliterat|jailbreak|\bcrack(ed)?\b|keygen|\bcheats?\b|emulator|porn|hentai|erotic|\bleaked?\b/i;

export function hasExcludedKeyword(text: string): boolean {
  return EXCLUDED_KEYWORDS.test(text);
}

export function isCandidateRepo(repo: {
  fullName: string;
  description: string;
  fork?: boolean;
  archived?: boolean;
}): boolean {
  if (repo.fork || repo.archived) return false;
  if (repo.description.trim().length < 10) return false;
  return !hasExcludedKeyword(`${repo.fullName} ${repo.description}`);
}

// ── 지난 글에 이미 나온 링크 ──────────────────────────

// 비교용으로 링크를 정규화한다: 해시·추적 파라미터·끝 슬래시 제거, 소문자 호스트.
export function normalizeLink(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    for (const key of [...u.searchParams.keys()]) {
      if (key.startsWith("utm_")) u.searchParams.delete(key);
    }
    return `${u.protocol}//${u.host.toLowerCase()}${u.pathname.replace(/\/+$/, "")}${u.search}`;
  } catch {
    return url;
  }
}

// 마크다운 본문의 http(s) 링크를 모두 뽑는다.
export function extractLinks(markdown: string): string[] {
  const found = markdown.match(/https?:\/\/[^\s)<>\]]+/g) ?? [];
  return [...new Set(found.map(normalizeLink))];
}

export function excludeSeenLinks<T extends { link: string }>(items: T[], seen: Iterable<string>): T[] {
  const seenSet = new Set(seen);
  return items.filter((item) => !seenSet.has(normalizeLink(item.link)));
}
