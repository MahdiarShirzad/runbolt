import { formatDuration } from "@/lib/dashboard/format";
import type { ExecutionStatus } from "@/lib/dashboard/types";
import type { ExecutionDebugCounts, NodeExecution } from "@/lib/dashboard/execution-debug";
import { StatusBadge } from "../StatusBadge";

function Stat({
  label,
  value,
  context,
  valueCls = "text-fg",
}: {
  label: string;
  value: React.ReactNode;
  context?: string;
  valueCls?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface/60 px-4 py-3.5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      <p className={`mt-2 font-display text-[26px] font-semibold leading-none tabular-nums ${valueCls}`}>
        {value}
      </p>
      {context && <p className="mt-2 text-[11.5px] leading-snug text-muted">{context}</p>}
    </div>
  );
}

/** Concise, execution-specific overview. All values derive from the node run data. */
export function ExecutionSummary({
  status,
  counts,
  durationMs,
  failedNode,
  errorSummary,
}: {
  status: ExecutionStatus;
  counts: ExecutionDebugCounts;
  durationMs: number | null;
  failedNode: NodeExecution | null;
  errorSummary: string | null;
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Stat
          label="Result"
          value={<StatusBadge status={status} />}
          context={
            status === "failed"
              ? "stopped on an error"
              : status === "running"
                ? "in progress"
                : status === "cancelled"
                  ? "cancelled before finishing"
                  : status === "queued"
                    ? "waiting to start"
                    : "finished cleanly"
          }
          valueCls=""
        />
        <Stat label="Total nodes" value={String(counts.total)} context="in this workflow" />
        <Stat
          label="Succeeded"
          value={String(counts.success)}
          context="completed"
          valueCls="text-ok"
        />
        <Stat
          label="Failed"
          value={String(counts.failed)}
          context="stopped the run"
          valueCls="text-bad"
        />
        <Stat
          label="Skipped"
          value={String(counts.skipped + counts.pending)}
          context="not executed"
          valueCls="text-faint"
        />
        <Stat
          label="Duration"
          value={durationMs == null ? "—" : formatDuration(durationMs)}
          context={status === "running" ? "still running" : "wall-clock total"}
        />
      </div>

      {failedNode && errorSummary ? (
        <div className="rounded-lg border border-bad/30 bg-bad/[0.06] px-4 py-3">
          <p className="text-[12.5px] leading-relaxed text-bad/90">
            <span className="font-medium text-fg">{failedNode.name}</span> failed —{" "}
            {errorSummary}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-surface/60 px-4 py-3">
          <p className="text-[12.5px] leading-relaxed text-muted">
            {counts.running > 0
              ? "Execution is still running; node statuses update as it progresses."
              : "No failures recorded for this execution."}
          </p>
        </div>
      )}
    </div>
  );
}
