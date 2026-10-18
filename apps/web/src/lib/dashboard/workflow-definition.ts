import { nodeLabel } from "./workflow-graph";
import type { WorkflowGraph } from "./workflow-graph";
import type { WorkflowStatus } from "./types";

/**
 * The application-level workflow representation — the contract the editor
 * renders and a future backend would accept. This is deliberately decoupled
 * from the graph library's internal node/edge objects.
 */

export interface WorkflowDefinition {
  /** Schema version of this document, bumped when the shape changes. */
  version: 1;
  name: string;
  description: string;
  status: WorkflowStatus;
  nodes: WorkflowDefinitionNode[];
  edges: WorkflowDefinitionEdge[];
}

export interface WorkflowDefinitionNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface WorkflowDefinitionEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

/** Config keys that may hold a secret; their values are redacted in output. */
const SENSITIVE_KEYS = new Set(["secret", "password", "token", "apiKey", "api_key"]);

const REDACTED = "••••••";

function redactConfig(config: Record<string, unknown>): Record<string, unknown> {
  const entries = Object.entries(config).map(([key, value]) => {
    if (SENSITIVE_KEYS.has(key) && typeof value === "string" && value.length > 0) {
      return [key, REDACTED] as const;
    }
    return [key, value] as const;
  });
  return Object.fromEntries(entries);
}

export function buildWorkflowDefinition(input: {
  name: string;
  description: string;
  status: WorkflowStatus;
  graph: WorkflowGraph;
}): WorkflowDefinition {
  return {
    version: 1,
    name: input.name,
    description: input.description,
    status: input.status,
    nodes: input.graph.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      name: nodeLabel(node),
      position: { x: node.position.x, y: node.position.y },
      config: redactConfig(node.config),
    })),
    edges: input.graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? "out",
      targetHandle: edge.targetHandle ?? "in",
    })),
  };
}

export function serializeWorkflowDefinition(definition: WorkflowDefinition): string {
  return JSON.stringify(definition, null, 2);
}
