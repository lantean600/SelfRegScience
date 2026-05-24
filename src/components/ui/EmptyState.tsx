import { cn } from "@/lib/cn";

export function EmptyState({
  quote,
  title,
  description,
  action,
  className,
}: {
  quote?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md bg-panel panel-border px-8 py-12 text-center border-t-4 border-editorial",
        className,
      )}
    >
      {quote && (
        <p className="font-serif italic text-xl text-ink-muted leading-relaxed max-w-md mx-auto mb-8">
          「{quote}」
        </p>
      )}
      <h3 className="font-serif text-lg text-ink">{title}</h3>
      {description && (
        <p className="mt-3 text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
