import { cn } from "@/lib/cn";
import { HTMLAttributes } from "react";

const variants = {
  info: "border-rule bg-panel text-ink",
  warning: "border-signal/40 bg-signal/5 text-ink",
  danger: "border-signal bg-signal/10 text-ink",
  success: "border-success/40 bg-success/5 text-ink",
};

export function Alert({
  variant = "info",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof variants }) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border px-4 py-3 text-sm panel-border",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
