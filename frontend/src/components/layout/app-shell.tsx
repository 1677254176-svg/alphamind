"use client";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, FileText, GitBranch, Search, Briefcase,
  StickyNote, MessageSquare, Clock, Calendar, Settings, Bell, Activity,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stocks", label: "Stocks", icon: TrendingUp },
  { href: "/theses", label: "Theses", icon: FileText },
  { href: "/industries", label: "Industries", icon: GitBranch },
  { href: "/screener", label: "Screener", icon: Search },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/decisions", label: "Decisions", icon: Clock },
  { href: "/catalyst", label: "Catalysts", icon: Calendar },
  { href: "/health", label: "Status", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [health, setHealth] = useState<{ status: string; sources: { source: string; reachable: boolean }[] } | null>(null);

  useEffect(() => {
    fetch("/api/v1/health")
      .then(r => r.json())
      .then(setHealth)
      .catch(() => {});
  }, [pathname]);

  const healthySources = health?.sources?.filter(s => s.reachable).length || 0;
  const totalSources = health?.sources?.length || 0;
  const statusColor = !health ? "text-zinc-600" : health.status === "healthy" ? "text-emerald-400" : "text-amber-400";

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <aside className="w-56 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-cyan-400 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">AM</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">AlphaMind</span>
          </Link>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  isActive ? "bg-zinc-800 text-white font-medium border-r-2 border-violet-500" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}>
                <item.icon className="w-4 h-4" />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span className="text-zinc-500">
              数据源: {healthySources}/{totalSources} 可用
            </span>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6">
          <input type="text" placeholder="搜索股票、笔记、Thesis... (⌘K)"
            className="w-80 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors" />
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-zinc-400 hover:text-zinc-200 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}