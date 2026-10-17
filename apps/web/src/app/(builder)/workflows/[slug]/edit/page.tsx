import type { Metadata } from "next";
import {
  WorkflowBuilder,
  type BuilderExecution,
  type BuilderWorkflow,
} from "@/components/dashboard/builder/WorkflowBuilder";
import { getWorkflowExecutions, getWorkflows } from "@/lib/dashboard/data";
import type { TriggerType } from "@/lib/dashboard/types";

interface BuilderPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

function humanizeSlug(slug: string): string {
  const cleaned = slug.replace(/[-_]+/g, " ").trim();
  if (!cleaned) return "Workflow";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export async function generateMetadata({
  params,
}: BuilderPageProps): Promise<Metadata> {
  const { slug } = await params;
  const workflows = await getWorkflows();
  const workflow = workflows.find(
    (candidate) => candidate.slug === slug || candidate.id === slug,
  );
  const name = workflow?.name ?? humanizeSlug(slug);
  return {
    title: `${name} — Editor — Runbolt`,
    description: `Edit the ${name} workflow as a graph.`,
  };
}

/**
 * The graph builder. Baseline workflows are resolved on the server; workflows
 * created in the browser are unknown here and are resolved client-side from the
 * local layer, so this page is rendered for any slug.
 */
export default async function WorkflowBuilderPage({ params }: BuilderPageProps) {
  const { slug } = await params;
  const workflows = await getWorkflows();
  const workflow = workflows.find(
    (candidate) => candidate.slug === slug || candidate.id === slug,
  );

  let builderWorkflow: BuilderWorkflow;
  let executions: BuilderExecution[] = [];

  if (workflow) {
    builderWorkflow = {
      id: workflow.id,
      slug: workflow.slug,
      name: workflow.name,
      description: "",
      status: workflow.status,
      trigger: workflow.trigger,
      triggerDetail: null,
      steps: [],
      isLocal: false,
      version: 0,
    };
    const runs = await getWorkflowExecutions(workflow.id);
    executions = runs.map((execution) => ({
      id: execution.id,
      status: execution.status,
      trigger: execution.trigger,
      startedAt: execution.startedAt,
      durationMs: execution.durationMs,
      steps: execution.steps.map((step) => ({
        name: step.name,
        status: step.status,
        durationMs: step.durationMs,
        ...(step.detail ? { detail: step.detail } : {}),
      })),
    }));
  } else {
    builderWorkflow = {
      id: slug,
      slug,
      name: humanizeSlug(slug),
      description: "",
      status: "paused",
      trigger: "manual" as TriggerType,
      triggerDetail: null,
      steps: [],
      isLocal: true,
      version: 0,
    };
  }

  return <WorkflowBuilder workflow={builderWorkflow} executions={executions} />;
}
