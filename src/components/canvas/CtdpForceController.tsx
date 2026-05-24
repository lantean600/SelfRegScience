"use client";

import { useEffect, useRef } from "react";
import { useReactFlow, type Node } from "@xyflow/react";
import {
  runForceToConvergence,
  heatSimForDrag,
  coolSimAfterDrag,
  type ForceLayoutOptions,
  type ForceNodeDatum,
} from "@/lib/ctdp-force-layout";

const CANVAS_W = 1000;
const CANVAS_H = 700;

export type CtdpForceLayoutMeta = {
  radii: Map<string, number>;
  links: { source: string; target: string }[];
  forceOptions: ForceLayoutOptions;
};

export function CtdpForceController({
  layoutKey,
  layoutMeta,
}: {
  layoutKey: string;
  layoutMeta: CtdpForceLayoutMeta;
}) {
  const { getNodes, setNodes } = useReactFlow();
  const simRef = useRef<ReturnType<typeof runForceToConvergence>["sim"] | null>(null);
  const metaRef = useRef(layoutMeta);
  metaRef.current = layoutMeta;

  // —— 结构变化时重新布局 ——
  useEffect(() => {
    const rfNodes = getNodes();
    if (rfNodes.length === 0) return;

    simRef.current?.stop();
    simRef.current = null;

    const { radii, links, forceOptions } = metaRef.current;
    const r = radii.values().next().value ?? 22;

    // 已有位置的节点保留位置；新节点随机分布在中心周围
    const existingIds = new Set(
      rfNodes.filter((n) => n.position.x !== 0 || n.position.y !== 0).map((n) => n.id),
    );
    const simNodes: ForceNodeDatum[] = rfNodes.map((n, i) => {
      const radius = radii.get(n.id) ?? r;
      let cx: number, cy: number;
      if (existingIds.has(n.id)) {
        cx = n.position.x + radius;
        cy = n.position.y + radius;
      } else {
        const angle = (i / rfNodes.length) * Math.PI * 2;
        const spread = Math.max(120, rfNodes.length * 20);
        cx = CANVAS_W / 2 + Math.cos(angle) * spread + (Math.random() - 0.5) * 30;
        cy = CANVAS_H / 2 + Math.sin(angle) * spread + (Math.random() - 0.5) * 30;
      }
      return { id: n.id, x: cx, y: cy, vx: 0, vy: 0, radius };
    });

    const { positions, sim } = runForceToConvergence({
      nodes: simNodes,
      links,
      width: CANVAS_W,
      height: CANVAS_H,
      forceOptions,
    });

    setNodes((prev) =>
      prev.map((n) => {
        const p = positions.get(n.id);
        if (!p) return n;
        const radius = metaRef.current.radii.get(n.id) ?? r;
        return { ...n, position: { x: p.x - radius, y: p.y - radius } };
      }),
    );

    simRef.current = sim;
    return () => {
      sim.stop();
      simRef.current = null;
    };
  }, [layoutKey, getNodes, setNodes]);

  // —— 拖拽交互 ——
  useEffect(() => {
    function onDragStart(e: Event) {
      const { id } = (e as CustomEvent<{ id: string }>).detail;
      const sim = simRef.current;
      if (!sim) return;

      // 将 sim 节点位置同步为当前 RF 节点位置
      const rfNodes = getNodes();
      for (const rfNode of rfNodes) {
        const datum = sim.nodes().find((d) => d.id === rfNode.id);
        if (datum) {
          const radius = metaRef.current.radii.get(rfNode.id) ?? 22;
          datum.x = rfNode.position.x + radius;
          datum.y = rfNode.position.y + radius;
          datum.vx = 0;
          datum.vy = 0;
        }
      }

      // 固定被拖拽节点
      const datum = sim.nodes().find((d) => d.id === id);
      if (datum) {
        datum.fx = datum.x;
        datum.fy = datum.y;
      }

      heatSimForDrag(sim, (positions) => {
        setNodes((prev) =>
          prev.map((n) => {
            const p = positions.get(n.id);
            if (!p) return n;
            const radius = metaRef.current.radii.get(n.id) ?? 22;
            return { ...n, position: { x: p.x - radius, y: p.y - radius } };
          }),
        );
      });
    }

    function onDrag(e: Event) {
      const { id, x, y } = (e as CustomEvent<{ id: string; x: number; y: number }>).detail;
      const sim = simRef.current;
      if (!sim) return;
      const datum = sim.nodes().find((d) => d.id === id);
      if (datum) {
        const radius = metaRef.current.radii.get(id) ?? 22;
        datum.fx = x + radius;
        datum.fy = y + radius;
      }
    }

    function onDragStop(e: Event) {
      const { id } = (e as CustomEvent<{ id: string }>).detail;
      const sim = simRef.current;
      if (!sim) return;
      const datum = sim.nodes().find((d) => d.id === id);
      if (datum) {
        datum.fx = null;
        datum.fy = null;
      }
      coolSimAfterDrag(sim);
    }

    window.addEventListener("ctdp-force-drag-start", onDragStart);
    window.addEventListener("ctdp-force-drag", onDrag);
    window.addEventListener("ctdp-force-drag-stop", onDragStop);
    return () => {
      window.removeEventListener("ctdp-force-drag-start", onDragStart);
      window.removeEventListener("ctdp-force-drag", onDrag);
      window.removeEventListener("ctdp-force-drag-stop", onDragStop);
    };
  }, [getNodes, setNodes]);

  return null;
}

export function emitForceDrag(phase: "start" | "move" | "stop", node: Node) {
  const type =
    phase === "start"
      ? "ctdp-force-drag-start"
      : phase === "move"
        ? "ctdp-force-drag"
        : "ctdp-force-drag-stop";
  const detail =
    phase === "move"
      ? { id: node.id, x: node.position.x, y: node.position.y }
      : { id: node.id };
  window.dispatchEvent(new CustomEvent(type, { detail }));
}
