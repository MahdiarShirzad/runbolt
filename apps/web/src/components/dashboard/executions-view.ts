import type {
  ExecutionStatus,
  LogLevel,
  TriggerType,
} from "@/lib/dashboard/types";
import type { ExecutionDebug } from "@/lib/dashboard/execution-debug";

/** sessionStorage key holding the last `/executions` query string. */
export const EXECUTIONS_LIST_QUERY_KEY = "runbolt.executions.list-query";

/** Window sizes for the executions time-range filter (mirrors TimeRange). */
export const EXECUTION_RANGE_MS: Record<"24h" | "7d" | "30d", number> = {
  "24h": 86_400_000,
  "7d": 604_800_000,
  "30d": 2_592_000_000,
};

export interface ExecutionStepRow {
  name: string;
  status: ExecutionStatus;
  durationLabel: string;
  detail?: string;
}

export interface ExecutionRow {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  trigger: TriggerType;
  startedAt: string;
  startedLabel: string;
  startedAbsolute: string;
  finishedAt: string | null;
  finishedLabel: string | null;
  finishedAbsolute: string | null;
  durationMs: number | null;
  durationLabel: string;
  /** Failure detail surfaced from the failing step, when the run failed. */
  errorMessage?: string | null;
  /** Number of nodes that succeeded within this run. */
  successCount: number;
  /** Number of nodes that failed within this run. */
  failedCount: number;
  /** Total nodes recorded for this run. */
  nodeCount: number;
  steps: ExecutionStepRow[];
}

/** Roll up a run's steps into the node counts shown in the history table. */
export function summarizeExecutionSteps(
  steps: readonly { status: ExecutionStatus }[],
): Pick<ExecutionRow, "successCount" | "failedCount" | "nodeCount"> {
  let successCount = 0;
  let failedCount = 0;
  for (const step of steps) {
    if (step.status === "success") successCount += 1;
    else if (step.status === "failed") failedCount += 1;
  }
  return { successCount, failedCount, nodeCount: steps.length };
}

export interface ExecutionWorkflowOption {
  id: string;
  name: string;
}

export interface ExecutionTriggerOption {
  value: TriggerType;
  label: string;
}

export interface ExecutionListState {
  range: "24h" | "7d" | "30d";
  status: ExecutionStatus | "all";
  workflowId: string;
  trigger: TriggerType | "all";
  q: string;
  sort: "started" | "duration";
  page: number;
}

export interface ExecutionLogRow {
  id: string;
  at: string;
  clockLabel: string;
  absoluteLabel: string;
  level: LogLevel;
  source: string;
  message: string;
  /** Graph node the line belongs to, when known. */
  nodeId?: string;
  metadata?: Record<string, unknown>;
}

/** Header + graph + node-run data the debugger needs for one execution. */
export interface ExecutionDebugData {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  trigger: TriggerType;
  startedAt: string;
  startedLabel: string;
  startedAbsolute: string;
  finishedAt: string | null;
  finishedLabel: string | null;
  finishedAbsolute: string | null;
  durationMs: number | null;
  durationLabel: string;
  attempt: number;
  /** Editor route for the matching workflow, or null when none exists. */
  workflowHref: string | null;
  debug: ExecutionDebug;
}

export interface ExecutionStepDetailRow {
  index: number;
  name: string;
  status: ExecutionStatus;
  durationMs: number | null;
  durationLabel: string;
  startedAt: string | null;
  startedClock: string | null;
  startedAbsolute: string | null;
  detail: string | null;
}

export interface ExecutionDetailData {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  trigger: TriggerType;
  startedAt: string;
  startedLabel: string;
  startedAbsolute: string;
  finishedAt: string | null;
  finishedLabel: string | null;
  finishedAbsolute: string | null;
  durationMs: number | null;
  durationLabel: string;
  counts: {
    total: number;
    success: number;
    failed: number;
    running: number;
    cancelled: number;
  };
  errorStepName: string | null;
  errorMessage: string | null;
  steps: ExecutionStepDetailRow[];
}
