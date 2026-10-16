import {
  currentTimestamp,
  formatAbsoluteTime,
  formatCount,
  formatRelativeTime,
} from "@/lib/dashboard/format";
import { getWorkflows } from "@/lib/dashboard/data";
import { WorkflowsList } from "./WorkflowsList";
import type { WorkflowItem } from "./workflows-view";

/** Server boundary: fetches workflows, formats labels, hands view-models to the table. */
export async function WorkflowsSection() {
  const workflows = await getWorkflows();
  const now = currentTimestamp();

  const items: WorkflowItem[] = workflows.map((workflow) => ({
    id: workflow.id,
    name: workflow.name,
    slug: workflow.slug,
    status: workflow.status,
    trigger: workflow.trigger,
    lastRunStatus: workflow.lastRun?.status ?? null,
    lastRunAt: workflow.lastRun?.at ?? null,
    lastRunLabel: workflow.lastRun
      ? formatRelativeTime(workflow.lastRun.at, now)
      : null,
    lastRunAbsolute: workflow.lastRun
      ? formatAbsoluteTime(workflow.lastRun.at)
      : null,
    runs: workflow.runsLast30d,
    runsLabel: formatCount(workflow.runsLast30d),
    updatedAt: workflow.updatedAt,
    updatedLabel: formatRelativeTime(workflow.updatedAt, now),
    updatedAbsolute: formatAbsoluteTime(workflow.updatedAt),
  }));

  return <WorkflowsList items={items} />;
}
