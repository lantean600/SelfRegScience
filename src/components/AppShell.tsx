"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GitBranch,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  ScrollText,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";

const nav = [
  { href: "/dashboard", label: "总览", en: "Overview", icon: LayoutDashboard },
  { href: "/ctdp", label: "CTDP", en: "Node Forest", icon: GitBranch },
  { href: "/rsip", label: "RSIP", en: "Stabilization", icon: ListTree },
  { href: "/review", label: "复盘", en: "Review", icon: ScrollText },
  { href: "/guide", label: "入门指南", en: "Guide", icon: BookOpen },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {nav.map(({ href, label, en, icon: Icon }, i) => {
        const active =
          pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        const num = String(i + 1).padStart(2, "0");
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              className={cn(
                "group flex items-start gap-3 py-2.5 px-2 min-h-10 transition-colors",
                active
                  ? "text-ink font-medium border-l-2 border-editorial pl-[calc(0.5rem-2px)]"
                  : "text-ink-muted hover:text-ink border-l-2 border-transparent",
              )}
            >
              <span className="text-kicker w-6 shrink-0 pt-0.5 opacity-70">{num}</span>
              <span className="flex flex-col leading-tight min-w-0">
                <span className="flex items-center gap-2 text-sm">
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                  {label}
                </span>
                <span className="text-caption mt-0.5 normal-case tracking-widest">{en}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh flex bg-surface">
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r-2 border-rule-strong bg-panel/90">
        <div className="px-5 py-6 border-b border-rule">
          <Link href="/dashboard" className="no-underline hover:no-underline block">
            <p className="text-kicker">Self-Reg Science</p>
            <p className="font-serif text-xl text-ink mt-2 leading-none">自控力协议</p>
            <p className="text-caption mt-2 normal-case">实验记录簿</p>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <p className="text-kicker px-2 mb-4">目录</p>
          <NavLinks />
        </nav>
        <div className="px-4 py-5 border-t border-rule space-y-3">
          <ThemeToggle />
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" aria-hidden />
              退出
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between gap-3 px-4 py-3 border-b-2 border-rule-strong bg-panel">
          <Link href="/dashboard" className="font-serif text-lg no-underline">
            SRS
          </Link>
          <button
            type="button"
            className="min-h-10 min-w-10 flex items-center justify-center rounded-sm border-2 border-rule-strong"
            onClick={() => setOpen(!open)}
            aria-label={open ? "关闭菜单" : "打开菜单"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {open && (
          <div className="lg:hidden border-b border-rule bg-panel px-4 py-4">
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-4 space-y-3">
              <ThemeToggle />
              <form action="/api/auth/logout" method="post">
                <Button type="submit" variant="secondary" size="sm" className="w-full">
                  退出
                </Button>
              </form>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 md:px-10 py-8 md:py-12 max-w-6xl w-full mx-auto page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
