"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  GitBranch,
  Search,
  Briefcase,
  StickyNote,
  MessageSquare,
  Clock,
  Calendar,
  Settings,
  Bell,
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
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="w-56 border-r border-zinc-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-zinc-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-cyan-400 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">AM</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">AlphaMind</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-white font-medium border-r-2 border-violet-500"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-700 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Investor</p>
            <p className="text-xs text-zinc-500 truncate">Pro Plan</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search stocks, notes, theses... (⌘K)"
              className="w-80 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-zinc-400 hover:text-zinc-200 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
