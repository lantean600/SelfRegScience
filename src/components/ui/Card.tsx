import { cn } from "@/lib/cn";
import { HTMLAttributes } from "react";

const cardVariants = {
  default: "rounded-md bg-panel panel-border",
  narrative: "rounded-none bg-transparent border-0 shadow-none",
  stat: "rounded-sm bg-panel border-l-4 border-editorial border-y border-r border-rule panel-border",
  figure: "figure-frame rounded-none",
};

export function Card({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof cardVariants }) {
  return <div className={cn(cardVariants[variant], className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pt-5 pb-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-serif font-medium text-ink tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-1 text-sm text-ink-muted font-sans", className)} {...props} />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}

export function FigureFrame({
  caption,
  aside,
  children,
  className,
}: {
  caption: string;
  aside?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={className}>
      <figcaption className="figure-caption">
        <span className="text-kicker">{caption}</span>
        {aside && <span className="text-caption opacity-60">{aside}</span>}
      </figcaption>
      <div className="figure-frame relative min-h-[200px]">{children}</div>
    </figure>
  );
}
