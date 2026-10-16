import type { DashboardAnalytics } from "./types";

function cell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * CSV export for the analytics header action. Uses the per-day volume buckets
 * (the finest stable series) so the download reconciles with the volume chart.
 */
export function analyticsCsv(analytics: DashboardAnalytics): string {
  const granularity =
    analytics.volume.find((entry) => entry.value === "day") ?? analytics.volume[0];
  const header = [
    "Bucket",
    "Succeeded",
    "Failed",
    "Cancelled",
    "Running",
    "Queued",
    "Total",
    "Previous total",
  ];
  const rows = (granularity?.points ?? []).map((point) =>
    [
      point.tooltipLabel,
      point.success,
      point.failed,
      point.cancelled,
      point.running,
      point.queued,
      point.total,
      point.previousTotal,
    ]
      .map(cell)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

export function analyticsCsvFilename(range: string): string {
  return `runbolt-analytics-${range}.csv`;
}
