"use client";

import { useState } from "react";
import { RsipCanvas } from "@/components/canvas/RsipCanvas";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import {
  RsipDataProvider,
  useRsipData,
  type RsipGroup,
  type RsipHabit,
  type RsipPolicy,
  type RsipTreeNode,
} from "@/components/rsip/RsipDataContext";

type Template = { id: string; slug: string; title: string; description: string | null };

function RsipClientInner({ templates }: { templates: Template[] }) {
  const { policies, groups, habits, mutate, addPolicy, addGroup, refetchRsip } = useRsipData();
  const [steadyState, setSteadyState] = useState("沙发放纵");
  const [backtrack, setBacktrack] = useState("躺沙发|带手机上沙发|拿起手机");
  const [groupName, setGroupName] = useState("");
  const [groupPolicies, setGroupPolicies] = useState<string[]>([]);

  async function cloneTemplate(templateId: string) {
    const data = await mutate<RsipPolicy>({
      url: "/api/policies/templates",
      init: { method: "POST", body: { templateId } },
      revalidate: refetchRsip,
    });
    addPolicy(data);
  }

  async function wizard() {
    const steps = backtrack.split("|").map((d, i) => ({
      description: d.trim(),
      tendencyGap: 0.9 - i * 0.15,
    }));
    await mutate({
      url: "/api/policies/wizard",
      init: {
        method: "POST",
        body: {
          steadyStateTarget: steadyState,
          backtrackSteps: steps,
          interventionIndex: steps.length - 1,
          save: true,
        },
      },
      revalidate: refetchRsip,
    });
  }

  async function createGroup() {
    if (!groupName || groupPolicies.length < 2) return;
    const data = await mutate<RsipGroup>({
      url: "/api/policy-groups",
      init: {
        method: "POST",
        body: {
          name: groupName,
          faultQuota: 1,
          policyIds: groupPolicies,
        },
      },
      revalidate: refetchRsip,
    });
    addGroup(data);
    setGroupName("");
    setGroupPolicies([]);
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-serif text-xl mb-4">国策树 · 画布</h2>
        <RsipCanvas />
      </section>

      <section>
        <h2 className="font-serif text-xl mb-4">国策模板库</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((t) => (
            <Card key={t.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t.title}</CardTitle>
              </CardHeader>
              <CardBody className="mt-auto pt-0">
                {t.description && (
                  <p className="text-xs text-ink-muted mb-3 line-clamp-2">{t.description}</p>
                )}
                <Button size="sm" variant="secondary" onClick={() => cloneTemplate(t.id)}>
                  克隆
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl mb-4">设计向导</h2>
        <Card>
          <CardBody className="space-y-4">
            <Field label="负面稳态">
              <Input value={steadyState} onChange={(e) => setSteadyState(e.target.value)} />
            </Field>
            <Field label="回溯链（| 分隔）" hint="从后果到最早干预节点">
              <Input value={backtrack} onChange={(e) => setBacktrack(e.target.value)} />
            </Field>
            <Button onClick={wizard}>生成并保存国策</Button>
          </CardBody>
        </Card>
      </section>

      <section>
        <h2 className="font-serif text-xl mb-4">习惯内化</h2>
        <ul className="space-y-4">
          {habits.length === 0 ? (
            <p className="text-sm text-ink-muted">暂无习惯进度（树重置不丢失）</p>
          ) : (
            habits.map((h) => (
              <li key={h.policy.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{h.policy.title}</span>
                  <span className="font-data text-ink-muted">
                    {h.internalizationDays}d 连续 · {h.lifetimeDays}d 累计
                  </span>
                </div>
                <Progress value={h.internalizationDays} max={30} variant="success" />
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl mb-4">国策组</h2>
        <Card className="mb-4">
          <CardBody>
            <Field label="组名">
              <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            </Field>
            <p className="text-xs text-ink-muted mb-2">选择至少 2 项国策（容错 quota=1）</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {policies.map((p) => (
                <label key={p.id} className="flex items-center gap-1 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groupPolicies.includes(p.id)}
                    onChange={(e) => {
                      setGroupPolicies((prev) =>
                        e.target.checked
                          ? [...prev, p.id]
                          : prev.filter((id) => id !== p.id),
                      );
                    }}
                    className="rounded-sm"
                  />
                  {p.title}
                </label>
              ))}
            </div>
            <Button variant="secondary" onClick={createGroup}>
              创建国策组
            </Button>
          </CardBody>
        </Card>
        {groups.map((g) => (
          <Card key={g.id} className="mb-3">
            <CardBody>
              <p className="font-medium text-sm">
                {g.name}{" "}
                <Badge variant="outline">容错 {g.faultQuota}</Badge>
              </p>
              <p className="text-xs text-ink-muted mt-2">
                {g.members.map((m) => m.policy.title).join(" · ")}
              </p>
            </CardBody>
          </Card>
        ))}
      </section>
    </div>
  );
}

export function RsipClient({
  policies,
  templates,
  tree,
  groups,
  habits,
}: {
  policies: RsipPolicy[];
  templates: Template[];
  tree: { nodes: RsipTreeNode[] } | null;
  groups: RsipGroup[];
  habits: RsipHabit[];
}) {
  const treeNodes = tree?.nodes ?? [];

  return (
    <RsipDataProvider
      initialPolicies={policies}
      initialTreeNodes={treeNodes}
      initialGroups={groups}
      initialHabits={habits}
    >
      <RsipClientInner templates={templates} />
    </RsipDataProvider>
  );
}
