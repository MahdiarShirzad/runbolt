"use client";

import { formatDuration, formatRelativeTime } from "@/lib/dashboard/format";
import { StatusBadge } from "../StatusBadge";
import { EmptyState } from "../EmptyState";
import type { ExecutionStatus } from "@/lib/dashboard/types";
import type { GraphRunStatus } from "@/lib/dashboard/workflow-run";

export interface InspectorRun {
  id: string;
  status: ExecutionStatus;
  startedAt: string;
  durationMs: number | null;
  isSimulated: boolean;
}

export interface InspectorStep {
  nodeId: string;
  name: string;
  status: GraphRunStatus;
  durationMs: number | null;
  detail?: string;
}

const dotCls: Record<GraphRunStatus, string> = {
  success: "bg-ok",
  failed: "bg-bad",
  running: "bg-volt blink",
  queued: "bg-state-queued",
  cancelled: "bg-state-cancelled",
  skipped: "bg-state-skipped",
  pending: "bg-state-idle",
};

const stepLabel: Record<GraphRunStatus, string> = {
  success: "Succeeded",
  failed: "Failed",
  running: "Running",
  queued: "Queued",
  cancelled: "Cancelled",
  skipped: "Skipped",
  pending: "Not executed",
};

export function ExecutionInspector({
  runs,
  selectedRunId,
  selectedSteps,
  onSelectRun,
  onClearRun,
  onFocusNode,
  busy,
}: {
  runs: InspectorRun[];
  selectedRunId: string | null;
  selectedSteps: InspectorStep[] | null;
  onSelectRun: (runId: string) => void;
  onClearRun: () => void;
  onFocusNode: (nodeId: string) => void;
  busy: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line/70 px-3.5 py-3">
        <div>
          <p className="text-[13px] font-medium text-fg">Executions</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
            {runs.length} run{runs.length === 1 ? "" : "s"}
          </p>
        </div>
        {selectedRunId && (
          <button
            type="button"
            onClick={onClearRun}
            className="rounded-md border border-line px-2 py-1 text-[11.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
          >
            Clear overlay
          </button>
        )}
      </div>

      {busy ? (
        <div className="px-3.5 py-4" aria-busy="true">
          <div className="h-3 w-40 animate-pulse rounded bg-hover" />
          <div className="mt-2 h-3 w-28 animate-pulse rounded bg-hover" />
        </div>
      ) : runs.length === 0 ? (
        <div className="px-3.5 py-4">
          <EmptyState
            title="No runs yet"
            description="Run the workflow to preview node statuses here. Recorded executions appear once the workflow has run."
          />
        </div>
      ) : (
        <div className="scroll-slim min-h-0 flex-1 overflow-y-auto">
          <ul className="divide-y divide-line/40">
            {runs.map((run) => {
              const selected = run.id === selectedRunId;
              return (
                <li key={run.id}>
                  <button
                    type="button"
                    onClick={() => onSelectRun(run.id)}
                    aria-pressed={selected}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors ${
                      selected ? "bg-primary/[0.06]" : "hover:bg-hover/50"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[11.5px] text-fg">{run.id}</span>
                        {run.isSimulated && (
                          <span className="rounded border border-volt/40 bg-volt/10 px-1 font-mono text-[9px] uppercase text-volt">
                            test
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block font-mono text-[10.5px] text-faint">
                        {formatRelativeTime(run.startedAt)} · {formatDuration(run.durationMs)}
                      </span>
                    </span>
                    <StatusBadge status={run.status} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {selectedSteps && (
        <div className="scroll-slim max-h-[45%] shrink-0 overflow-y-auto border-t border-line/70 bg-ink/40">
          <p className="sticky top-0 z-10 border-b border-line/50 bg-surface/95 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-faint backdrop-blur">
            Node results
          </p>
          <ol className="divide-y divide-line/30">
            {selectedSteps.map((step) => (
              <li key={step.nodeId}>
                <button
                  type="button"
                  onClick={() => onFocusNode(step.nodeId)}
                  className="flex w-full items-start gap-2.5 px-3.5 py-2 text-left transition-colors hover:bg-hover/40"
                >
                  <span
                    aria-hidden
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotCls[step.status]}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-[11.5px] text-fg">{step.name}</span>
                      <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-muted">
                        {step.durationMs == null ? "—" : formatDuration(step.durationMs)}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[10.5px] text-faint">
                      {stepLabel[step.status]}
                    </span>
                    {step.detail && (
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-bad/90">
                        {step.detail}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className="border-t border-line/40 px-3.5 py-2 text-[10.5px] leading-relaxed text-faint">
            Node inputs and outputs are captured by the Runbolt API when it is connected.
          </p>
        </div>
      )}
    </div>
  );
}
