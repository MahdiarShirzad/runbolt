"use client";

import { useState } from "react";
import { getNodeDefinition } from "@/lib/dashboard/workflow-graph";
import type { NodeExecution } from "@/lib/dashboard/execution-debug";
import { formatAbsoluteTime, formatClockTime, formatDuration } from "@/lib/dashboard/format";
import { EmptyState } from "../EmptyState";
import { JsonBlock } from "../JsonBlock";
import type { ExecutionLogRow } from "../executions-view";
import { ErrorPanel } from "./ErrorPanel";
import { NodeStatusBadge } from "./NodeStatusBadge";

type TabId = "overview" | "input" | "output" | "logs" | "error";

const LOG_LEVEL_CLS: Record<string, string> = {
  info: "text-muted",
  warn: "text-warn",
  error: "text-bad",
};

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
        {label}
      </dt>
      <dd className="min-w-0 truncate text-right text-[12.5px] text-fg">{children}</dd>
    </div>
  );
}

function skipReason(status: NodeExecution["status"]): string | null {
  if (status === "skipped") {
    return "This node was not executed. It was skipped because an earlier node on its path failed, or a condition that routes to it was not satisfied.";
  }
  if (status === "pending") {
    return "This node was never reached — it sits after a node that failed or in a branch the run did not take.";
  }
  return null;
}

function emptyOutputReason(status: NodeExecution["status"]): string {
  switch (status) {
    case "failed":
      return "This node failed before it produced an output.";
    case "skipped":
      return "Skipped nodes do not produce an output.";
    case "pending":
      return "This node has not executed yet, so it has no output.";
    case "running":
      return "This node is still running — no output captured yet.";
    default:
      return "No output was captured for this node.";
  }
}

export function NodeInspector({
  node,
  logs,
}: {
  node: NodeExecution | null;
  logs: ExecutionLogRow[];
}) {
  const [tab, setTab] = useState<TabId>("overview");

  if (!node) {
    return (
      <EmptyState
        title="Select a node"
        description="Pick a node in the graph or timeline to inspect its status, timing, payloads, and logs."
      />
    );
  }

  const typeLabel = getNodeDefinition(node.type)?.label ?? node.type;
  const reason = skipReason(node.status);

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "input", label: "Input" },
    { id: "output", label: "Output" },
    { id: "logs", label: `Logs (${logs.length})` },
    { id: "error", label: "Error" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <NodeStatusBadge status={node.status} />
          {node.attempt > 1 && (
            <span className="rounded border border-warn/40 bg-warn/10 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-warn">
              attempt {node.attempt}
            </span>
          )}
        </div>
        <p className="mt-2 truncate font-mono text-[13.5px] text-fg" title={node.name}>
          {node.name}
        </p>
        <p className="mt-0.5 font-mono text-[10.5px] text-faint">
          {typeLabel} · {node.nodeId}
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Node details"
        className="scroll-slim flex shrink-0 overflow-x-auto border-b border-line/70"
      >
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-[12px] transition-colors ${
                active
                  ? "border-primary font-medium text-fg"
                  : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto p-4">
        {tab === "overview" && (
          <div className="space-y-4">
            <dl className="divide-y divide-line/50 rounded-md border border-line bg-ink px-3.5">
              <MetaRow label="Status">
                <NodeStatusBadge status={node.status} />
              </MetaRow>
              <MetaRow label="Attempt">
                <span className="font-mono tabular-nums">{node.attempt}</span>
              </MetaRow>
              <MetaRow label="Started">
                {node.startedAt ? (
                  <time
                    dateTime={node.startedAt}
                    title={formatAbsoluteTime(node.startedAt)}
                    className="font-mono tabular-nums"
                  >
                    {formatClockTime(node.startedAt)}
                  </time>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </MetaRow>
              <MetaRow label="Finished">
                {node.finishedAt ? (
                  <time
                    dateTime={node.finishedAt}
                    title={formatAbsoluteTime(node.finishedAt)}
                    className="font-mono tabular-nums"
                  >
                    {formatClockTime(node.finishedAt)}
                  </time>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </MetaRow>
              <MetaRow label="Duration">
                <span className="font-mono tabular-nums">{formatDuration(node.durationMs)}</span>
              </MetaRow>
            </dl>

            {reason && (
              <p className="rounded-md border border-line bg-surface/60 px-3.5 py-3 text-[12px] leading-relaxed text-muted">
                {reason}
              </p>
            )}

            {node.attempts.length > 1 && (
              <div>
                <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                  Attempt history
                </p>
                <ol className="space-y-1.5">
                  {node.attempts.map((attempt) => (
                    <li
                      key={attempt.attempt}
                      className="flex items-center gap-2.5 rounded-md border border-line bg-ink px-3 py-2"
                    >
                      <span className="font-mono text-[11px] text-faint">
                        #{attempt.attempt}
                      </span>
                      <NodeStatusBadge status={attempt.status} />
                      <span className="ml-auto font-mono text-[11px] tabular-nums text-muted">
                        {formatDuration(attempt.durationMs)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {tab === "input" && (
          <JsonBlock
            value={node.input}
            label="input.json"
            emptyHint="No input was captured for this node."
          />
        )}

        {tab === "output" &&
          (node.output == null ? (
            <EmptyState title="No output" description={emptyOutputReason(node.status)} />
          ) : (
            <JsonBlock value={node.output} label="output.json" />
          ))}

        {tab === "logs" &&
          (logs.length === 0 ? (
            <EmptyState
              title="No log lines for this node"
              description="This node did not emit any log records during the run."
            />
          ) : (
            <ol className="divide-y divide-line/40 overflow-hidden rounded-md border border-line bg-ink">
              {logs.map((row) => (
                <li key={row.id} className="flex items-start gap-3 px-3 py-2">
                  <time
                    dateTime={row.at}
                    title={row.absoluteLabel}
                    className="shrink-0 pt-0.5 font-mono text-[10.5px] tabular-nums text-faint"
                  >
                    {row.clockLabel}
                  </time>
                  <span
                    className={`shrink-0 pt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] ${LOG_LEVEL_CLS[row.level] ?? "text-muted"}`}
                  >
                    {row.level}
                  </span>
                  <span className="min-w-0 flex-1 break-words text-[12px] leading-relaxed text-muted">
                    {row.message}
                  </span>
                </li>
              ))}
            </ol>
          ))}

        {tab === "error" && (
          <ErrorPanel failedNode={node.status === "failed" ? node : null} />
        )}
      </div>
    </div>
  );
}
