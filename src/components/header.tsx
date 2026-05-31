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
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-4 px-4">
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
              className="text-sm px-2 hover:opacity-80 transition-opacity"
            >
              로그인
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
