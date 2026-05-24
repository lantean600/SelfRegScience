import { cn } from "@/lib/cn";

export function Timeline({ className, children }: { className?: string; children: React.ReactNode }) {
  return <ul className={cn("space-y-0 border-l border-rule ml-2", className)}>{children}</ul>;
}

export function TimelineItem({
  title,
  meta,
  children,
  className,
}: {
  title: string;
  meta?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("relative pl-6 pb-6 last:pb-0", className)}>
      <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-accent border border-panel" />
      <p className="text-sm font-medium text-ink">{title}</p>
      {meta && <p className="text-xs text-ink-muted font-data mt-0.5">{meta}</p>}
      {children && <div className="mt-2 text-sm text-ink-muted">{children}</div>}
    </li>
  );
}
