"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Hairline } from "@/components/ui/Hairline";
import type { InspectorTarget } from "@/components/canvas/types";
import { useServerMutation } from "@/hooks/use-server-mutation";

type InspectorProps = {
  target: InspectorTarget;
  onClose: () => void;
  extraActions?: React.ReactNode;
  revalidate?: () => void | Promise<void>;
};

export function NodeInspector({ target, onClose, extraActions, revalidate }: InspectorProps) {
  const { mutate } = useServerMutation();
  const [title, setTitle] = useState("");
  const [trigger, setTrigger] = useState("");
  const [minFocus, setMinFocus] = useState(60);
  const [policyType, setPolicyType] = useState("passive");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!target) return;
    setError("");
    if (target.kind === "sacredSeat") {
      setTitle(target.data.label);
      setTrigger((target.data.meta?.triggerPayload as string) ?? "");
      setMinFocus((target.data.meta?.minFocusMinutes as number) ?? 60);
    }
    if (target.kind === "policy" || target.kind === "policyOrphan") {
      setTitle(target.data.label);
      setPolicyType((target.data.meta?.type as string) ?? "passive");
    }
    if (target.kind === "ctdpNode") {
      setTitle(target.data.label);
    }
  }, [target]);

  if (!target) return null;

  async function save() {
    if (!target) return;
    setSaving(true);
    setError("");
    try {
      if (target.kind === "sacredSeat") {
        await mutate({
          url: `/api/sacred-seats/${target.entityId}`,
          init: {
            method: "PATCH",
            body: {
              name: title,
              triggerPayload: trigger,
              minFocusMinutes: minFocus,
            },
          },
          revalidate,
        });
      } else if (target.kind === "policy" || target.kind === "policyOrphan") {
        const policyId =
          target.kind === "policyOrphan"
            ? target.entityId
            : (target.data.meta?.policyId as string) ?? target.entityId;
        await mutate({
          url: `/api/policies/${policyId}`,
          init: { method: "PATCH", body: { title, type: policyType } },
          revalidate,
        });
      } else if (target.kind === "ctdpNode") {
        await mutate({
          url: `/api/ctdp/nodes/${target.entityId}`,
          init: { method: "PATCH", body: { title } },
          revalidate,
        });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!target) return;
    if (!confirm("确定删除？")) return;
    try {
      if (target.kind === "policyOrphan") {
        await mutate({
          url: `/api/policies/${target.entityId}`,
          init: { method: "DELETE" },
          revalidate,
        });
      } else if (target.kind === "policy") {
        const nodeId = target.data.meta?.nodeId as string;
        if (nodeId) {
          await mutate({
            url: `/api/policy-tree/nodes/${nodeId}`,
            init: { method: "DELETE" },
            revalidate,
          });
        }
      } else if (target.kind === "ctdpNode") {
        await mutate({
          url: `/api/ctdp/nodes/${target.entityId}`,
          init: { method: "DELETE" },
          revalidate,
        });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  }

  const kindLabel: Record<string, string> = {
    ctdpNode: "任务节点",
    sacredSeat: "神圣座位",
    mainChain: "主链",
    appointment: "预约",
    focusSession: "专注会话",
    policy: "国策节点",
    policyRoot: "国策根",
    policyOrphan: "未挂载国策",
    echelon: "任务群",
    group: "任务组",
    unit: "任务单元",
  };

  return (
    <aside
      className="w-full md:w-72 shrink-0 border border-rule rounded-sm bg-panel p-4 space-y-4 max-h-[480px] overflow-y-auto"
      aria-label="节点检查器"
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="text-kicker">Inspector</p>
          <h3 className="font-serif text-lg">{kindLabel[target.kind]}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-ink-muted hover:text-ink text-sm"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>
      <Hairline />

      {(target.kind === "sacredSeat" ||
        target.kind === "policy" ||
        target.kind === "policyOrphan" ||
        target.kind === "ctdpNode") && (
        <>
          <Field label="名称 / 标题">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          {target.kind === "sacredSeat" && (
            <>
              <Field label="触发描述">
                <Input value={trigger} onChange={(e) => setTrigger(e.target.value)} />
              </Field>
              <Field label="最短专注（分钟）">
                <Input
                  type="number"
                  value={minFocus}
                  onChange={(e) => setMinFocus(Number(e.target.value))}
                />
              </Field>
            </>
          )}
          {(target.kind === "policy" || target.kind === "policyOrphan") && (
            <Field label="类型">
              <Select
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
              >
                <option value="passive">被动</option>
                <option value="semi_passive">半被动</option>
                <option value="active">主动</option>
              </Select>
            </Field>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={save} disabled={saving}>
              保存
            </Button>
            {(target.kind === "policy" ||
              target.kind === "policyOrphan" ||
              target.kind === "ctdpNode") && (
              <Button size="sm" variant="danger" onClick={remove}>
                删除
              </Button>
            )}
          </div>
        </>
      )}

      {target.kind === "policyRoot" && (
        <div className="text-sm text-ink-muted space-y-2">
          <p>
            <strong className="text-ink">{target.data.label}</strong>
          </p>
          {target.data.sublabel && <p>{target.data.sublabel}</p>}
          <p className="text-xs">双击其他可编辑节点以修改属性。</p>
        </div>
      )}

      {extraActions}
      {error && <p className="text-xs text-signal">{error}</p>}
    </aside>
  );
}
