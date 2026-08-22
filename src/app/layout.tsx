import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Toaster from "@/components/toaster";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

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
    <html lang="ko" suppressHydrationWarning>
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