"use client";

import { CtdpCanvas } from "@/components/canvas/CtdpCanvas";
import { CtdpSettingsProvider } from "@/components/ctdp/CtdpSettingsContext";
import { CtdpNodesProvider, useCtdpNodes } from "@/components/ctdp/CtdpNodesContext";
import type { CtdpNodeRow } from "@/components/canvas/CtdpCanvas";

function CtdpStatusBar() {
  const { nodes, completeness, seats } = useCtdpNodes();
  const pct = Math.round(completeness * 100);
  const executing = nodes.filter((n) => n.state === "executing").length;
  const awaiting = nodes.filter((n) => n.awaitingJudgment).length;

  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-1 text-caption border-b border-rule pb-3 mb-1">
      <span>
        完整度 <strong className="text-ink font-medium font-data">{pct}%</strong>
      </span>
      <span className="opacity-40">·</span>
      <span>{nodes.length} 个节点</span>
      {executing > 0 && (
        <>
          <span className="opacity-40">·</span>
          <span className="text-accent">{executing} 执行中</span>
        </>
      )}
      {awaiting > 0 && (
        <>
          <span className="opacity-40">·</span>
          <span className="text-editorial">{awaiting} 待判定</span>
        </>
      )}
      {seats.length === 0 && (
        <>
          <span className="opacity-40">·</span>
          <span className="text-signal">需创建神圣座位</span>
        </>
      )}
    </div>
  );
}

export function CtdpClient({
  nodes,
  completeness,
  seats,
  defaultAppointmentMin,
  defaultFocusMinutes,
}: {
  nodes: CtdpNodeRow[];
  completeness: number;
  seats: { id: string; name: string }[];
  defaultAppointmentMin: number;
  defaultFocusMinutes: number;
}) {
  return (
    <CtdpSettingsProvider
      serverDefaults={{ appointmentMinutes: defaultAppointmentMin, defaultFocusMinutes }}
    >
      <CtdpNodesProvider
        initialNodes={nodes}
        initialCompleteness={completeness}
        initialSeats={seats}
      >
        <CtdpStatusBar />
        <CtdpCanvas />
      </CtdpNodesProvider>
    </CtdpSettingsProvider>
  );
}
