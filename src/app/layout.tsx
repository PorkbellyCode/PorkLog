import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Toaster from "@/components/toaster";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/* 제목용 에디토리얼 세리프. 라틴 전용이라 한글 글자는 브라우저가
 * 글리프 단위로 notoSerifKr 로 폴백한다. */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

/* 한글 폰트는 next/font 메타데이터에 korean 서브셋이 없어 subsets 를 선언할 수 없다.
 * preload: false 로 두면 서브셋 전체(한글 포함)를 self-host 한다.
 * weight 를 생략하면 가변 폰트 한 벌만 받으므로 웨이트별 중복 다운로드가 없다. */
const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  display: "swap",
  preload: false,
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PorkLog",
    template: "%s | PorkLog",
  },
  description: "김형준의 개발 블로그, 일상을 곁들인.",
  openGraph: {
    siteName: "PorkLog",
    locale: "ko_KR",
    type: "website",
  },
  alternates: {
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${fraunces.variable} ${notoSerifKr.variable} ${notoSansKr.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && process.env.GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}