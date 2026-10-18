"use client";

import { useRef } from "react";
import { formatClockTime, formatDuration } from "@/lib/dashboard/format";
import type { NodeExecution } from "@/lib/dashboard/execution-debug";
import { EmptyState } from "../EmptyState";
import { NodeStatusBadge } from "./NodeStatusBadge";

const DOT_CLS: Record<NodeExecution["status"], string> = {
  success: "bg-ok",
  failed: "bg-bad",
  running: "bg-volt blink",
  skipped: "bg-state-skipped",
  pending: "bg-state-idle",
};

/**
 * Chronological node execution list. Selecting an entry focuses the matching
 * node in the graph and opens its inspector.
 */
export function ExecutionTimeline({
  nodes,
  selectedNodeId,
  onSelect,
}: {
  nodes: NodeExecution[];
  selectedNodeId: string | null;
  onSelect: (nodeId: string) => void;
}) {
  const listRef = useRef<HTMLOListElement>(null);

  const onKeyDown = (event: React.KeyboardEvent<HTMLOListElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>("[data-node-button]") ?? [],
    );
    if (buttons.length === 0) return;
    event.preventDefault();
    const current = buttons.indexOf(document.activeElement as HTMLElement);
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const next = current < 0 ? 0 : (current + delta + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };

  if (nodes.length === 0) {
    return (
      <EmptyState
        title="No nodes recorded"
        description="This execution has no node-level detail to show."
      />
    );
  }

  return (
    <ol ref={listRef} onKeyDown={onKeyDown} className="space-y-2">
      {nodes.map((node, index) => {
        const selected = node.nodeId === selectedNodeId;
        return (
          <li key={node.nodeId}>
            <button
              type="button"
              data-node-button
              onClick={() => onSelect(node.nodeId)}
              aria-pressed={selected}
              className={`flex w-full items-start gap-3 rounded-md border px-3.5 py-2.5 text-left transition-colors ${
                selected
                  ? "border-primary bg-primary/[0.05]"
                  : "border-line bg-ink hover:border-line-strong"
              } ${node.status === "failed" && !selected ? "border-bad/50" : ""}`}
            >
              <span
                aria-hidden
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT_CLS[node.status]}`}
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="truncate font-mono text-[12.5px] text-fg">
                    {index + 1}. {node.name}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted">
                    {formatDuration(node.durationMs)}
                  </span>
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-2">
                  <NodeStatusBadge status={node.status} />
                  {node.startedAt && (
                    <span className="font-mono text-[11px] text-faint">
                      started {formatClockTime(node.startedAt)}
                    </span>
                  )}
                  {node.attempt > 1 && (
                    <span className="font-mono text-[11px] text-warn">
                      attempt {node.attempt}
                    </span>
                  )}
                </span>
                {node.error && (
                  <span className="mt-1.5 block break-words text-[11.5px] leading-relaxed text-bad/90">
                    {node.error.message}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
