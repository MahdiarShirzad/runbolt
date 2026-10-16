import { getWorkflows } from "@/lib/dashboard/data";
import { WorkflowsStatsView } from "./WorkflowsStatsView";
import type { WorkflowStatItem } from "./workflows-view";

/** Server boundary: fetches workflows and hands lightweight rows to the stat cards. */
export async function WorkflowsStats() {
  const workflows = await getWorkflows();
  const items: WorkflowStatItem[] = workflows.map((workflow) => ({
    id: workflow.id,
    status: workflow.status,
    lastRunStatus: workflow.lastRun?.status ?? null,
  }));

  return <WorkflowsStatsView items={items} />;
}
