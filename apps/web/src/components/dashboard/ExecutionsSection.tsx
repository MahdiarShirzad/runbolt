import {
  currentTimestamp,
  formatAbsoluteTime,
  formatDuration,
  formatRelativeTime,
} from "@/lib/dashboard/format";
import { getRecentExecutions } from "@/lib/dashboard/data";
import { ExecutionsTable } from "./ExecutionsTable";
import type { ExecutionRow, ExecutionStepRow } from "./executions-view";

/** Server boundary: fetches runs, formats labels, hands view-models to the table. */
export async function ExecutionsSection({ limit = 10 }: { limit?: number }) {
  const executions = await getRecentExecutions(limit);
  const now = currentTimestamp();

  const rows: ExecutionRow[] = executions.map((execution) => {
    const steps: ExecutionStepRow[] = execution.steps.map((step) => ({
      name: step.name,
      status: step.status,
      durationLabel: step.status === "running" ? "running" : formatDuration(step.durationMs),
      ...(step.detail ? { detail: step.detail } : {}),
    }));
    return {
      id: execution.id,
      workflowId: execution.workflowId,
      workflowName: execution.workflowName,
      status: execution.status,
      trigger: execution.trigger,
      startedAt: execution.startedAt,
      startedLabel: formatRelativeTime(execution.startedAt, now),
      startedAbsolute: formatAbsoluteTime(execution.startedAt),
      finishedAt: execution.finishedAt,
      finishedLabel: execution.finishedAt ? formatRelativeTime(execution.finishedAt, now) : null,
      finishedAbsolute: execution.finishedAt ? formatAbsoluteTime(execution.finishedAt) : null,
      durationMs: execution.durationMs,
      durationLabel: formatDuration(execution.durationMs),
      steps,
    };
  });

  return <ExecutionsTable rows={rows} />;
}
