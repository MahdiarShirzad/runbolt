import { stepPlan } from "./execution-build";
import { findCreatedWorkflow, loadLocalState } from "./local-workflows";
import { stepsToGraph } from "./workflow-graph";
import type { WorkflowGraph } from "./workflow-graph";
import type { TriggerType } from "./types";

/**
 * Resolves the graph definition for a workflow, bridging the deterministic
 * baseline, the browser-local layer, and the legacy step-list model.
 */

export interface WorkflowGraphSource {
  id: string;
  slug: string;
  trigger: TriggerType;
  triggerDetail?: string | null;
  /** Legacy ordered steps (created workflows). */
  steps?: string[];
}

/** Derives the default graph from the legacy step plan (migration path). */
export function defaultGraphFor(source: WorkflowGraphSource): WorkflowGraph {
  const steps = source.steps && source.steps.length > 0 ? source.steps : stepPlan(source.slug);
  return stepsToGraph(steps, source.trigger, {
    slug: source.slug,
    triggerDetail: source.triggerDetail ?? null,
  });
}

/** Returns a graph already saved in this browser, if any. */
export function storedGraphFor(
  source: Pick<WorkflowGraphSource, "id" | "slug">,
): WorkflowGraph | null {
  const state = loadLocalState();
  const local = findCreatedWorkflow(state, source.id) ?? findCreatedWorkflow(state, source.slug);
  if (local?.graph) return local.graph;
  const override = state.graphOverrides[source.id];
  if (override?.graph) return override.graph;
  return null;
}

/** Best available graph: saved graph, else migrated from steps, else starter. */
export function resolveGraphFor(source: WorkflowGraphSource): WorkflowGraph {
  return storedGraphFor(source) ?? defaultGraphFor(source);
}

/** Flattens a graph back into the legacy ordered step list for other views. */
export function graphToStepList(graph: WorkflowGraph): string[] {
  return graph.nodes
    .filter((node) => !node.type.endsWith("_trigger"))
    .map((node) => node.label ?? (typeof node.config.title === "string" ? node.config.title : node.type));
}
