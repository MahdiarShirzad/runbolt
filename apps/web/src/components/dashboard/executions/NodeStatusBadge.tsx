import type { NodeExecutionStatus } from "@/lib/dashboard/execution-debug";

const STATUS_MAP: Record<
  NodeExecutionStatus,
  { label: string; dot: string; text: string }
> = {
  success: { label: "Succeeded", dot: "bg-ok", text: "text-ok" },
  failed: { label: "Failed", dot: "bg-bad", text: "text-bad" },
  running: { label: "Running", dot: "bg-volt blink", text: "text-volt" },
  skipped: { label: "Skipped", dot: "bg-state-skipped", text: "text-faint" },
  pending: { label: "Not executed", dot: "bg-state-idle", text: "text-faint" },
};

export function nodeStatusLabel(status: NodeExecutionStatus): string {
  return STATUS_MAP[status].label;
}

/** Status pill for a single node execution (distinct from the run-level badge). */
export function NodeStatusBadge({
  status,
  className = "",
}: {
  status: NodeExecutionStatus;
  className?: string;
}) {
  const style = STATUS_MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium ${style.text} ${className}`}
    >
      <span className={`h-[7px] w-[7px] rounded-full ${style.dot}`} aria-hidden />
      {style.label}
    </span>
  );
}
