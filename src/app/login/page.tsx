"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import { authClient } from "@/lib/auth-client";
import animationData from "./login-animation.json";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authClient.signIn.email({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message ?? "로그인에 실패했습니다.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  const inputClass =
    "w-full h-11 rounded-md border border-border-default bg-bg-default px-3 text-sm text-fg-default placeholder:text-fg-muted focus:border-accent-fg focus:outline-none focus:ring-2 focus:ring-accent-fg/30 transition-colors";

  return (
    <main className="flex min-h-svh items-center justify-center bg-bg-subtle p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* PorkLog: 최상단, 크게 */}
          <h1 className="text-7xl font-bold tracking-tight text-fg-default">
            PorkLog
          </h1>
          {/* Lottie: PorkLog 아래, 간격(mt-6) */}
          <Lottie
            animationData={animationData}
            loop
            className="mx-auto mt-6 h-[154px] w-[154px]"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            autoComplete="email"
            required
            className={inputClass}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            required
            className={inputClass}
          />

          {error && (
            <p className="rounded-md border border-danger-fg/30 bg-danger-fg/10 px-3 py-2 text-sm text-danger-fg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-md bg-accent-fg text-sm font-medium text-white hover:bg-accent-fg/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "로그인 중…" : "로그인"}
          </button>
        </form>
      </div>
    </main>
  );
}