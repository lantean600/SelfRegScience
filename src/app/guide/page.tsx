import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { GuideClient } from "@/components/guide/GuideClient";
import { PublicMasthead } from "@/components/layout/PublicMasthead";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export default async function GuidePage() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <AppShell>
        <PageHeader
          kicker="Chapter 00 — 概念导览"
          title="交互式协议概览"
          description="CTDP 节点森林分步演示 · 理论来源：edmond（知乎）"
        />
        <GuideClient showHeader={false} />
      </AppShell>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col paper-texture">
      <PublicMasthead issue="Guide" />
      <div className="border-b border-rule px-6 md:px-10 py-3 flex justify-end max-w-4xl mx-auto w-full">
        <Button href="/login" variant="masthead" size="sm">
          登录
        </Button>
      </div>
      <div className="px-6 md:px-10 py-10 max-w-4xl mx-auto w-full flex-1">
        <GuideClient />
      </div>
    </div>
  );
}
