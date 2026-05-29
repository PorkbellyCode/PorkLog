import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import ThemeToggle from "@/components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "PorkLog",
  description: "개발자의 잡다한 기록",
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
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}