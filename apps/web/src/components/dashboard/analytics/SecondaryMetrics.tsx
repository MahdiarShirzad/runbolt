import type { SecondaryMetrics as SecondaryMetricsData } from "@/lib/dashboard/analytics/types";
import { formatCount, formatDuration } from "@/lib/dashboard/format";
import type { TriggerType } from "@/lib/dashboard/types";

const TRIGGER_LABELS: Record<TriggerType, string> = {
  webhook: "Webhook",
  schedule: "Schedule",
  api: "API",
  manual: "Manual",
};

interface Item {
  label: string;
  value: string;
  detail: string;
  tone?: "ok" | "bad" | "warn" | "accent" | "highlight" | "default";
}

const TONE_CLASS: Record<NonNullable<Item["tone"]>, string> = {
  ok: "text-ok",
  bad: "text-bad",
  warn: "text-warn",
  accent: "text-accent",
  highlight: "text-highlight",
  default: "text-fg",
};

/**
 * Compact operational vitals strip — secondary metrics that support the KPI
 * row without competing with it for prominence.
 */
export function SecondaryMetrics({ data }: { data: SecondaryMetricsData }) {
  const items: Item[] = [
    {
      label: "Active workflows",
      value: formatCount(data.activeWorkflows + data.pausedWorkflows),
      detail: `${data.activeWorkflows} active · ${data.pausedWorkflows} paused`,
      tone: "ok",
    },
    {
      label: "Live runs",
      value: formatCount(data.runningNow + data.queuedNow),
      detail: `${data.runningNow} running · ${data.queuedNow} queued`,
      tone: "accent",
    },
    {
      label: "Retries",
      value: formatCount(data.retryCount),
      detail: `${formatCount(data.selfHealed)} self-healed`,
      tone: "warn",
    },
    {
      label: "Peak throughput",
      value: `${formatCount(data.peakPerHour)}/hr`,
      detail: data.peakHourLabel,
      tone: "highlight",
    },
    {
      label: "P99 latency",
      value: formatDuration(data.p99Ms),
      detail: "99th percentile",
      tone: "warn",
    },
    {
      label: "Busiest trigger",
      value: data.busiestTrigger ? TRIGGER_LABELS[data.busiestTrigger] : "—",
      detail: data.slowestName ? `slowest: ${data.slowestName}` : "no data",
      tone: "default",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line/60 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="bg-surface/60 px-4 py-3">
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
            {item.label}
          </dt>
          <dd className="mt-1.5">
            <span
              className={`block font-display text-[18px] font-semibold leading-none tracking-[-0.01em] tabular-nums ${TONE_CLASS[item.tone ?? "default"]}`}
            >
              {item.value}
            </span>
            <span className="mt-1 block truncate text-[11.5px] text-muted">{item.detail}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
