import { MarkerType } from "@xyflow/react";
import type { Edge, EdgeChange, Node, NodeChange, XYPosition } from "@xyflow/react";
import {
  CATEGORY_STYLES,
  getOutputHandles,
  isTriggerType,
  nodeLabel,
  NODE_DEFINITIONS,
  type WorkflowEdge,
  type WorkflowGraph,
  type WorkflowNode,
  type WorkflowNodeCategory,
} from "@/lib/dashboard/workflow-graph";
import type { GraphRunStatus } from "@/lib/dashboard/workflow-run";

/** Data attached to each React Flow node — plain data plus render hints. */
export interface BuilderNodeData extends Record<string, unknown> {
  node: WorkflowNode;
  label: string;
  category: WorkflowNodeCategory;
  executable: boolean;
  isTrigger: boolean;
  runStatus?: GraphRunStatus;
  runDetail?: string;
  hasIssue: boolean;
}

export type BuilderNode = Node<BuilderNodeData, "runbolt">;
export type BuilderEdge = Edge;

export interface FlowOverlay {
  statuses?: Record<string, GraphRunStatus>;
  details?: Record<string, string>;
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
  issueNodeIds?: Set<string>;
  issueEdgeIds?: Set<string>;
}

export function toFlowNodes(graph: WorkflowGraph, overlay: FlowOverlay = {}): BuilderNode[] {
  return graph.nodes.map((node) => ({
    id: node.id,
    type: "runbolt",
    position: node.position,
    selected: node.id === overlay.selectedNodeId,
    data: {
      node,
      label: nodeLabel(node),
      category: categoryOf(node),
      executable: isExecutable(node),
      isTrigger: isTriggerType(node.type),
      runStatus: overlay.statuses?.[node.id],
      runDetail: overlay.details?.[node.id],
      hasIssue: overlay.issueNodeIds?.has(node.id) ?? false,
    },
  }));
}

export function toFlowEdges(graph: WorkflowGraph, overlay: FlowOverlay = {}): BuilderEdge[] {
  const selected = overlay.selectedEdgeId;
  return graph.edges.map((edge) => {
    const sourceStatus = overlay.statuses?.[edge.source];
    const targetStatus = overlay.statuses?.[edge.target];
    const skipped = sourceStatus === "skipped" || targetStatus === "skipped";
    const failed = sourceStatus === "failed" || targetStatus === "failed";
    const running = sourceStatus === "running" || targetStatus === "running";

    const stroke = failed
      ? "#f2614e"
      : running
        ? "#c7f04e"
        : skipped
          ? "#47536e"
          : edge.id === selected
            ? "#c7f04e"
            : "#35435c";

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? "out",
      targetHandle: edge.targetHandle ?? "in",
      type: "smoothstep",
      animated: running,
      selected: edge.id === selected,
      label: edge.label,
      markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 16, height: 16 },
      style: {
        stroke,
        strokeWidth: edge.id === selected ? 2.4 : 1.8,
        strokeDasharray: skipped && !failed ? "5 5" : undefined,
      },
      labelStyle: { fill: "#8c97ab", fontSize: 11 },
      labelBgStyle: { fill: "#10151d" },
    };
  });
}

export function categoryOf(node: WorkflowNode): WorkflowNodeCategory {
  // Local import avoidance: category is defined on the registry keyed by type.
  return NODE_CATEGORIES[node.type] ?? "action";
}

export function categoryStyle(node: WorkflowNode) {
  return CATEGORY_STYLES[categoryOf(node)];
}

const NODE_CATEGORIES: Record<string, WorkflowNodeCategory> = {
  manual_trigger: "trigger",
  webhook_trigger: "trigger",
  schedule_trigger: "trigger",
  api_trigger: "trigger",
  http_request: "integration",
  integration_action: "integration",
  action: "action",
  data_mapping: "transform",
  filter: "transform",
  if_else: "condition",
  switch: "condition",
  loop: "condition",
  delay: "utility",
  log: "utility",
};

export function isExecutable(node: WorkflowNode): boolean {
  return NODE_DEFINITIONS[node.type]?.executable ?? false;
}

/** Applies React Flow node changes (position/remove only) to a graph. */
export function applyNodeGraphChanges(
  graph: WorkflowGraph,
  changes: NodeChange<BuilderNode>[],
): WorkflowGraph {
  const removed = new Set<string>();
  const positions = new Map<string, XYPosition>();

  for (const change of changes) {
    if (change.type === "remove") {
      removed.add(change.id);
    } else if (change.type === "position" && change.position) {
      positions.set(change.id, change.position);
    }
  }

  let nodes = graph.nodes;
  let edges = graph.edges;

  if (positions.size > 0) {
    nodes = nodes.map((node) =>
      positions.has(node.id) ? { ...node, position: positions.get(node.id)! } : node,
    );
  }
  if (removed.size > 0) {
    nodes = nodes.filter((node) => !removed.has(node.id));
    edges = edges.filter((edge) => !removed.has(edge.source) && !removed.has(edge.target));
  }

  return { nodes, edges };
}

/** Applies React Flow edge changes (remove only) to a graph. */
export function applyEdgeGraphChanges(
  graph: WorkflowGraph,
  changes: EdgeChange<BuilderEdge>[],
): WorkflowGraph {
  const removed = new Set<string>();
  for (const change of changes) {
    if (change.type === "remove") removed.add(change.id);
  }
  if (removed.size === 0) return graph;
  return { ...graph, edges: graph.edges.filter((edge) => !removed.has(edge.id)) };
}

export function selectionFromNodeChanges(
  changes: NodeChange<BuilderNode>[],
): string | null | undefined {
  let selected: string | null | undefined;
  for (const change of changes) {
    if (change.type === "select" && change.selected) selected = change.id;
  }
  if (selected !== undefined) return selected;
  const deselected = changes.some((change) => change.type === "select" && !change.selected);
  if (deselected) {
    // Return null only if nothing else is selected — React Flow sends one change per node.
    return changes.some((change) => change.type === "select" && change.selected) ? undefined : null;
  }
  return undefined;
}

export function outputHandleCount(node: WorkflowNode): number {
  return getOutputHandles(node).length;
}

export function edgeLabel(edge: WorkflowEdge): string | undefined {
  return edge.label;
}
