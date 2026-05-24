import { cn } from "@/lib/cn";

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  className,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-10 page-enter border-b-2 border-rule-strong pb-6", className)}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          {kicker && <p className="text-kicker mb-2">{kicker}</p>}
          <h1 className="font-serif text-4xl md:text-5xl text-ink leading-[0.95] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-prose text-sm text-ink-muted leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
