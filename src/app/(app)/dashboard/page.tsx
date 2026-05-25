import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, FigureFrame } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { CronTrigger } from "@/components/CronTrigger";
import { getNetworkSnapshot } from "@/lib/domain/ctdp-node";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const prisma = await getDb();

  const [snap, tree, notifications, executingNodes, awaitingNodes] =
    await Promise.all([
      getNetworkSnapshot(user.id),
      prisma.policyTree.findFirst({
        where: { userId: user.id, isActive: true },
        include: { nodes: { where: { status: "active" } } },
      }),
      prisma.notification.findMany({
        where: { userId: user.id, read: false },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.ctdpNode.findMany({
        where: { network: { userId: user.id }, state: "executing" },
        take: 3,
      }),
      prisma.ctdpNode.findMany({
        where: { network: { userId: user.id }, awaitingJudgment: true },
        take: 5,
      }),
    ]);

  const activePolicies = tree?.nodes.length ?? 0;
  const pct = Math.round(snap.network.completeness * 100);
  const successCount = snap.nodes.filter((n) => n.state === "success").length;

  return (
    <>
      <PageHeader
        kicker="Self-Reg Science · 实验记录簿"
        title="总览"
        description={user.email}
        actions={<CronTrigger />}
      />

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section>
            <p className="text-kicker mb-4">本期焦点</p>
            <div className="grid md:grid-cols-2 gap-8 items-end">
              <p className="text-display">
                {pct}
                <span className="text-3xl align-top font-serif">%</span>
              </p>
              <div className="border-t-2 border-rule-strong pt-4">
                <p className="text-editorial-body text-ink-muted">
                  网络完整度反映任务森林的执行覆盖率。当前 {snap.nodes.length} 个节点中，
                  {successCount} 个已结案。
                </p>
              </div>
            </div>
          </section>

          {(executingNodes.length > 0 || awaitingNodes.length > 0) && (
            <section>
              <p className="text-kicker mb-4">现在</p>
              <div className="columns-1 md:columns-2 gap-6 text-sm leading-relaxed">
                {executingNodes.map((n) => (
                  <Card key={n.id} variant="stat" className="mb-4 break-inside-avoid">
                    <CardBody>
                      <p>
                        <strong className="text-accent">执行中</strong> — {n.title}
                      </p>
                      <Button href="/ctdp" variant="primary" size="sm" className="mt-3">
                        前往 CTDP
                      </Button>
                    </CardBody>
                  </Card>
                ))}
                {awaitingNodes.map((n) => (
                  <Card key={n.id} variant="stat" className="mb-4 break-inside-avoid border-editorial">
                    <CardBody>
                      <p className="text-editorial">
                        <strong>待判定</strong> — {n.title}
                      </p>
                      <Button href="/ctdp" variant="danger" size="sm" className="mt-3">
                        裁决
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {notifications.length > 0 && (
            <section className="space-y-2">
              <p className="text-kicker mb-2">信号</p>
              {notifications.map((n) => (
                <Alert key={n.id} variant="warning">
                  {n.message}
                </Alert>
              ))}
            </section>
          )}

          <section>
            <p className="text-kicker mb-4">待办与记录</p>
            <div className="columns-1 md:columns-2 gap-8 text-sm leading-relaxed">
              <div className="break-inside-avoid mb-6">
                <h2 className="font-serif text-xl mb-3">CTDP 节点森林</h2>
                <Button href="/ctdp" variant="editorial" size="sm">
                  打开画布
                </Button>
              </div>
              <div className="break-inside-avoid mb-6">
                <h2 className="font-serif text-xl mb-3">RSIP 国策树</h2>
                <p className="text-ink-muted mb-3">活跃节点 {activePolicies} 个</p>
                <Button href="/rsip" variant="editorial" size="sm">
                  管理国策
                </Button>
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 lg:border-l-2 lg:border-rule-strong lg:pl-8 space-y-8">
          <p className="text-kicker">边栏读数</p>
          <dl className="space-y-6">
            <div className="border-l-4 border-editorial pl-3">
              <dt className="text-kicker">节点</dt>
              <dd className="font-serif text-3xl mt-1">{snap.nodes.length}</dd>
            </div>
            <div className="border-l-4 border-editorial pl-3">
              <dt className="text-kicker">成功</dt>
              <dd className="font-serif text-3xl mt-1">{successCount}</dd>
            </div>
            <div className="border-l-4 border-editorial pl-3">
              <dt className="text-kicker">国策</dt>
              <dd className="font-serif text-3xl mt-1">{activePolicies}</dd>
            </div>
          </dl>

          <FigureFrame caption="Fig. 0 — 指标摘要" aside="dashboard">
            <div className="p-4 space-y-4 bg-figure-bg">
              <Stat label="网络完整度" value={`${pct}%`} sub="CTDP 任务森林" />
              <Stat
                label="任务节点"
                value={snap.nodes.length}
                sub={`${successCount} 已成功`}
              />
            </div>
          </FigureFrame>
        </aside>
      </div>
    </>
  );
}
