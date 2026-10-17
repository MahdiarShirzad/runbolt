import {
  formatAbsoluteTime,
  formatRelativeTime,
} from "@/lib/dashboard/format";
import type {
  LocalWorkflow,
  LocalWorkflowState,
} from "@/lib/dashboard/local-workflows";
import type {
  ExecutionStatus,
  TriggerType,
  WorkflowStatus,
} from "@/lib/dashboard/types";

/** Pre-formatted row handed from the server boundary to the workflows table. */
export interface WorkflowItem {
  id: string;
  name: string;
  slug: string;
  status: WorkflowStatus;
  trigger: TriggerType;
  lastRunStatus: ExecutionStatus | null;
  lastRunAt: string | null;
  lastRunLabel: string | null;
  lastRunAbsolute: string | null;
  runs: number;
  runsLabel: string;
  updatedAt: string;
  updatedLabel: string;
  updatedAbsolute: string;
}

/** Server-formatted data for the workflow detail page (mock workflows). */
export interface WorkflowDetailData {
  id: string;
  name: string;
  slug: string;
  status: WorkflowStatus;
  trigger: TriggerType;
  lastRunStatus: ExecutionStatus | null;
  lastRunLabel: string | null;
  lastRunAbsolute: string | null;
  runsLabel: string;
  updatedAt: string;
  updatedLabel: string;
  updatedAbsolute: string;
}

export interface WorkflowRunRow {
  id: string;
  status: ExecutionStatus;
  trigger: TriggerType;
  startedAt: string;
  startedLabel: string;
  startedAbsolute: string;
  durationLabel: string;
}

/** Lightweight row the stats cards count from. */
export interface WorkflowStatItem {
  id: string;
  status: WorkflowStatus;
  lastRunStatus: ExecutionStatus | null;
}

function createdToStatItem(workflow: LocalWorkflow): WorkflowStatItem {
  return {
    id: workflow.id,
    status: workflow.status,
    lastRunStatus: null,
  };
}

/** Applies browser-local deletions/status overrides and appends created workflows. */
export function mergeWorkflowStatItems(
  base: WorkflowStatItem[],
  state: LocalWorkflowState,
): WorkflowStatItem[] {
  const deleted = new Set(state.deletedMockIds);
  const merged = base
    .filter((item) => !deleted.has(item.id))
    .map((item) =>
      state.statusOverrides[item.id]
        ? { ...item, status: state.statusOverrides[item.id] }
        : item,
    );
  return [...merged, ...state.created.map(createdToStatItem)];
}

function createdToWorkflowItem(
  workflow: LocalWorkflow,
  nowMs: number,
): WorkflowItem {
  const updatedAt = workflow.updatedAt ?? workflow.createdAt;
  return {
    id: workflow.id,
    name: workflow.name,
    slug: workflow.slug,
    status: workflow.status,
    trigger: workflow.trigger,
    lastRunStatus: null,
    lastRunAt: null,
    lastRunLabel: null,
    lastRunAbsolute: null,
    runs: 0,
    runsLabel: "0",
    updatedAt,
    updatedLabel: formatRelativeTime(updatedAt, nowMs),
    updatedAbsolute: formatAbsoluteTime(updatedAt),
  };
}

/** Applies browser-local deletions/status overrides and appends created workflows. */
export function mergeWorkflowItems(
  base: WorkflowItem[],
  state: LocalWorkflowState,
  nowMs: number,
): WorkflowItem[] {
  const deleted = new Set(state.deletedMockIds);
  const merged = base
    .filter((item) => !deleted.has(item.id))
    .map((item) => {
      const override = state.graphOverrides[item.id];
      const status = state.statusOverrides[item.id] ?? item.status;
      if (!override && status === item.status) return item;
      return {
        ...item,
        status,
        name: override?.name ?? item.name,
        ...(override
          ? {
              updatedAt: override.updatedAt,
              updatedLabel: formatRelativeTime(override.updatedAt, nowMs),
              updatedAbsolute: formatAbsoluteTime(override.updatedAt),
            }
          : {}),
      };
    });
  const created = state.created.map((workflow) =>
    createdToWorkflowItem(workflow, nowMs),
  );
  return [...created, ...merged];
}
