export type TimeRange = "24h" | "7d" | "30d";

export const TIME_RANGES: readonly TimeRange[] = ["24h", "7d", "30d"] as const;

export type ExecutionStatus =
  | "success"
  | "failed"
  | "running"
  | "queued"
  | "cancelled";

export type TriggerType = "webhook" | "schedule" | "api" | "manual";

export type WorkflowStatus = "active" | "paused";

export interface SessionUser {
  name: string;
  email: string;
  role: string;
}

export interface WorkspaceSummary {
  name: string;
  workflowCount: number;
  activeWorkflowCount: number;
  runsLast30d: number;
}

export interface MetricSnapshot {
  range: TimeRange;
  rangeLabel: string;
  totalWorkflows: number;
  activeWorkflows: number;
  pausedWorkflows: number;
  successfulRuns: number;
  failedRuns: number;
  totalRuns: number;
  successRate: number | null;
}

export interface ActivityPoint {
  /** bucket start, ISO */
  at: string;
  success: number;
  failed: number;
}

export interface ActivitySeries {
  range: TimeRange;
  rangeLabel: string;
  bucketLabel: "hour" | "day";
  points: ActivityPoint[];
}

export interface ExecutionStep {
  name: string;
  status: ExecutionStatus;
  durationMs: number | null;
  detail?: string;
}

export type LogLevel = "info" | "warn" | "error";

export interface ExecutionLogEntry {
  id: string;
  at: string;
  level: LogLevel;
  source: string;
  message: string;
}

export interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  trigger: TriggerType;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  steps: ExecutionStep[];
}

export interface WorkflowSummary {
  id: string;
  name: string;
  slug: string;
  status: WorkflowStatus;
  trigger: TriggerType;
  lastRun: { status: ExecutionStatus; at: string } | null;
  runsLast30d: number;
  /** ISO timestamp of the last configuration change (`updated_at` in the API). */
  updatedAt: string;
}

export type NotificationKind = "error" | "warning" | "info" | "success";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
}
