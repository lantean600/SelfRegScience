import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";

export function PublicMasthead({
  className,
  issue = "Issue 01",
}: {
  className?: string;
  issue?: string;
}) {
  return (
    <header
      className={cn(
        "flex items-end justify-between gap-6 px-6 md:px-10 py-5 border-b-2 border-rule-strong",
        className,
      )}
    >
      <div>
        <p className="text-kicker text-accent">Self-Reg Science · {issue}</p>
        <Link href="/" className="no-underline hover:no-underline">
          <p className="font-serif text-2xl md:text-3xl text-ink mt-1 leading-none">自控力协议</p>
        </Link>
      </div>
      <ThemeToggle className="max-w-[220px] shrink-0" />
    </header>
  );
}
