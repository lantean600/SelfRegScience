import { cn } from "@/lib/cn";
import { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-kicker block mb-1.5", className)}
      {...props}
    />
  );
}

export function Hint({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-1.5 text-xs text-ink-muted", className)} {...props} />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full min-h-10 rounded-sm bg-panel px-3 text-sm text-ink panel-border",
        "placeholder:text-ink-muted/70",
        "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full min-h-10 rounded-sm bg-panel px-3 text-sm text-ink panel-border",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full min-h-24 rounded-sm bg-panel px-3 py-2 text-sm text-ink panel-border resize-y",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      {label && <Label>{label}</Label>}
      {children}
      {error && <Hint className="text-signal">{error}</Hint>}
      {hint && !error && <Hint>{hint}</Hint>}
    </div>
  );
}
