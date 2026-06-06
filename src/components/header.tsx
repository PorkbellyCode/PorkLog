import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import HeaderSearch from "@/components/header-search";
import SearchBar from "@/components/search-bar";
import ThemeToggle from "@/components/theme-toggle";
import LogoutButton from "@/components/logout-button";

// GitHub 스타일: 라이트/다크 무관하게 항상 어두운 헤더, sticky.
export default async function Header() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="sticky top-0 z-40 h-14 bg-[#1f2328] text-white">
      <div className="flex h-full items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          PorkLog
        </Link>

        <div className="flex items-center gap-2">
          <Suspense fallback={<SearchBar initialQuery="" />}>
            <HeaderSearch />
          </Suspense>
          {session ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              aria-label="로그인"
              title="로그인"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M2 2.75C2 1.784 2.784 1 3.75 1h7.5c.966 0 1.75.784 1.75 1.75v3a.75.75 0 0 1-1.5 0v-3a.25.25 0 0 0-.25-.25h-7.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-3a.75.75 0 0 1 1.5 0v3A1.75 1.75 0 0 1 11.25 15h-7.5A1.75 1.75 0 0 1 2 13.25Zm6.56 4.5h5.69a.75.75 0 0 1 0 1.5H8.56l1.97 1.97a.749.749 0 1 1-1.06 1.06L6.22 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.749.749 0 1 1 1.06 1.06L8.56 7.25Z" />
              </svg>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
