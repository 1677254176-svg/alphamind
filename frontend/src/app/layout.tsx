import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorBoundary } from "@/components/error-boundary";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "AlphaMind — AI Investment Research Platform",
  description: "Personal Bloomberg + Notion + AI Analyst. Build your investment knowledge base.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased">
        <ErrorBoundary>
          <AppShell>{children}</AppShell>
        </ErrorBoundary>
      </body>
    </html>
  );
}