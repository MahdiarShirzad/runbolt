import type { ExecutionStatus, TriggerType } from "@/lib/dashboard/types";

export interface ExecutionStepRow {
  name: string;
  status: ExecutionStatus;
  durationLabel: string;
  detail?: string;
}

export interface ExecutionRow {
  id: string;
  workflowName: string;
  status: ExecutionStatus;
  trigger: TriggerType;
  startedAt: string;
  startedLabel: string;
  startedAbsolute: string;
  finishedAt: string | null;
  finishedLabel: string | null;
  finishedAbsolute: string | null;
  durationLabel: string;
  steps: ExecutionStepRow[];
}
