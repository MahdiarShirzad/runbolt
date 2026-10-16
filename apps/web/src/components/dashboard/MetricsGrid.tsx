import { formatCount, formatPercent } from "@/lib/dashboard/format";
import type { MetricSnapshot, TimeRange } from "@/lib/dashboard/types";
import { getMetrics } from "@/lib/dashboard/data";

function MetricCard({
  label,
  value,
  context,
}: {
  label: string;
  value: string;
  context: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface/60 px-4 py-3.5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      <p className="mt-2 font-display text-[26px] font-semibold leading-none tracking-[-0.01em] tabular-nums text-fg">
        {value}
      </p>
      <p className="mt-2 text-[12px] leading-snug text-muted">{context}</p>
    </div>
  );
}

export async function MetricsGrid({ range }: { range: TimeRange }) {
  // Trend deltas are intentionally omitted: they would require a verified
  // previous-period comparison from the real stats API.
  const metrics: MetricSnapshot = await getMetrics(range);

  const failedShare =
    metrics.totalRuns === 0 ? null : metrics.failedRuns / metrics.totalRuns;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Total workflows"
        value={formatCount(metrics.totalWorkflows)}
        context={`${metrics.activeWorkflows} active · ${metrics.pausedWorkflows} paused`}
      />
      <MetricCard
        label="Successful executions"
        value={formatCount(metrics.successfulRuns)}
        context={`${metrics.rangeLabel.toLowerCase()} · ${formatCount(metrics.totalRuns)} total runs`}
      />
      <MetricCard
        label="Failed executions"
        value={formatCount(metrics.failedRuns)}
        context={
          failedShare == null
            ? `${metrics.rangeLabel.toLowerCase()}`
            : `${metrics.rangeLabel.toLowerCase()} · ${formatPercent(failedShare)} of runs`
        }
      />
      <MetricCard
        label="Success rate"
        value={metrics.successRate == null ? "—" : formatPercent(metrics.successRate)}
        context={
          metrics.totalRuns === 0
            ? "No runs in this range"
            : `${formatCount(metrics.successfulRuns)} of ${formatCount(metrics.totalRuns)} runs`
        }
      />
    </div>
  );
}
