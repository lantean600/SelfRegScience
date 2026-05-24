import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RsipClient } from "@/components/RsipClient";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function RsipPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [policies, templates, tree, groups, habits] = await Promise.all([
    prisma.policy.findMany({ where: { userId: user.id } }),
    prisma.policyTemplate.findMany({ orderBy: { slug: "asc" } }),
    prisma.policyTree.findFirst({
      where: { userId: user.id, isActive: true },
      include: {
        nodes: {
          include: { policy: true },
          orderBy: { position: "asc" },
        },
      },
    }),
    prisma.policyGroup.findMany({
      where: { userId: user.id },
      include: { members: { include: { policy: true } } },
    }),
    prisma.habitProgress.findMany({
      where: { userId: user.id },
      include: { policy: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        kicker="Recursive Stabilization Iteration"
        title="RSIP"
        description="国策树、水密隔舱与定式演化"
      />
      <RsipClient
        policies={JSON.parse(JSON.stringify(policies))}
        templates={JSON.parse(JSON.stringify(templates))}
        tree={tree ? JSON.parse(JSON.stringify(tree)) : null}
        groups={JSON.parse(JSON.stringify(groups))}
        habits={JSON.parse(JSON.stringify(habits))}
      />
    </>
  );
}
