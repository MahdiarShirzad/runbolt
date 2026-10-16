import {
  currentTimestamp,
  formatAbsoluteTime,
  formatDuration,
  formatRelativeTime,
} from "@/lib/dashboard/format";
import type { TimeRange } from "@/lib/dashboard/types";
import { getAnalyticsEvents, HOUR_MS } from "@/lib/dashboard/analytics/dataset";
import { eventToExecution } from "@/lib/dashboard/analytics/execution";
import type { ExecutionRow } from "../executions-view";
import { EXECUTION_RANGE_MS } from "../executions-view";
import { RecentExecutionsTable } from "./RecentExecutionsTable";

/**
 * Server boundary for the recent-executions widget. Builds at most `limit`
 * rows straight from the analytics dataset so the table always agrees with the
 * KPI cards and charts above it.
 */
export function RecentExecutionsSection({
  range,
  limit = 60,
}: {
  range: TimeRange;
  limit?: number;
}) {
  const now = currentTimestamp();
  const cutoff = now - EXECUTION_RANGE_MS[range];
  const rows: ExecutionRow[] = getAnalyticsEvents(now)
    .filter((event) => event.startedAt >= cutoff)
    .slice(0, limit)
    .map((event) => {
      const execution = eventToExecution(event);
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
        finishedLabel: execution.finishedAt
          ? formatRelativeTime(execution.finishedAt, now)
          : null,
        finishedAbsolute: execution.finishedAt
          ? formatAbsoluteTime(execution.finishedAt)
          : null,
        durationMs: execution.durationMs,
        durationLabel: formatDuration(execution.durationMs),
        errorMessage: event.errorCategory,
        steps: execution.steps.map((step) => ({
          name: step.name,
          status: step.status,
          durationLabel: formatDuration(step.durationMs),
          detail: step.detail,
        })),
      };
    });

  // Anchor the client-side range window to the start of the dataset's hour so
  // no already-included row is dropped by a slightly later client clock.
  const nowIso = new Date(Math.floor(now / HOUR_MS) * HOUR_MS).toISOString();

  return <RecentExecutionsTable rows={rows} range={range} nowIso={nowIso} />;
}
