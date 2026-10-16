import type { Metadata } from "next";
import { Suspense } from "react";
import { ExecutionsBrowser } from "@/components/dashboard/ExecutionsBrowser";
import { ExecutionsHeader } from "@/components/dashboard/ExecutionsHeader";
import { ExecutionsPageSkeleton } from "@/components/dashboard/Skeletons";
import type {
  ExecutionListState,
  ExecutionRow,
  ExecutionWorkflowOption,
} from "@/components/dashboard/executions-view";
import { getExecutions, getWorkflows } from "@/lib/dashboard/data";
import {
  currentTimestamp,
  formatAbsoluteTime,
  formatDuration,
  formatRelativeTime,
} from "@/lib/dashboard/format";
import type { ExecutionStatus } from "@/lib/dashboard/types";

export const metadata: Metadata = {
  title: "Executions — Runbolt",
  description: "Monitor every workflow run: status, timing, triggers, and failures.",
};

export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseRange(value: string | undefined): ExecutionListState["range"] {
  return value === "24h" || value === "7d" || value === "30d" ? value : "7d";
}

function parseStatus(value: string | undefined): ExecutionListState["status"] {
  const allowed: ExecutionStatus[] = ["success", "failed", "running", "queued", "cancelled"];
  return value && (allowed as string[]).includes(value)
    ? (value as ExecutionStatus)
    : "all";
}

function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function ExecutionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [executions, workflows] = await Promise.all([getExecutions(), getWorkflows()]);
  const now = currentTimestamp();

  const rows: ExecutionRow[] = executions.map((execution) => ({
    id: execution.id,
    workflowId: execution.workflowId,
    workflowName: execution.workflowName,
    status: execution.status,
    trigger: execution.trigger,
    startedAt: execution.startedAt,
    startedLabel: formatRelativeTime(execution.startedAt, now),
    startedAbsolute: formatAbsoluteTime(execution.startedAt),
    finishedAt: execution.finishedAt,
    finishedLabel: execution.finishedAt
      ? formatRelativeTime(execution.finishedAt, now)
      : null,
    finishedAbsolute: execution.finishedAt
      ? formatAbsoluteTime(execution.finishedAt)
      : null,
    durationMs: execution.durationMs,
    durationLabel:
      execution.status === "running" ? "running" : formatDuration(execution.durationMs),
    steps: execution.steps.map((step) => ({
      name: step.name,
      status: step.status,
      durationLabel:
        step.status === "running" ? "running" : formatDuration(step.durationMs),
      ...(step.detail ? { detail: step.detail } : {}),
    })),
  }));

  const workflowIdsWithRuns = new Set(executions.map((e) => e.workflowId));
  const workflowOptions: ExecutionWorkflowOption[] = workflows
    .filter((workflow) => workflowIdsWithRuns.has(workflow.id))
    .map((workflow) => ({ id: workflow.id, name: workflow.name }));

  const initial: ExecutionListState = {
    range: parseRange(first(sp.range)),
    status: parseStatus(first(sp.status)),
    workflowId: first(sp.workflow) || "all",
    q: first(sp.q) ?? "",
    sort: first(sp.sort) === "duration" ? "duration" : "started",
    page: parsePage(first(sp.page)),
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <ExecutionsHeader />
      <Suspense fallback={<ExecutionsPageSkeleton />}>
        <ExecutionsBrowser
          rows={rows}
          workflowOptions={workflowOptions}
          initial={initial}
          nowIso={new Date(now).toISOString()}
        />
      </Suspense>
    </div>
  );
}
