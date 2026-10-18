import { hashString, mulberry32 } from "./random";
import type { Execution, ExecutionStatus } from "./types";
import {
  configKeyValues,
  configString,
  findTriggerNodes,
  getOutputHandles,
  isTriggerType,
  nodeLabel,
  switchCases,
  validateGraph,
  type WorkflowEdge,
  type WorkflowGraph,
  type WorkflowNode,
  type WorkflowNodeType,
} from "./workflow-graph";

/**
 * Deterministic graph runner.
 *
 * The Runbolt execution API is not connected yet, so this module plays the
 * role of the engine for the editor's test-run and for projecting recorded
 * execution history onto the graph. It is a pure function of the graph and a
 * seed — no timers, no network — which keeps previews stable and testable.
 *
 * It honours the same rules the editor enforces: a single trigger entry point,
 * acyclic structure, branch pruning for conditions, and skipped nodes for
 * paths that are not taken.
 */

export type GraphRunStatus =
  | ExecutionStatus
  | "skipped"
  /** Reachable but never executed — the branch or run never got this far. */
  | "pending";

export interface GraphNodeRun {
  nodeId: string;
  name: string;
  type: WorkflowNodeType;
  status: GraphRunStatus;
  durationMs: number | null;
  detail?: string;
  input?: unknown;
  output?: unknown;
}

export interface GraphRunResult {
  ok: boolean;
  error?: string;
  status: ExecutionStatus;
  startedAt: string;
  durationMs: number | null;
  steps: GraphNodeRun[];
  counts: {
    success: number;
    failed: number;
    running: number;
    skipped: number;
  };
}

export interface RunOptions {
  seed?: number;
  /** Force a specific node to fail — used by tests and the "simulate error" demo. */
  failNodeId?: string;
  startedAt?: number;
}

function resolveLiteral(value: string, prng: () => number): string | number | boolean {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (trimmed.includes("{{")) {
    // Expressions cannot be resolved without execution data. Use a stable
    // pseudo-value so previews stay deterministic.
    return prng() < 0.5 ? "true" : "false";
  }
  const asNumber = Number(trimmed);
  if (trimmed !== "" && Number.isFinite(asNumber)) return asNumber;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  return trimmed;
}

function compare(
  left: string,
  operator: string,
  right: string,
  prng: () => number,
): boolean {
  const a = resolveLiteral(left, prng);
  const b = resolveLiteral(right, prng);
  switch (operator) {
    case "equals":
      return a === b;
    case "not_equals":
      return a !== b;
    case "contains":
      return String(a).includes(String(b));
    case "not_contains":
      return !String(a).includes(String(b));
    case "gt":
      return Number(a) > Number(b);
    case "gte":
      return Number(a) >= Number(b);
    case "lt":
      return Number(a) < Number(b);
    case "lte":
      return Number(a) <= Number(b);
    case "exists":
      return a !== "";
    case "empty":
      return a === "";
    default:
      return true;
  }
}

function chooseHandle(node: WorkflowNode, prng: () => number): string | null {
  const handles = getOutputHandles(node);
  if (handles.length === 0) return null;
  if (handles.length === 1) return handles[0]!.id;

  if (node.type === "if_else" || node.type === "filter") {
    const result = compare(
      configString(node, "left"),
      configString(node, "operator") || "equals",
      configString(node, "right"),
      prng,
    );
    return result ? "true" : "false";
  }

  if (node.type === "switch") {
    const cases = switchCases(node);
    if (cases.length === 0) return "default";
    const roll = prng();
    if (roll < 0.7) return "case:0";
    const index = Math.floor((roll - 0.7) / 0.3 * cases.length);
    return `case:${Math.min(index, cases.length - 1)}`;
  }

  return handles[0]!.id;
}

function sampleInput(node: WorkflowNode): unknown {
  if (isTriggerType(node.type)) {
    return { trigger: node.type, payload: { id: "evt_1", at: new Date(0).toISOString() } };
  }
  return { from: "previous step" };
}

function sampleOutput(node: WorkflowNode, durationMs: number): unknown {
  switch (node.type) {
    case "webhook_trigger":
    case "api_trigger":
      return { status: 202, received: true };
    case "manual_trigger":
      return { started: "manual" };
    case "schedule_trigger":
      return { scheduledFor: new Date(0).toISOString() };
    case "http_request":
      return {
        status: 200,
        method: configString(node, "method") || "GET",
        url: configString(node, "url"),
        body: {},
      };
    case "send_email":
      return { sent: true, to: configString(node, "to") };
    case "send_notification":
      return { delivered: true, channel: configString(node, "channel") };
    case "integration_action":
      return { ok: true, operation: configString(node, "operation") };
    case "data_mapping":
      return { mapped: true };
    case "set_variables":
      return { variables: configKeyValues(node, "variables").length };
    case "merge":
      return { merged: true, mode: configString(node, "mode") };
    case "filter":
    case "if_else":
      return { evaluated: true };
    case "switch":
      return { routed: true };
    case "delay":
      return { waitedMs: durationMs };
    case "log":
      return { logged: configString(node, "message") };
    default:
      return { ok: true };
  }
}

function topoOrder(graph: WorkflowGraph): WorkflowNode[] {
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  for (const node of graph.nodes) {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  }
  for (const edge of graph.edges) {
    if (!adjacency.has(edge.source) || !adjacency.has(edge.target)) continue;
    adjacency.get(edge.source)!.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }
  const queue = graph.nodes.filter((node) => inDegree.get(node.id) === 0).map((n) => n.id);
  const order: WorkflowNode[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = byId.get(id);
    if (node) order.push(node);
    for (const next of adjacency.get(id) ?? []) {
      const degree = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, degree);
      if (degree === 0) queue.push(next);
    }
  }
  return order;
}

export function runWorkflowGraph(
  graph: WorkflowGraph,
  options: RunOptions = {},
): GraphRunResult {
  const validation = validateGraph(graph);
  const startedAtMs = options.startedAt ?? Date.now();

  if (graph.nodes.length === 0) {
    return emptyResult("Add at least one node before running.", startedAtMs);
  }
  if (!validation.saveable) {
    const firstError = validation.issues.find((issue) => issue.severity === "error");
    return emptyResult(firstError?.message ?? "Fix the graph errors before running.", startedAtMs);
  }
  const blockers = validation.issues.filter((issue) =>
    ["no-trigger", "multiple-triggers", "no-entry-edge", "unreachable-node", "missing-config", "unsupported-node"].includes(
      issue.code,
    ),
  );
  if (blockers.length > 0) {
    return emptyResult(blockers[0]!.message, startedAtMs);
  }

  const entry = findTriggerNodes(graph)[0]!;
  const prng = mulberry32(options.seed ?? hashString(entry.id));

  // Walk in topological order. As each active node is reached, choose its
  // output handle and activate only the edges leaving that handle — this is
  // what prunes unselected branches. A node's handle must be chosen after it
  // becomes active, so propagation happens inline on the topo walk.
  const active = new Set<string>([entry.id]);
  const order = topoOrder(graph);
  const outgoing = new Map<string, WorkflowEdge[]>();
  for (const edge of graph.edges) {
    const list = outgoing.get(edge.source) ?? [];
    list.push(edge);
    outgoing.set(edge.source, list);
  }

  for (const node of order) {
    if (!active.has(node.id)) continue;
    const chosen = chooseHandle(node, prng);
    if (chosen === null) continue;
    for (const edge of outgoing.get(node.id) ?? []) {
      const sourceHandle = edge.sourceHandle ?? "out";
      if (sourceHandle === chosen) active.add(edge.target);
    }
  }

  const steps: GraphNodeRun[] = [];
  const counts = { success: 0, failed: 0, running: 0, skipped: 0 };

  for (const node of order) {
    const isActive = active.has(node.id);
    const baseDuration = 40 + Math.floor(prng() * 600);

    if (!isActive) {
      counts.skipped += 1;
      steps.push({
        nodeId: node.id,
        name: nodeLabel(node),
        type: node.type,
        status: "skipped",
        durationMs: null,
      });
      continue;
    }

    if (options.failNodeId === node.id) {
      counts.failed += 1;
      steps.push({
        nodeId: node.id,
        name: nodeLabel(node),
        type: node.type,
        status: "failed",
        durationMs: baseDuration,
        detail: "Simulated failure — the upstream API returned HTTP 502.",
        input: sampleInput(node),
      });
      continue;
    }

    counts.success += 1;
    steps.push({
      nodeId: node.id,
      name: nodeLabel(node),
      type: node.type,
      status: "success",
      durationMs: baseDuration,
      input: sampleInput(node),
      output: sampleOutput(node, baseDuration),
    });
  }

  const totalDuration = steps.reduce(
    (sum, step) => sum + (step.durationMs ?? 0),
    0,
  );
  const failed = counts.failed > 0;

  return {
    ok: true,
    status: failed ? "failed" : "success",
    startedAt: new Date(startedAtMs).toISOString(),
    durationMs: totalDuration,
    steps,
    counts,
  };
}

function emptyResult(error: string, startedAtMs: number): GraphRunResult {
  return {
    ok: false,
    error,
    status: "failed",
    startedAt: new Date(startedAtMs).toISOString(),
    durationMs: null,
    steps: [],
    counts: { success: 0, failed: 0, running: 0, skipped: 0 },
  };
}

/* ------------------------------------------------------------------ */
/* Projecting recorded executions onto the graph                      */
/* ------------------------------------------------------------------ */

export interface ExecutionNodeStatus {
  nodeId: string;
  status: GraphRunStatus;
  durationMs: number | null;
  detail?: string;
}

/**
 * Maps a recorded execution's ordered steps onto graph nodes. Legacy steps
 * carry their original name in `config.sourceStep`; newer nodes are matched by
 * label, then by order. Unmatched nodes stay unspecified.
 */
export function mapExecutionToGraph(
  graph: WorkflowGraph,
  execution: Execution,
): ExecutionNodeStatus[] {
  const bySourceStep = new Map<string, string>();
  const byLabel = new Map<string, string>();
  for (const node of graph.nodes) {
    const sourceStep = node.config.sourceStep;
    if (typeof sourceStep === "string") bySourceStep.set(sourceStep, node.id);
    byLabel.set(nodeLabel(node), node.id);
  }

  const used = new Set<string>();
  const result: ExecutionNodeStatus[] = [];
  const fallback = graph.nodes.filter((node) => !isTriggerType(node.type));

  execution.steps.forEach((step, index) => {
    let nodeId = bySourceStep.get(step.name) ?? byLabel.get(step.name);
    if (!nodeId) {
      const candidate = fallback[index];
      if (candidate && !used.has(candidate.id)) nodeId = candidate.id;
    }
    if (!nodeId || used.has(nodeId)) return;
    used.add(nodeId);
    result.push({
      nodeId,
      status: step.status,
      durationMs: step.durationMs,
      ...(step.detail ? { detail: step.detail } : {}),
    });
  });

  return result;
}
