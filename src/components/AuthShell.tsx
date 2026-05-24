import { PublicMasthead } from "@/components/layout/PublicMasthead";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col paper-texture">
      <PublicMasthead issue="Access" />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center border-b-2 border-rule-strong pb-6">
            <p className="text-kicker mb-2">实验记录簿</p>
            <h1 className="font-serif text-3xl text-ink">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{subtitle}</p>
            )}
          </div>
          <div className="bg-panel panel-border px-6 py-8 border-t-4 border-editorial">{children}</div>
        </div>
      </div>
    </div>
  );
}
