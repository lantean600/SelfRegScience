"use client";

import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  useOnViewportChange,
  type Node,
  type Edge,
  type OnConnect,
  type NodeMouseHandler,
} from "@xyflow/react";
import type { MouseEvent as ReactMouseEvent } from "react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { canvasNodeTypes } from "@/components/canvas/nodeTypes";
import { canvasEdgeTypes } from "@/components/canvas/edgeTypes";
import type { CtdpForceLayoutMeta } from "@/components/canvas/CtdpForceController";
import {
  CtdpForceController,
  emitForceDrag,
} from "@/components/canvas/CtdpForceController";
import { CtdpZoomProvider, useCtdpZoom } from "@/components/ctdp/CtdpZoomContext";
import type { CanvasNode } from "@/components/canvas/types";

type CtdpFlowCanvasProps = {
  initialNodes: CanvasNode[];
  initialEdges: Edge[];
  layoutKey: string;
  layoutMeta: CtdpForceLayoutMeta;
  onLayoutCommit?: (nodeId: string, x: number, y: number) => void;
  onConnect?: OnConnect;
  onNodeContextMenu?: NodeMouseHandler;
  onPaneContextMenu?: (event: ReactMouseEvent | MouseEvent) => void;
  labelZoomThreshold?: number;
  children?: React.ReactNode;
};

function ViewportZoomSync() {
  const { setZoom } = useCtdpZoom();
  useOnViewportChange({ onChange: (vp) => setZoom(vp.zoom) });
  return null;
}

function CanvasInner({
  initialNodes,
  initialEdges,
  layoutKey,
  layoutMeta,
  onLayoutCommit,
  onConnect,
  onNodeContextMenu,
  onPaneContextMenu,
  children,
}: CtdpFlowCanvasProps) {
  const { resolvedTheme } = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 关键修复：刷新时只更新节点元数据，保留力导向计算出的位置
  useEffect(() => {
    setNodes((prev) => {
      if (prev.length === 0) return initialNodes;
      const posMap = new Map(prev.map((n) => [n.id, n.position]));
      return initialNodes.map((n) => ({
        ...n,
        // 保留当前位置，避免 router.refresh() 后跳位
        position: posMap.get(n.id) ?? n.position,
      }));
    });
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeDragStart = useCallback((_: React.MouseEvent, node: Node) => {
    emitForceDrag("start", node);
  }, []);

  const onNodeDrag = useCallback((_: React.MouseEvent, node: Node) => {
    emitForceDrag("move", node);
  }, []);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      emitForceDrag("stop", node);
      onLayoutCommit?.(node.id, node.position.x, node.position.y);
    },
    [onLayoutCommit],
  );

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div className="ctdp-flow-wrap relative w-full h-[min(700px,82vh)] overflow-hidden">
      {children}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={canvasNodeTypes}
        edgeTypes={canvasEdgeTypes}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.1 }}
        minZoom={0.2}
        maxZoom={3}
        proOptions={proOptions}
        colorMode={resolvedTheme === "dark" ? "dark" : "light"}
        className="ctdp-constellation"
        defaultEdgeOptions={{ type: "refTarget" }}
        nodesFocusable={false}
      >
        <ViewportZoomSync />
        <CtdpForceController layoutKey={layoutKey} layoutMeta={layoutMeta} />
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.5}
          color="var(--ctdp-dot)"
        />
        <Controls
          className="!bg-panel/80 !border-rule !shadow-sm ctdp-controls"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}

export function CtdpFlowCanvas(props: CtdpFlowCanvasProps) {
  const { labelZoomThreshold = 0.75, ...rest } = props;
  return (
    <ReactFlowProvider>
      <CtdpZoomProvider labelZoomThreshold={labelZoomThreshold}>
        <CanvasInner {...rest} />
      </CtdpZoomProvider>
    </ReactFlowProvider>
  );
}
