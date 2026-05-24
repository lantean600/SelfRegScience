import { cn } from "@/lib/cn";
import Link from "next/link";
import { ButtonHTMLAttributes, forwardRef } from "react";

export const buttonVariants = {
  primary:
    "bg-accent text-accent-fg border-2 border-accent hover:brightness-110",
  secondary:
    "bg-panel text-ink border-2 border-rule-strong hover:bg-surface",
  ghost:
    "bg-transparent text-ink border-2 border-transparent hover:bg-surface hover:border-rule",
  danger:
    "bg-signal text-signal-fg border-2 border-signal hover:brightness-110",
  link: "bg-transparent text-accent border-0 underline-offset-4 hover:underline p-0 min-h-0",
  editorial:
    "bg-panel text-ink border-2 border-rule-strong hover:bg-surface shadow-[var(--shadow-figure)]",
  masthead:
    "bg-transparent text-ink border-0 border-b-2 border-transparent hover:border-rule-strong rounded-none px-0 min-h-0 font-serif",
};

export const buttonSizes = {
  sm: "min-h-8 px-3 text-xs",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-11 px-5 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", href, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center rounded-sm font-medium transition-[filter,background-color,border-color] duration-100 disabled:opacity-50 disabled:pointer-events-none",
      buttonVariants[variant],
      variant !== "link" && variant !== "masthead" && buttonSizes[size],
      className,
    );
    if (href) {
      return (
        <Link href={href} className={classes}>
          {props.children}
        </Link>
      );
    }
    return (
      <button ref={ref} type={type} className={classes} {...props} />
    );
  },
);
Button.displayName = "Button";
