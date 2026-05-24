"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className={cn("h-10 rounded-sm bg-surface panel-border", className)} />
    );
  }

  const options = [
    { value: "light", icon: Sun, label: "浅色" },
    { value: "dark", icon: Moon, label: "深色" },
    { value: "system", icon: Monitor, label: "系统" },
  ] as const;

  return (
    <div
      className={cn(
        "flex rounded-sm panel-border bg-panel p-0.5 gap-0.5",
        className,
      )}
      role="group"
      aria-label="主题"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1 min-h-9 px-2 rounded-sm text-xs transition-colors",
            (theme ?? "system") === value
              ? "bg-accent text-accent-fg"
              : "text-ink-muted hover:text-ink hover:bg-surface",
          )}
          title={label}
          aria-pressed={(theme ?? "system") === value}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
      <span className="sr-only">当前：{resolvedTheme}</span>
    </div>
  );
}
