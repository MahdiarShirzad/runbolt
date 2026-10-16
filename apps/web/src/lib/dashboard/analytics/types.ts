import type { ExecutionStatus, TriggerType, WorkflowStatus } from "../types";

/** A single generated execution observation (sample data, no step detail). */
export interface AnalyticsEvent {
  id: string;
  workflowId: string;
  workflowName: string;
  workflowSlug: string;
  workflowStatus: WorkflowStatus;
  status: ExecutionStatus;
  trigger: TriggerType;
  /** epoch ms */
  startedAt: number;
  durationMs: number | null;
  retries: number;
  errorCategory: string | null;
}

export type ChartTone =
  | "default"
  | "ok"
  | "bad"
  | "warn"
  | "accent"
  | "highlight";

export interface KpiMetric {
  key: string;
  label: string;
  value: number | null;
  display: string;
  previous: number | null;
  /** Signed fraction, e.g. 0.12 = +12%. null when not comparable. */
  deltaPct: number | null;
  trend: "up" | "down" | "flat";
  /** When true, an increase is undesirable (duration, failures). */
  invert: boolean;
  context: string;
  tooltip: string;
  spark: number[];
  tone: ChartTone;
}

export interface SecondaryMetrics {
  activeWorkflows: number;
  pausedWorkflows: number;
  runningNow: number;
  queuedNow: number;
  retryCount: number;
  selfHealed: number;
  peakPerHour: number;
  peakHourLabel: string;
  p99Ms: number | null;
  slowestName: string | null;
  slowestAvgMs: number | null;
  busiestTrigger: TriggerType | null;
}

export interface VolumePoint {
  key: string;
  label: string;
  tooltipLabel: string;
  success: number;
  failed: number;
  running: number;
  queued: number;
  cancelled: number;
  total: number;
  previousTotal: number;
}

export interface VolumeGranularity {
  value: "hour" | "day" | "week";
  label: string;
  points: VolumePoint[];
}

export interface SuccessRatePoint {
  key: string;
  label: string;
  tooltipLabel: string;
  rate: number | null;
  previousRate: number | null;
  success: number;
  failed: number;
  total: number;
  anomalous: boolean;
}

export interface DurationPoint {
  key: string;
  label: string;
  tooltipLabel: string;
  avg: number | null;
  p50: number | null;
  p95: number | null;
  previousAvg: number | null;
}

export interface StatusStat {
  status: ExecutionStatus;
  label: string;
  count: number;
  pct: number;
}

export interface FailureCategoryStat {
  category: string;
  count: number;
  pct: number;
}

export interface TriggerStat {
  trigger: TriggerType;
  label: string;
  total: number;
  success: number;
  failed: number;
  other: number;
  pct: number;
}

export interface DurationBin {
  label: string;
  from: number;
  to: number;
  count: number;
  slow: boolean;
}

export interface DurationDistribution {
  bins: DurationBin[];
  total: number;
  avgMs: number | null;
  p50Ms: number | null;
  p90Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
  maxMs: number | null;
}

export interface WorkflowRank {
  workflowId: string;
  name: string;
  slug: string;
  status: WorkflowStatus;
  runs: number;
  success: number;
  failed: number;
  successRate: number | null;
  failureRate: number | null;
  avgDurationMs: number | null;
  p95DurationMs: number | null;
  lastRunAt: number | null;
}

export interface HeatmapCell {
  hour: number;
  count: number;
  failed: number;
}

export interface HeatmapRow {
  key: string;
  label: string;
  longLabel: string;
  cells: HeatmapCell[];
  total: number;
  failed: number;
}

export interface HeatmapData {
  rows: HeatmapRow[];
  maxCount: number;
  total: number;
  /** Days covered by the grid (1 for the 24h range). */
  dayCount: number;
}

export interface DashboardAnalytics {
  rangeLabel: string;
  previousLabel: string;
  bucketLabel: string;
  kpis: KpiMetric[];
  secondary: SecondaryMetrics;
  volume: VolumeGranularity[];
  successRate: {
    points: SuccessRatePoint[];
    target: number;
    average: number | null;
    anomalousCount: number;
  };
  duration: {
    points: DurationPoint[];
    average: number | null;
    p95: number | null;
  };
  status: StatusStat[];
  failureCategories: FailureCategoryStat[];
  triggers: TriggerStat[];
  distribution: DurationDistribution;
  workflows: {
    byRuns: WorkflowRank[];
    byFailures: WorkflowRank[];
    byDuration: WorkflowRank[];
  };
  heatmap: HeatmapData;
}
