import type { ExecutionStatus, TriggerType, WorkflowStatus } from "@/lib/dashboard/types";

const executionStatus: Record<
  ExecutionStatus,
  { dot: string; text: string; label: string }
> = {
  success: { dot: "bg-ok", text: "text-ok", label: "Succeeded" },
  failed: { dot: "bg-bad", text: "text-bad", label: "Failed" },
  running: { dot: "bg-volt blink", text: "text-volt", label: "Running" },
  queued: { dot: "bg-state-queued", text: "text-muted", label: "Queued" },
  cancelled: { dot: "bg-state-cancelled", text: "text-muted", label: "Cancelled" },
};

export function StatusBadge({ status }: { status: ExecutionStatus }) {
  const style = executionStatus[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium ${style.text}`}>
      <span className={`h-[7px] w-[7px] rounded-full ${style.dot}`} aria-hidden />
      {style.label}
    </span>
  );
}

const workflowStatus: Record<WorkflowStatus, { dot: string; text: string; label: string }> = {
  active: { dot: "bg-ok", text: "text-ok", label: "Active" },
  paused: { dot: "bg-state-paused", text: "text-muted", label: "Paused" },
};

export function WorkflowStatusBadge({ status }: { status: WorkflowStatus }) {
  const style = workflowStatus[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12.5px] ${style.text}`}>
      <span className={`h-[7px] w-[7px] rounded-full ${style.dot}`} aria-hidden />
      {style.label}
    </span>
  );
}

const triggerLabels: Record<TriggerType, string> = {
  webhook: "webhook",
  schedule: "schedule",
  api: "api",
  manual: "manual",
};

export function TriggerBadge({ trigger }: { trigger: TriggerType }) {
  return (
    <span className="inline-flex items-center rounded border border-line bg-ink px-1.5 py-0.5 font-mono text-[10.5px] text-muted">
      {triggerLabels[trigger]}
    </span>
  );
}
