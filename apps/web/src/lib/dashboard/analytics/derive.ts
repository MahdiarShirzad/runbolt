import { formatCount, formatDuration, formatPercent } from "../format";
import type { ExecutionStatus, TimeRange, TriggerType } from "../types";
import { DAY_MS, HOUR_MS, startOfLocalDay } from "./dataset";
import type {
  AnalyticsEvent,
  DashboardAnalytics,
  DurationBin,
  DurationDistribution,
  DurationPoint,
  FailureCategoryStat,
  HeatmapCell,
  HeatmapData,
  HeatmapRow,
  KpiMetric,
  SecondaryMetrics,
  StatusStat,
  SuccessRatePoint,
  TriggerStat,
  VolumeGranularity,
  VolumePoint,
  WorkflowRank,
} from "./types";

type Granularity = "hour" | "day" | "week";

interface InternalBucket {
  start: number;
  end: number;
  key: string;
  label: string;
  tooltipLabel: string;
}

const SUCCESS_TARGET = 0.95;

const TRIGGER_LABELS: Record<TriggerType, string> = {
  webhook: "Webhook",
  schedule: "Schedule",
  api: "API",
  manual: "Manual",
};

const STATUS_LABELS: Record<ExecutionStatus, string> = {
  success: "Succeeded",
  failed: "Failed",
  running: "Running",
  queued: "Queued",
  cancelled: "Cancelled",
};

const hourFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  hour12: false,
});
const dayLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const hourTooltipFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  hour12: false,
});
const dayTooltipFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const hourAxisFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  hour12: false,
});

function hourBucket(start: number): InternalBucket {
  return {
    start,
    end: start + HOUR_MS,
    key: `h${start}`,
    label: hourFormatter.format(new Date(start)),
    tooltipLabel: `${hourTooltipFormatter.format(new Date(start))}:00`,
  };
}

function dayBucket(start: number): InternalBucket {
  const date = new Date(start);
  return {
    start,
    end: start + DAY_MS,
    key: `d${start}`,
    label: dayLabelFormatter.format(date),
    tooltipLabel: dayTooltipFormatter.format(date),
  };
}

function buildBuckets(gran: Granularity, range: TimeRange, now: number): InternalBucket[] {
  if (gran === "hour") {
    const count = range === "24h" ? 24 : 7 * 24;
    const currentHour = Math.floor(now / HOUR_MS) * HOUR_MS;
    return Array.from({ length: count }, (_, i) =>
      hourBucket(currentHour - (count - 1 - i) * HOUR_MS),
    );
  }
  if (gran === "day") {
    const count = range === "7d" ? 7 : range === "30d" ? 30 : 1;
    return Array.from({ length: count }, (_, i) =>
      dayBucket(startOfLocalDay(now - (count - 1 - i) * DAY_MS)),
    );
  }
  const days = buildBuckets("day", range, now);
  const weeks: InternalBucket[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7);
    const first = chunk[0]!;
    const last = chunk[chunk.length - 1]!;
    weeks.push({
      start: first.start,
      end: last.end,
      key: `w${first.start}`,
      label: dayLabelFormatter.format(new Date(first.start)),
      tooltipLabel: `${dayLabelFormatter.format(new Date(first.start))} – ${dayLabelFormatter.format(
        new Date(last.start),
      )}`,
    });
  }
  return weeks;
}

interface Counts {
  success: number;
  failed: number;
  running: number;
  queued: number;
  cancelled: number;
  total: number;
}

function emptyCounts(): Counts {
  return { success: 0, failed: 0, running: 0, queued: 0, cancelled: 0, total: 0 };
}

function addToCounts(counts: Counts, status: ExecutionStatus): void {
  counts.total += 1;
  if (status === "success") counts.success += 1;
  else if (status === "failed") counts.failed += 1;
  else if (status === "running") counts.running += 1;
  else if (status === "queued") counts.queued += 1;
  else if (status === "cancelled") counts.cancelled += 1;
}

function aggregate(events: AnalyticsEvent[], buckets: InternalBucket[]): Counts[] {
  const counts = buckets.map(emptyCounts);
  for (const event of events) {
    const index = buckets.findIndex(
      (bucket) => event.startedAt >= bucket.start && event.startedAt < bucket.end,
    );
    if (index >= 0) addToCounts(counts[index]!, event.status);
  }
  return counts;
}

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0]!;
  const index = (sorted.length - 1) * p;
  const low = Math.floor(index);
  const high = Math.ceil(index);
  if (low === high) return sorted[low]!;
  return sorted[low]! + (sorted[high]! - sorted[low]!) * (index - low);
}

function durationsOf(events: AnalyticsEvent[]): number[] {
  return events
    .filter((event) => event.durationMs != null)
    .map((event) => event.durationMs as number)
    .sort((a, b) => a - b);
}

interface WindowSummary {
  total: number;
  success: number;
  failed: number;
  cancelled: number;
  running: number;
  queued: number;
  successRate: number | null;
  avgMs: number | null;
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
  retries: number;
  selfHealed: number;
}

function summarize(events: AnalyticsEvent[]): WindowSummary {
  const counts = emptyCounts();
  let retries = 0;
  let selfHealed = 0;
  const durations: number[] = [];
  for (const event of events) {
    addToCounts(counts, event.status);
    retries += event.retries;
    if (event.status === "success" && event.retries > 0) selfHealed += 1;
    if (event.durationMs != null) durations.push(event.durationMs);
  }
  durations.sort((a, b) => a - b);
  const finished = counts.success + counts.failed;
  return {
    total: counts.total,
    success: counts.success,
    failed: counts.failed,
    cancelled: counts.cancelled,
    running: counts.running,
    queued: counts.queued,
    successRate: finished === 0 ? null : counts.success / finished,
    avgMs: durations.length === 0 ? null : durations.reduce((a, b) => a + b, 0) / durations.length,
    p50Ms: percentile(durations, 0.5),
    p95Ms: percentile(durations, 0.95),
    p99Ms: percentile(durations, 0.99),
    retries,
    selfHealed,
  };
}

function deltaPct(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / previous;
}

function sparkOf(points: VolumePoint[], pick: (point: VolumePoint) => number): number[] {
  return points.map(pick);
}

function toneForTrend(delta: number | null): "up" | "down" | "flat" {
  if (delta == null || Math.abs(delta) < 0.0005) return "flat";
  return delta > 0 ? "up" : "down";
}

function kpiContextRate(value: number | null): string {
  return value == null ? "no finished runs" : `${formatPercent(value)} of finished runs`;
}

export function deriveDashboard(
  events: AnalyticsEvent[],
  range: TimeRange,
  now: number,
): DashboardAnalytics {
  const primaryGran: Granularity = range === "24h" ? "hour" : "day";
  const primaryBuckets = buildBuckets(primaryGran, range, now);
  const span = primaryBuckets[primaryBuckets.length - 1]!.end - primaryBuckets[0]!.start;
  const windowStart = primaryBuckets[0]!.start;
  const windowEnd = primaryBuckets[primaryBuckets.length - 1]!.end;
  const previousStart = windowStart - span;
  const previousEnd = windowStart;

  const inWindow = events.filter(
    (event) => event.startedAt >= windowStart && event.startedAt < windowEnd,
  );
  const inPrevious = events.filter(
    (event) => event.startedAt >= previousStart && event.startedAt < previousEnd,
  );

  const current = summarize(inWindow);
  const previous = summarize(inPrevious);
  const counts = aggregate(inWindow, primaryBuckets);

  // ---- Volume series (with optional extra granularities) ------------------
  const volume: VolumeGranularity[] = [];
  const volumePlan: { value: Granularity; label: string }[] =
    range === "24h"
      ? [{ value: "hour", label: "Hourly" }]
      : range === "7d"
        ? [
            { value: "hour", label: "Hourly" },
            { value: "day", label: "Daily" },
          ]
        : [
            { value: "day", label: "Daily" },
            { value: "week", label: "Weekly" },
          ];

  for (const plan of volumePlan) {
    const buckets = buildBuckets(plan.value, range, now);
    const bucketSpan = buckets[buckets.length - 1]!.end - buckets[0]!.start;
    const currentCounts = aggregate(inWindow, buckets);
    const previousCounts = aggregate(
      inPrevious,
      buckets.map((bucket) => ({ ...bucket, start: bucket.start - bucketSpan, end: bucket.end - bucketSpan })),
    );
    const points: VolumePoint[] = buckets.map((bucket, index) => {
      const tally = currentCounts[index]!;
      return {
        key: bucket.key,
        label: bucket.label,
        tooltipLabel: bucket.tooltipLabel,
        success: tally.success,
        failed: tally.failed,
        running: tally.running,
        queued: tally.queued,
        cancelled: tally.cancelled,
        total: tally.total,
        previousTotal: previousCounts[index]?.total ?? 0,
      };
    });
    volume.push({ value: plan.value, label: plan.label, points });
  }

  const primaryVolume = volume.find((gran) => gran.value === primaryGran) ?? volume[0]!;
  const primaryPoints = primaryVolume.points;

  // ---- Success rate -------------------------------------------------------
  const successPoints: SuccessRatePoint[] = primaryBuckets.map((bucket, index) => {
    const tally = counts[index]!;
    const finished = tally.success + tally.failed;
    const rate = finished === 0 ? null : tally.success / finished;
    const prev = previous
      ? aggregateIn(inPrevious, primaryBuckets, index, span)
      : emptyCounts();
    const prevFinished = prev.success + prev.failed;
    return {
      key: bucket.key,
      label: bucket.label,
      tooltipLabel: bucket.tooltipLabel,
      rate,
      previousRate: prevFinished === 0 ? null : prev.success / prevFinished,
      success: tally.success,
      failed: tally.failed,
      total: finished,
      anomalous: rate != null && rate < SUCCESS_TARGET,
    };
  });
  const anomalousCount = successPoints.filter((point) => point.anomalous).length;

  // ---- Duration trend -----------------------------------------------------
  const durationsByBucket = primaryBuckets.map((bucket) =>
    durationsOf(
      inWindow.filter(
        (event) => event.startedAt >= bucket.start && event.startedAt < bucket.end,
      ),
    ),
  );
  const previousAvgByBucket = primaryBuckets.map((bucket) => {
    const shifted = bucket.start - span;
    const list = durationsOf(
      inPrevious.filter((event) => event.startedAt >= shifted && event.startedAt < shifted + (bucket.end - bucket.start)),
    );
    return list.length === 0 ? null : list.reduce((a, b) => a + b, 0) / list.length;
  });
  const durationPoints: DurationPoint[] = primaryBuckets.map((bucket, index) => {
    const list = durationsByBucket[index]!;
    return {
      key: bucket.key,
      label: bucket.label,
      tooltipLabel: bucket.tooltipLabel,
      avg: list.length === 0 ? null : list.reduce((a, b) => a + b, 0) / list.length,
      p50: percentile(list, 0.5),
      p95: percentile(list, 0.95),
      previousAvg: previousAvgByBucket[index] ?? null,
    };
  });

  // ---- Status breakdown ---------------------------------------------------
  const statusOrder: ExecutionStatus[] = ["success", "failed", "cancelled", "running", "queued"];
  const statusTotal = current.total;
  const status: StatusStat[] = statusOrder.map((statusKey) => {
    const count =
      statusKey === "success"
        ? current.success
        : statusKey === "failed"
          ? current.failed
          : statusKey === "cancelled"
            ? current.cancelled
            : statusKey === "running"
              ? current.running
              : current.queued;
    return {
      status: statusKey,
      label: STATUS_LABELS[statusKey],
      count,
      pct: statusTotal === 0 ? 0 : count / statusTotal,
    };
  });

  // ---- Failure categories -------------------------------------------------
  const categoryMap = new Map<string, number>();
  for (const event of inWindow) {
    if (event.status !== "failed" || !event.errorCategory) continue;
    categoryMap.set(event.errorCategory, (categoryMap.get(event.errorCategory) ?? 0) + 1);
  }
  const failedTotal = current.failed;
  const failureCategories: FailureCategoryStat[] = [...categoryMap.entries()]
    .map(([category, count]) => ({
      category,
      count,
      pct: failedTotal === 0 ? 0 : count / failedTotal,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  // ---- Trigger distribution ----------------------------------------------
  const triggerMap = new Map<TriggerType, { success: number; failed: number; other: number; total: number }>();
  for (const event of inWindow) {
    const tally = triggerMap.get(event.trigger) ?? { success: 0, failed: 0, other: 0, total: 0 };
    tally.total += 1;
    if (event.status === "success") tally.success += 1;
    else if (event.status === "failed") tally.failed += 1;
    else tally.other += 1;
    triggerMap.set(event.trigger, tally);
  }
  const triggers: TriggerStat[] = (Object.keys(TRIGGER_LABELS) as TriggerType[])
    .map((trigger) => {
      const tally = triggerMap.get(trigger) ?? { success: 0, failed: 0, other: 0, total: 0 };
      return {
        trigger,
        label: TRIGGER_LABELS[trigger],
        success: tally.success,
        failed: tally.failed,
        other: tally.other,
        total: tally.total,
        pct: current.total === 0 ? 0 : tally.total / current.total,
      };
    })
    .sort((a, b) => b.total - a.total);

  // ---- Duration distribution (histogram + percentiles) -------------------
  const distribution = buildDistribution(inWindow);

  // ---- Workflow rankings --------------------------------------------------
  const workflowRanks = buildWorkflowRanks(inWindow);
  const byRuns = [...workflowRanks].sort((a, b) => b.runs - a.runs).slice(0, 8);
  const byFailures = [...workflowRanks]
    .filter((rank) => rank.failed > 0)
    .sort((a, b) => (b.failureRate ?? 0) - (a.failureRate ?? 0) || b.failed - a.failed)
    .slice(0, 8);
  const byDuration = [...workflowRanks]
    .filter((rank) => rank.p95DurationMs != null)
    .sort((a, b) => (b.p95DurationMs ?? 0) - (a.p95DurationMs ?? 0))
    .slice(0, 8);

  // ---- Heatmap ------------------------------------------------------------
  const heatmap = buildHeatmap(inWindow, range, now);

  // ---- Secondary metrics --------------------------------------------------
  const activeWorkflows = new Set(
    inWindow.filter((event) => event.workflowStatus === "active").map((event) => event.workflowId),
  ).size;
  const pausedWorkflows = new Set(
    inWindow.filter((event) => event.workflowStatus === "paused").map((event) => event.workflowId),
  ).size;
  const busiest = triggers[0] ?? null;
  const slowest = byDuration[0] ?? null;
  const peak = primaryPoints.reduce(
    (best, point) => (point.total > best.total ? point : best),
    { total: 0, tooltipLabel: "—" } as VolumePoint,
  );
  const hoursInWindow = span / HOUR_MS;
  const secondary: SecondaryMetrics = {
    activeWorkflows,
    pausedWorkflows,
    runningNow: current.running,
    queuedNow: current.queued,
    retryCount: current.retries,
    selfHealed: current.selfHealed,
    peakPerHour: hoursInWindow <= 0 ? 0 : Math.round(current.total / hoursInWindow),
    peakHourLabel: peak.tooltipLabel,
    p99Ms: current.p99Ms,
    slowestName: slowest?.name ?? null,
    slowestAvgMs: slowest?.p95DurationMs ?? null,
    busiestTrigger: busiest?.trigger ?? null,
  };

  // ---- KPIs ---------------------------------------------------------------
  const throughput = hoursInWindow <= 0 ? 0 : current.total / hoursInWindow;
  const prevThroughput = hoursInWindow <= 0 ? 0 : previous.total / hoursInWindow;
  const kpis: KpiMetric[] = [
    makeKpi({
      key: "total",
      label: "Total executions",
      value: current.total,
      previous: previous.total,
      display: formatCount(current.total),
      invert: false,
      context: `vs ${formatCount(previous.total)} previous period`,
      tooltip: "Every workflow run started in the selected range, across all statuses.",
      spark: sparkOf(primaryPoints, (point) => point.total),
      tone: "default",
    }),
    makeKpi({
      key: "success-rate",
      label: "Success rate",
      value: current.successRate,
      previous: previous.successRate,
      display: current.successRate == null ? "—" : formatPercent(current.successRate),
      invert: false,
      context: kpiContextRate(previous.successRate) + " previously",
      tooltip: "Succeeded runs divided by finished runs (succeeded + failed). Live runs are excluded.",
      spark: successPoints.map((point) => (point.rate == null ? 0 : point.rate * 100)),
      tone: "ok",
    }),
    makeKpi({
      key: "failed",
      label: "Failed executions",
      value: current.failed,
      previous: previous.failed,
      display: formatCount(current.failed),
      invert: true,
      context:
        current.successRate == null
          ? `${formatCount(current.failed)} failures`
          : `${formatPercent(1 - current.successRate)} of finished runs`,
      tooltip: "Runs that ended in an error. Fewer is better.",
      spark: sparkOf(primaryPoints, (point) => point.failed),
      tone: "bad",
    }),
    makeKpi({
      key: "avg-duration",
      label: "Avg execution time",
      value: current.avgMs,
      previous: previous.avgMs,
      display: formatDuration(current.avgMs),
      invert: true,
      context: previous.avgMs == null ? "no prior data" : `${formatDuration(previous.avgMs)} previously`,
      tooltip: "Mean wall-clock duration of finished runs. Lower is better.",
      spark: durationPoints.map((point) => point.avg ?? 0),
      tone: "highlight",
    }),
    makeKpi({
      key: "p95-duration",
      label: "P95 execution time",
      value: current.p95Ms,
      previous: previous.p95Ms,
      display: formatDuration(current.p95Ms),
      invert: true,
      context: previous.p95Ms == null ? "no prior data" : `${formatDuration(previous.p95Ms)} previously`,
      tooltip: "95th percentile duration — the slow tail users actually feel.",
      spark: durationPoints.map((point) => point.p95 ?? 0),
      tone: "warn",
    }),
    makeKpi({
      key: "throughput",
      label: "Throughput",
      value: throughput,
      previous: prevThroughput,
      display: `${throughput < 10 ? throughput.toFixed(1) : Math.round(throughput)}/hr`,
      invert: false,
      context: `peak ${formatCount(maxPoint(primaryPoints))} in ${primaryVolume.label.toLowerCase()} bucket`,
      tooltip: "Average executions started per hour across the selected range.",
      spark: sparkOf(primaryPoints, (point) => point.total),
      tone: "accent",
    }),
  ];

  return {
    rangeLabel: rangeLabel(range),
    previousLabel: `previous ${rangeShortLabel(range)}`,
    bucketLabel: primaryGran === "hour" ? "per hour" : "per day",
    kpis,
    secondary,
    volume,
    successRate: {
      points: successPoints,
      target: SUCCESS_TARGET,
      average: current.successRate,
      anomalousCount,
    },
    duration: { points: durationPoints, average: current.avgMs, p95: current.p95Ms },
    status,
    failureCategories,
    triggers,
    distribution,
    workflows: { byRuns, byFailures, byDuration },
    heatmap,
  };
}

function aggregateIn(
  events: AnalyticsEvent[],
  buckets: InternalBucket[],
  index: number,
  span: number,
): Counts {
  const bucket = buckets[index]!;
  const start = bucket.start - span;
  const end = bucket.end - span;
  const counts = emptyCounts();
  for (const event of events) {
    if (event.startedAt >= start && event.startedAt < end) addToCounts(counts, event.status);
  }
  return counts;
}

function maxPoint(points: VolumePoint[]): number {
  return points.reduce((max, point) => Math.max(max, point.total), 0);
}

function makeKpi(input: {
  key: string;
  label: string;
  value: number | null;
  previous: number | null;
  display: string;
  invert: boolean;
  context: string;
  tooltip: string;
  spark: number[];
  tone: KpiMetric["tone"];
}): KpiMetric {
  const delta = deltaPct(input.value, input.previous);
  return {
    key: input.key,
    label: input.label,
    value: input.value,
    previous: input.previous,
    display: input.display,
    deltaPct: delta,
    trend: toneForTrend(delta),
    invert: input.invert,
    context: input.context,
    tooltip: input.tooltip,
    spark: input.spark,
    tone: input.tone,
  };
}

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function buildDistribution(events: AnalyticsEvent[]): DurationDistribution {
  const durations = durationsOf(events);
  if (durations.length === 0) {
    return {
      bins: [],
      total: 0,
      avgMs: null,
      p50Ms: null,
      p90Ms: null,
      p95Ms: null,
      p99Ms: null,
      maxMs: null,
    };
  }
  const p99 = percentile(durations, 0.99) ?? durations[durations.length - 1]!;
  const max = niceCeil(Math.max(p99, durations[durations.length - 1]!) * 1.05);
  const binCount = 12;
  const binSize = max / binCount;
  const bins: DurationBin[] = Array.from({ length: binCount }, (_, i) => {
    const from = i * binSize;
    const to = (i + 1) * binSize;
    return {
      label: from === 0 ? `≤ ${formatDuration(to)}` : `${formatDuration(from)}–${formatDuration(to)}`,
      from,
      to,
      count: 0,
      slow: false,
    };
  });
  for (const value of durations) {
    const index = Math.min(binCount - 1, Math.floor(value / binSize));
    bins[index]!.count += 1;
  }
  const p95 = percentile(durations, 0.95);
  for (const bin of bins) bin.slow = p95 != null && bin.to > p95;

  return {
    bins,
    total: durations.length,
    avgMs: durations.reduce((a, b) => a + b, 0) / durations.length,
    p50Ms: percentile(durations, 0.5),
    p90Ms: percentile(durations, 0.9),
    p95Ms: p95,
    p99Ms: percentile(durations, 0.99),
    maxMs: durations[durations.length - 1]!,
  };
}

function buildWorkflowRanks(events: AnalyticsEvent[]): WorkflowRank[] {
  const map = new Map<string, {
    name: string;
    slug: string;
    status: WorkflowRank["status"];
    runs: number;
    success: number;
    failed: number;
    durations: number[];
    lastRunAt: number | null;
  }>();

  for (const event of events) {
    let entry = map.get(event.workflowId);
    if (!entry) {
      entry = {
        name: event.workflowName,
        slug: event.workflowSlug,
        status: event.workflowStatus,
        runs: 0,
        success: 0,
        failed: 0,
        durations: [],
        lastRunAt: null,
      };
      map.set(event.workflowId, entry);
    }
    entry.runs += 1;
    if (event.status === "success") entry.success += 1;
    else if (event.status === "failed") entry.failed += 1;
    if (event.durationMs != null) entry.durations.push(event.durationMs);
    if (entry.lastRunAt == null || event.startedAt > entry.lastRunAt) {
      entry.lastRunAt = event.startedAt;
    }
  }

  return [...map.entries()].map(([workflowId, entry]) => {
    const finished = entry.success + entry.failed;
    const sorted = [...entry.durations].sort((a, b) => a - b);
    return {
      workflowId,
      name: entry.name,
      slug: entry.slug,
      status: entry.status,
      runs: entry.runs,
      success: entry.success,
      failed: entry.failed,
      successRate: finished === 0 ? null : entry.success / finished,
      failureRate: entry.runs === 0 ? null : entry.failed / entry.runs,
      avgDurationMs:
        sorted.length === 0 ? null : sorted.reduce((a, b) => a + b, 0) / sorted.length,
      p95DurationMs: percentile(sorted, 0.95),
      lastRunAt: entry.lastRunAt,
    };
  });
}

function buildHeatmap(events: AnalyticsEvent[], range: TimeRange, now: number): HeatmapData {
  const rows: HeatmapRow[] = [];
  let maxCount = 0;
  let total = 0;

  if (range === "24h") {
    const currentHour = Math.floor(now / HOUR_MS) * HOUR_MS;
    const cells: HeatmapCell[] = Array.from({ length: 24 }, (_, i) => {
      const start = currentHour - (23 - i) * HOUR_MS;
      const hourEvents = events.filter(
        (event) => event.startedAt >= start && event.startedAt < start + HOUR_MS,
      );
      return {
        hour: new Date(start).getHours(),
        count: hourEvents.length,
        failed: hourEvents.filter((event) => event.status === "failed").length,
      };
    });
    const rowTotal = cells.reduce((sum, cell) => sum + cell.count, 0);
    rows.push({
      key: "24h",
      label: "Last 24h",
      longLabel: "Last 24 hours",
      cells,
      total: rowTotal,
      failed: cells.reduce((sum, cell) => sum + cell.failed, 0),
    });
    total = rowTotal;
    maxCount = cells.reduce((max, cell) => Math.max(max, cell.count), 0);
  } else {
    const dayCount = range === "7d" ? 7 : 30;
    for (let d = dayCount - 1; d >= 0; d--) {
      const dayStart = startOfLocalDay(now - d * DAY_MS);
      const cells: HeatmapCell[] = Array.from({ length: 24 }, (_, hour) => {
        const start = dayStart + hour * HOUR_MS;
        const hourEvents = events.filter(
          (event) => event.startedAt >= start && event.startedAt < start + HOUR_MS,
        );
        return {
          hour,
          count: hourEvents.length,
          failed: hourEvents.filter((event) => event.status === "failed").length,
        };
      });
      const rowTotal = cells.reduce((sum, cell) => sum + cell.count, 0);
      const rowFailed = cells.reduce((sum, cell) => sum + cell.failed, 0);
      const date = new Date(dayStart);
      rows.push({
        key: `d${dayStart}`,
        label: dayTooltipFormatter.format(date),
        longLabel: dayTooltipFormatter.format(date),
        cells,
        total: rowTotal,
        failed: rowFailed,
      });
      total += rowTotal;
      for (const cell of cells) maxCount = Math.max(maxCount, cell.count);
    }
  }

  return { rows, maxCount, total, dayCount: range === "24h" ? 1 : range === "7d" ? 7 : 30 };
}

function rangeLabel(range: TimeRange): string {
  if (range === "24h") return "Last 24 hours";
  if (range === "7d") return "Last 7 days";
  return "Last 30 days";
}

function rangeShortLabel(range: TimeRange): string {
  if (range === "24h") return "24h";
  if (range === "7d") return "7d";
  return "30d";
}

export const HEATMAP_HOUR_LABELS = Array.from({ length: 24 }, (_, hour) =>
  hourAxisFormatter.format(new Date(2020, 0, 1, hour)),
);
