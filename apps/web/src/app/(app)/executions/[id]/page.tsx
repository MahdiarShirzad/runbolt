import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { ExecutionDetailView } from "@/components/dashboard/ExecutionDetailView";
import type {
  ExecutionDebugData,
  ExecutionLogRow,
} from "@/components/dashboard/executions-view";
import {
  getExecutionById,
  getExecutionDebug,
  getExecutionLogs,
  getWorkflows,
} from "@/lib/dashboard/data";
import {
  currentTimestamp,
  formatAbsoluteTime,
  formatClockTime,
  formatDuration,
  formatRelativeTime,
} from "@/lib/dashboard/format";

interface ExecutionDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ExecutionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const execution = await getExecutionById(id);
  if (!execution) {
    return pageMetadata({
      title: "Execution",
      description: "Inspect a workflow execution.",
      path: `/executions/${id}`,
      noIndex: true,
    });
  }
  return pageMetadata({
    title: `${execution.workflowName} · ${execution.id}`,
    description: `Debug execution ${execution.id}: graph, node inputs and outputs, logs, and errors.`,
    path: `/executions/${id}`,
    noIndex: true,
  });
}

export const dynamic = "force-dynamic";

export default async function ExecutionDetailPage({
  params,
}: ExecutionDetailPageProps) {
  const { id } = await params;
  const execution = await getExecutionById(id);
  if (!execution) notFound();

  const [debug, logs, workflows] = await Promise.all([
    getExecutionDebug(id),
    getExecutionLogs(id),
    getWorkflows(),
  ]);
  if (!debug) notFound();

  const workflow = workflows.find((candidate) => candidate.id === execution.workflowId);
  const now = currentTimestamp();

  const logRows: ExecutionLogRow[] = logs.map((entry) => ({
    id: entry.id,
    at: entry.at,
    clockLabel: formatClockTime(entry.at),
    absoluteLabel: formatAbsoluteTime(entry.at),
    level: entry.level,
    source: entry.source,
    message: entry.message,
    ...(entry.nodeId ? { nodeId: entry.nodeId } : {}),
    ...(entry.metadata ? { metadata: entry.metadata } : {}),
  }));

  const data: ExecutionDebugData = {
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
      execution.status === "running"
        ? "running"
        : formatDuration(execution.durationMs),
    attempt: execution.attempt ?? 1,
    workflowHref: workflow ? `/workflows/${workflow.slug}/edit` : null,
    debug,
  };

  return <ExecutionDetailView data={data} logs={logRows} />;
}
