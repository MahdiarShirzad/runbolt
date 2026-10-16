import type {
  ExecutionStatus,
  LogLevel,
  TriggerType,
} from "@/lib/dashboard/types";

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
  steps: ExecutionStepRow[];
}

export interface ExecutionWorkflowOption {
  id: string;
  name: string;
}

export interface ExecutionListState {
  range: "24h" | "7d" | "30d";
  status: ExecutionStatus | "all";
  workflowId: string;
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
