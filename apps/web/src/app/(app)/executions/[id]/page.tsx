import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExecutionDetailView } from "@/components/dashboard/ExecutionDetailView";
import type {
  ExecutionDetailData,
  ExecutionLogRow,
} from "@/components/dashboard/executions-view";
import { getExecutionById, getExecutionLogs } from "@/lib/dashboard/data";
import {
  currentTimestamp,
  formatAbsoluteTime,
  formatClockTime,
  formatDuration,
  formatRelativeTime,
} from "@/lib/dashboard/format";
import type { Execution } from "@/lib/dashboard/types";

interface ExecutionDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ExecutionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const execution = await getExecutionById(id);
  if (!execution) {
    return {
      title: "Execution — Runbolt",
      description: "Inspect a workflow execution.",
    };
  }
  return {
    title: `${execution.workflowName} · ${execution.id} — Runbolt`,
    description: `Step timeline, logs, and diagnostics for execution ${execution.id}.`,
  };
}

export const dynamic = "force-dynamic";

function formatDetail(execution: Execution, now: number): ExecutionDetailData {
  const counts = { total: execution.steps.length, success: 0, failed: 0, running: 0, cancelled: 0 };
  for (const step of execution.steps) {
    if (step.status === "success") counts.success += 1;
    else if (step.status === "failed") counts.failed += 1;
    else if (step.status === "running") counts.running += 1;
    else if (step.status === "cancelled") counts.cancelled += 1;
  }

  // Step start times derive from the execution start plus prior step
  // durations; they stay unknown once a step without a duration is hit.
  const startedMs = new Date(execution.startedAt).getTime();
  let cursorMs = startedMs;
  let cursorKnown = true;
  const steps = execution.steps.map((step, index) => {
    const startAt = cursorKnown ? cursorMs : null;
    if (step.durationMs != null) cursorMs += step.durationMs;
    else cursorKnown = false;
    return {
      index,
      name: step.name,
      status: step.status,
      durationMs: step.durationMs,
      durationLabel:
        step.status === "running" ? "running" : formatDuration(step.durationMs),
      startedAt: startAt == null ? null : new Date(startAt).toISOString(),
      startedClock: startAt == null ? null : formatClockTime(new Date(startAt).toISOString()),
      startedAbsolute: startAt == null ? null : formatAbsoluteTime(new Date(startAt).toISOString()),
      detail: step.detail ?? null,
    };
  });

  const failedStep = execution.steps.find((step) => step.status === "failed");

  return {
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
    counts,
    errorStepName: failedStep?.name ?? null,
    errorMessage: failedStep?.detail ?? null,
    steps,
  };
}

export default async function ExecutionDetailPage({
  params,
}: ExecutionDetailPageProps) {
  const { id } = await params;
  const execution = await getExecutionById(id);
  if (!execution) notFound();

  const logs = await getExecutionLogs(id);
  const now = currentTimestamp();

  const logRows: ExecutionLogRow[] = logs.map((entry) => ({
    id: entry.id,
    at: entry.at,
    clockLabel: formatClockTime(entry.at),
    absoluteLabel: formatAbsoluteTime(entry.at),
    level: entry.level,
    source: entry.source,
    message: entry.message,
  }));

  return (
    <ExecutionDetailView detail={formatDetail(execution, now)} logs={logRows} />
  );
}
