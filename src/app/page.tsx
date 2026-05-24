import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PublicMasthead } from "@/components/layout/PublicMasthead";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Hairline } from "@/components/ui/Hairline";

const concepts = [
  {
    title: "CTDP",
    subtitle: "Chained Time-Delay Protocol",
    body: "神圣座位、链式时延与任务节点森林，破解启动困难与破窗效应。",
  },
  {
    title: "下必为例",
    subtitle: "Precedent Law",
    body: "违规时仅二选一：断裂清零，或永久允许并写入判例库。",
  },
  {
    title: "RSIP",
    subtitle: "Recursive Stabilization Iteration",
    body: "国策树堆栈演化，以最小定式撬动宏观稳态，习惯进度在崩塌后仍保留。",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-dvh flex flex-col paper-texture">
      <PublicMasthead />

      <main className="flex-1 px-6 md:px-10 py-16 md:py-20 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-6xl text-ink leading-[0.95] tracking-tight max-w-[16ch]">
          以协议约束行为，而非以意志对抗自己
        </h1>
        <p className="mt-8 text-editorial-body text-ink-muted max-w-prose">
          基于链式时延与递归稳态两套工程化自控技术。不是打卡清单，而是可裁决、可演化、可复盘的约束系统。
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/register" size="lg">
            开始记录
          </Button>
          <Button href="/guide" variant="editorial" size="lg">
            交互式概览
          </Button>
          <Button href="/login" variant="masthead" size="lg">
            登录
          </Button>
        </div>

        <Hairline className="my-16" />

        <div className="grid md:grid-cols-3 gap-5">
          {concepts.map((c) => (
            <Card key={c.title} variant="stat">
              <CardHeader>
                <p className="text-kicker text-accent">{c.subtitle}</p>
                <CardTitle className="text-xl">{c.title}</CardTitle>
              </CardHeader>
              <CardBody className="pt-0">
                <p className="text-sm text-ink-muted leading-relaxed">{c.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <p className="mt-12 text-caption">
          <Link href="/login">已有账号</Link>
        </p>
      </main>
    </div>
  );
}
