import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { WorkflowDetailView } from "@/components/dashboard/WorkflowDetailView";
import type {
  WorkflowDetailData,
  WorkflowRunRow,
} from "@/components/dashboard/workflows-view";
import { getWorkflowExecutions, getWorkflows } from "@/lib/dashboard/data";
import {
  currentTimestamp,
  formatAbsoluteTime,
  formatCount,
  formatDuration,
  formatRelativeTime,
} from "@/lib/dashboard/format";

interface WorkflowDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: WorkflowDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const workflows = await getWorkflows();
  const workflow = workflows.find(
    (candidate) => candidate.slug === slug || candidate.id === slug,
  );
  if (!workflow) {
    return pageMetadata({
      title: "Workflow",
      description: "Inspect a workflow and its run history.",
      path: `/workflows/${slug}`,
      noIndex: true,
    });
  }
  return pageMetadata({
    title: workflow.name,
    description: `Inspect ${workflow.name}, its trigger, steps, and recent runs.`,
    path: `/workflows/${slug}`,
    noIndex: true,
  });
}

export const dynamic = "force-dynamic";

/**
 * The mock baseline is matched by slug or id (`wf_…`). Browser-local workflows
 * are unknown here — the client island resolves them, so this page never
 * calls notFound() up front.
 */
export default async function WorkflowDetailPage({
  params,
}: WorkflowDetailPageProps) {
  const { slug } = await params;
  const workflows = await getWorkflows();
  const workflow = workflows.find(
    (candidate) => candidate.slug === slug || candidate.id === slug,
  );

  if (!workflow) {
    return <WorkflowDetailView mock={null} runs={[]} paramSlug={slug} />;
  }

  const executions = await getWorkflowExecutions(workflow.id);
  const now = currentTimestamp();

  const mock: WorkflowDetailData = {
    id: workflow.id,
    name: workflow.name,
    slug: workflow.slug,
    status: workflow.status,
    trigger: workflow.trigger,
    lastRunStatus: workflow.lastRun?.status ?? null,
    lastRunLabel: workflow.lastRun
      ? formatRelativeTime(workflow.lastRun.at, now)
      : null,
    lastRunAbsolute: workflow.lastRun
      ? formatAbsoluteTime(workflow.lastRun.at)
      : null,
    runsLabel: formatCount(workflow.runsLast30d),
    updatedAt: workflow.updatedAt,
    updatedLabel: formatRelativeTime(workflow.updatedAt, now),
    updatedAbsolute: formatAbsoluteTime(workflow.updatedAt),
  };

  const runs: WorkflowRunRow[] = executions.map((execution) => ({
    id: execution.id,
    status: execution.status,
    trigger: execution.trigger,
    startedAt: execution.startedAt,
    startedLabel: formatRelativeTime(execution.startedAt, now),
    startedAbsolute: formatAbsoluteTime(execution.startedAt),
    durationLabel: formatDuration(execution.durationMs),
  }));

  return (
    <WorkflowDetailView mock={mock} runs={runs} paramSlug={slug} />
  );
}
