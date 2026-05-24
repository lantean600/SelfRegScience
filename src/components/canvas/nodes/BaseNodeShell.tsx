"use client";

import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function BaseNodeShell({
  children,
  className,
  highlighted,
  source = true,
  target = true,
}: {
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
  source?: boolean;
  target?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-sm border-2 border-rule-strong bg-panel px-3 py-2 min-w-[140px] max-w-[220px] transition-shadow font-sans text-sm",
        highlighted && "ring-2 ring-editorial/40 shadow-md border-editorial/50",
        className,
      )}
    >
      {target && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-accent !w-2 !h-2 !border-0"
        />
      )}
      {children}
      {source && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-accent !w-2 !h-2 !border-0"
        />
      )}
    </div>
  );
}
