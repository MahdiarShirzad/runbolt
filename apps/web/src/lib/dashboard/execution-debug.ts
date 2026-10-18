import { stepPlan } from "./execution-build";
import { hashString, mulberry32 } from "./random";
import type { Execution, ExecutionLogEntry, LogLevel } from "./types";
import {
  createEdge,
  createNode,
  isTriggerType,
  nodeLabel,
  type WorkflowGraph,
  type WorkflowNode,
  type WorkflowNodeType,
} from "./workflow-graph";
import { defaultGraphFor } from "./workflow-source";

/**
 * Execution debugger data layer.
 *
 * The Runbolt execution API is not connected yet. This module turns a recorded
 * `Execution` into everything the debugger renders — the workflow graph, one
 * `NodeExecution` per node (status, timing, attempt, input/output, error), the
 * derived counts, and the log stream — all as pure functions of the run so the
 * graph, summary, timeline, logs and inspector can never disagree.
 *
 * TODO(api): once the endpoints exist, replace the projections below with
 *   GET /v1/executions/:id            → the `Execution` record
 *   GET /v1/executions/:id/graph      → node/edge statuses
 *   GET /v1/executions/:id/nodes/:id  → input/output/error per node
 *   GET /v1/executions/:id/logs       → log stream
 */

export type NodeExecutionStatus =
  | "success"
  | "failed"
  | "running"
  | "skipped"
  | "pending";

export interface NodeAttempt {
  attempt: number;
  status: NodeExecutionStatus;
  durationMs: number | null;
  errorMessage: string | null;
}

export type ExecutionErrorCategory =
  | "http_error"
  | "timeout"
  | "auth_error"
  | "rate_limit"
  | "validation_error"
  | "runtime_error";

export interface NodeExecutionError {
  category: ExecutionErrorCategory;
  categoryLabel: string;
  message: string;
  stack: string[];
  suggestions: string[];
}

export interface NodeExecution {
  nodeId: string;
  name: string;
  type: WorkflowNodeType;
  status: NodeExecutionStatus;
  attempt: number;
  attempts: NodeAttempt[];
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  input: unknown;
  output: unknown;
  error: NodeExecutionError | null;
  isTrigger: boolean;
}

export interface ExecutionDebugCounts {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  running: number;
  pending: number;
}

export interface ExecutionDebug {
  graph: WorkflowGraph;
  nodes: NodeExecution[];
  counts: ExecutionDebugCounts;
  failedNode: NodeExecution | null;
  errorSummary: string | null;
  durationMs: number | null;
}

/* ------------------------------------------------------------------ */
/* Graph selection                                                     */
/* ------------------------------------------------------------------ */

const COLUMN = 268;
const ROW = 138;

function graphNode(
  type: WorkflowNodeType,
  id: string,
  label: string,
  column: number,
  row: number,
  config: Record<string, unknown> = {},
): WorkflowNode {
  return createNode(type, { x: column * COLUMN, y: 60 + row * ROW }, {
    id,
    label,
    config,
  });
}

function actionNode(
  id: string,
  title: string,
  sourceStep: string,
  column: number,
  row: number,
): WorkflowNode {
  return graphNode("action", id, title, column, row, { title, sourceStep });
}

/**
 * Curated graphs for a couple of sample workflows so the debugger can show
 * conditional branches (and the skipped path a branch leaves behind). Every
 * other workflow uses the linear graph migrated from its step plan.
 */
const BRANCH_GRAPH_BUILDERS: Record<string, () => WorkflowGraph> = {
  "order-fulfillment": () => {
    const trigger = graphNode("webhook_trigger", "webhook_trigger_1", "Webhook trigger", 0, 0, {
      path: "order-fulfillment",
      method: "POST",
    });
    const receive = actionNode("action_1", "Receive order", "receive-order", 1, 0);
    const charge = actionNode("action_2", "Charge card", "charge-card", 2, 0);
    const paid = graphNode("if_else", "if_else_1", "Payment captured?", 3, 0, {
      left: "{{ steps.charge-card.status }}",
      operator: "equals",
      right: "captured",
    });
    const reserve = actionNode("action_3", "Reserve inventory", "reserve-inventory", 4, -1);
    const print = actionNode("action_4", "Print label", "print-label", 5, -1);
    const notify = actionNode("action_5", "Notify customer", "notify-customer", 6, -1);
    const declined = graphNode("log", "log_1", "Payment declined — alert ops", 4, 1, {
      message: "Order payment declined; ops notified.",
      level: "warn",
    });
    return {
      nodes: [trigger, receive, charge, paid, reserve, print, notify, declined],
      edges: [
        createEdge(trigger.id, receive.id, { id: "edge_1" }),
        createEdge(receive.id, charge.id, { id: "edge_2" }),
        createEdge(charge.id, paid.id, { id: "edge_3" }),
        createEdge(paid.id, reserve.id, { id: "edge_4", sourceHandle: "true" }),
        createEdge(reserve.id, print.id, { id: "edge_5" }),
        createEdge(print.id, notify.id, { id: "edge_6" }),
        createEdge(paid.id, declined.id, { id: "edge_7", sourceHandle: "false" }),
      ],
    };
  },
  "nightly-invoice-export": () => {
    const trigger = graphNode("schedule_trigger", "schedule_trigger_1", "Schedule trigger", 0, 0, {
      preset: "Daily at 09:00 UTC",
      timezone: "UTC",
    });
    const query = actionNode("action_1", "Query invoices", "query-invoices", 1, 0);
    const build = actionNode("action_2", "Build CSV", "build-csv", 2, 0);
    const hasRows = graphNode("if_else", "if_else_1", "Any invoices?", 3, 0, {
      left: "{{ steps.build-csv.rowCount }}",
      operator: "gt",
      right: "0",
    });
    const upload = actionNode("action_3", "Upload to S3", "upload-to-s3", 4, -1);
    const recap = actionNode("action_4", "Slack recap", "slack-recap", 5, -1);
    const empty = graphNode("log", "log_1", "No invoices to export", 4, 1, {
      message: "No invoices found for this period; skipping export.",
      level: "info",
    });
    return {
      nodes: [trigger, query, build, hasRows, upload, recap, empty],
      edges: [
        createEdge(trigger.id, query.id, { id: "edge_1" }),
        createEdge(query.id, build.id, { id: "edge_2" }),
        createEdge(build.id, hasRows.id, { id: "edge_3" }),
        createEdge(hasRows.id, upload.id, { id: "edge_4", sourceHandle: "true" }),
        createEdge(upload.id, recap.id, { id: "edge_5" }),
        createEdge(hasRows.id, empty.id, { id: "edge_6", sourceHandle: "false" }),
      ],
    };
  },
};

/** The workflow slug an execution belongs to (`wf_order-fulfillment` → `order-fulfillment`). */
export function workflowSlugFor(execution: Execution): string {
  const id = execution.workflowId;
  if (id.startsWith("wf_")) return id.slice(3);
  if (id.startsWith("local_")) {
    return id.replace(/^local_/, "").replace(/_[a-z0-9]+$/, "");
  }
  return id;
}

/** The graph definition this execution ran against. */
export function executionGraphFor(execution: Execution): WorkflowGraph {
  const slug = workflowSlugFor(execution);
  const curated = BRANCH_GRAPH_BUILDERS[slug];
  if (curated) return curated();
  return defaultGraphFor({ id: execution.workflowId, slug, trigger: execution.trigger });
}

/* ------------------------------------------------------------------ */
/* Node execution projection                                           */
/* ------------------------------------------------------------------ */

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

function predecessorsOf(graph: WorkflowGraph): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const list = map.get(edge.target) ?? [];
    list.push(edge.source);
    map.set(edge.target, list);
  }
  return map;
}

const CONTROL_TYPES = new Set<WorkflowNodeType>(["if_else", "filter", "switch", "merge"]);

function errorCategory(message: string): ExecutionErrorCategory {
  const text = message.toLowerCase();
  if (/timeout|timed out/.test(text)) return "timeout";
  if (/\b(401|403)\b|unauthor|forbidden|auth|credential/.test(text)) return "auth_error";
  if (/\b429\b|rate ?limit|too many requests/.test(text)) return "rate_limit";
  if (/validat|schema|required|missing field|typeerror|parse/.test(text))
    return "validation_error";
  if (/http|status ?[45]\d\d|\b(500|502|503|504)\b/.test(text)) return "http_error";
  return "runtime_error";
}

const ERROR_LABELS: Record<ExecutionErrorCategory, string> = {
  http_error: "Upstream HTTP error",
  timeout: "Timeout",
  auth_error: "Authentication error",
  rate_limit: "Rate limited",
  validation_error: "Validation error",
  runtime_error: "Runtime error",
};

const ERROR_SUGGESTIONS: Record<ExecutionErrorCategory, string[]> = {
  http_error: [
    "Check the upstream service's status page — the error came from its response.",
    "Re-run the execution to see whether the failure is transient.",
    "Lower the retry count if the endpoint consistently returns 5xx responses.",
    "Verify the request URL and method in this node's configuration.",
  ],
  timeout: [
    "Increase the node's timeout in its configuration.",
    "Confirm the upstream endpoint responds within the timeout budget.",
    "Split the request into smaller batches if the payload is large.",
  ],
  auth_error: [
    "Confirm the attached credential is still valid and not revoked.",
    "Re-connect the credential if the token has expired.",
    "Check that the credential has the scopes this operation requires.",
  ],
  rate_limit: [
    "Add a delay or reduce the batch size before this node.",
    "Check the provider's rate-limit headers to size requests correctly.",
    "Spread the work across a longer schedule.",
  ],
  validation_error: [
    "Compare the failing input against the node's expected schema.",
    "Confirm the previous step produces the fields this node references.",
    "Guard the node with a filter so malformed payloads are routed out.",
  ],
  runtime_error: [
    "Open the Input tab to review the payload recorded at failure time.",
    "Verify expressions on this node reference fields that actually exist.",
    "Re-run the execution to confirm the failure is reproducible.",
  ],
};

function buildError(
  message: string,
  node: WorkflowNode,
  execution: Execution,
): NodeExecutionError {
  const category = errorCategory(message);
  return {
    category,
    categoryLabel: ERROR_LABELS[category],
    message,
    stack: [
      `at ${node.type} (nodes/${node.id}.ts:1:1)`,
      `at runNode (engine/execute.ts:214:11)`,
      `at processExecution (engine/runner.ts:88:9)`,
      `at run_${execution.id.replace(/[^a-z0-9]/gi, "").slice(0, 12)} (engine/worker.ts:41:7)`,
    ],
    suggestions: ERROR_SUGGESTIONS[category],
  };
}

function triggerInput(node: WorkflowNode, execution: Execution): unknown {
  switch (execution.trigger) {
    case "webhook":
      return {
        method: "POST",
        path: `/hooks/${String(node.config.path || workflowSlugFor(execution))}`,
        headers: { "content-type": "application/json", "x-runbolt-event": "evt_8f21c4" },
        body: { id: "evt_8f21c4", at: execution.startedAt },
      };
    case "schedule":
      return { scheduledFor: execution.startedAt, timezone: "UTC" };
    case "api":
      return { method: "POST", invokedBy: "api_key:prod" };
    default:
      return { startedBy: "alex@acmelabs.dev" };
  }
}

/** Deterministic, believable output for a node type — never fabricated for failures. */
function sampleOutput(
  node: WorkflowNode,
  execution: Execution,
  durationMs: number | null,
): unknown {
  const slug = workflowSlugFor(execution);
  switch (node.type) {
    case "webhook_trigger":
    case "api_trigger":
      return { accepted: true, statusCode: 202 };
    case "manual_trigger":
      return { started: "manual" };
    case "schedule_trigger":
      return { scheduledFor: execution.startedAt };
    case "http_request":
      return {
        statusCode: 200,
        durationMs: durationMs ?? 0,
        body: { ok: true },
      };
    case "send_email":
      return { messageId: `msg_${hashString(node.id).toString(16)}`, accepted: 1 };
    case "send_notification":
      return { delivered: true, channel: "email" };
    case "integration_action":
      return { ok: true, updated: 1 };
    case "data_mapping":
      return { rows: 3, fields: ["id", "status", "total"] };
    case "set_variables":
      return { variables: 2 };
    case "merge":
      return { merged: 2 };
    case "filter":
    case "if_else":
      return { result: true };
    case "switch":
      return { matched: "case:0" };
    case "delay":
      return { waitedMs: durationMs ?? 0 };
    case "log":
      return null;
    default:
      return {
        step: nodeLabel(node),
        workflow: slug,
        ok: true,
      };
  }
}

function buildLogLines(
  node: NodeExecution,
  execution: Execution,
  status: NodeExecutionStatus,
  durationMs: number | null,
): { level: LogLevel; message: string; metadata?: Record<string, unknown> }[] {
  const label = node.name;
  if (node.isTrigger) {
    return [
      {
        level: "info",
        message: `Received ${execution.trigger} trigger for ${label}`,
        metadata: { trigger: execution.trigger },
      },
    ];
  }
  if (status === "failed") {
    return [{ level: "error", message: `${label} failed` }];
  }
  if (status === "skipped" || status === "pending") {
    return [{ level: "info", message: `${label} was not executed` }];
  }
  const lines: { level: LogLevel; message: string; metadata?: Record<string, unknown> }[] = [
    {
      level: "info",
      message: `${label} completed`,
      metadata: durationMs == null ? undefined : { durationMs },
    },
  ];
  if (node.type === "http_request") {
    lines.unshift({ level: "info", message: `${label} responded with HTTP 200` });
  }
  if (node.type === "if_else" || node.type === "filter") {
    lines.push({ level: "info", message: "Condition evaluated to true" });
  }
  return lines;
}

function resolveNodeStatus(
  node: WorkflowNode,
  execution: Execution,
  matchedStepIndex: number | null,
  failedStepIndex: number | null,
  predecessorStatuses: NodeExecutionStatus[],
): NodeExecutionStatus {
  if (matchedStepIndex != null) {
    const step = execution.steps[matchedStepIndex]!;
    if (failedStepIndex != null && matchedStepIndex > failedStepIndex) return "skipped";
    switch (step.status) {
      case "success":
        return "success";
      case "failed":
        return "failed";
      case "running":
        return "running";
      case "cancelled":
        return "skipped";
      default:
        return "pending";
    }
  }

  if (isTriggerType(node.type)) {
    if (execution.status === "queued") return "pending";
    if (execution.status === "running" && execution.steps.length === 0) return "running";
    return "success";
  }

  const anyFailed = predecessorStatuses.includes("failed");
  const allReached =
    predecessorStatuses.length > 0 &&
    predecessorStatuses.every(
      (status) => status === "success" || status === "running",
    );

  if (CONTROL_TYPES.has(node.type)) {
    if (anyFailed) return "skipped";
    if (!allReached) return "pending";
    return execution.status === "running" ? "running" : "success";
  }

  // No recorded step and not a control node: a branch that was not taken.
  return execution.status === "running" ? "pending" : "skipped";
}

/**
 * Projects a recorded execution onto its graph and derives the debug view.
 * Pure and deterministic — identical inputs always yield identical output.
 */
export function buildExecutionDebug(execution: Execution): ExecutionDebug {
  const graph = executionGraphFor(execution);
  const order = topoOrder(graph);
  const predecessors = predecessorsOf(graph);
  const matchedStepIndex = new Map<string, number>();
  const stepNames = stepPlan(workflowSlugFor(execution));
  const stepIndexByRaw = new Map(stepNames.map((name, index) => [name, index]));

  const foundFailedIndex = execution.steps.findIndex((step) => step.status === "failed");
  const failedStepIndex = foundFailedIndex >= 0 ? foundFailedIndex : null;
  const rand = mulberry32(hashString(execution.id) ^ 0x5d2a);

  const statusById = new Map<string, NodeExecutionStatus>();

  for (const node of order) {
    const sourceStep = node.config.sourceStep;
    let index: number | null = null;
    if (typeof sourceStep === "string" && stepIndexByRaw.has(sourceStep)) {
      index = stepIndexByRaw.get(sourceStep)!;
    } else {
      const byLabel = execution.steps.findIndex((step) => step.name === nodeLabel(node));
      if (byLabel >= 0) index = byLabel;
    }
    if (index != null && index < execution.steps.length) {
      matchedStepIndex.set(node.id, index);
    } else {
      index = null;
    }

    const predecessorStatuses = (predecessors.get(node.id) ?? [])
      .map((id) => statusById.get(id))
      .filter((status): status is NodeExecutionStatus => status != null);

    statusById.set(
      node.id,
      resolveNodeStatus(node, execution, index, failedStepIndex, predecessorStatuses),
    );
  }

  // Timings: distribute the recorded duration across executed nodes.
  const executedNodes = order.filter((node) => {
    const status = statusById.get(node.id);
    return status === "success" || status === "failed" || status === "running";
  });
  const weights = executedNodes.map((node) => {
    const index = matchedStepIndex.get(node.id);
    const stepDuration = index != null ? execution.steps[index]!.durationMs : null;
    return stepDuration != null && stepDuration > 0 ? stepDuration : 120 + rand() * 380;
  });
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  const totalDuration =
    execution.durationMs ?? (execution.status === "running" ? Math.round(weightSum) : 0);
  const scale = totalDuration > 0 ? totalDuration / weightSum : 1;

  const startedMs = new Date(execution.startedAt).getTime();
  let cursor = startedMs;
  const timingById = new Map<
    string,
    { startedAt: string; finishedAt: string | null; durationMs: number | null }
  >();

  executedNodes.forEach((node, i) => {
    const status = statusById.get(node.id)!;
    if (status === "running") {
      timingById.set(node.id, {
        startedAt: new Date(cursor).toISOString(),
        finishedAt: null,
        durationMs: null,
      });
      return;
    }
    const duration = Math.max(6, Math.round(weights[i]! * scale));
    timingById.set(node.id, {
      startedAt: new Date(cursor).toISOString(),
      finishedAt: new Date(cursor + duration).toISOString(),
      durationMs: duration,
    });
    cursor += duration;
  });

  const failedNodeId =
    failedStepIndex != null
      ? [...matchedStepIndex.entries()].find(([, index]) => index === failedStepIndex)?.[0] ??
        null
      : null;
  const attemptTotal = execution.attempt ?? 1;
  const retriedNodeId =
    failedNodeId ??
    (attemptTotal > 1
      ? [...order].reverse().find((node) => {
          const status = statusById.get(node.id);
          return status === "success" && !isTriggerType(node.type);
        })?.id ?? null
      : null);

  const nodes: NodeExecution[] = order.map((node, index) => {
    const status = statusById.get(node.id)!;
    const timing = timingById.get(node.id) ?? null;
    const stepIdx = matchedStepIndex.get(node.id);
    const step = stepIdx != null ? execution.steps[stepIdx] : null;
    const failureMessage =
      status === "failed" ? step?.detail ?? "Node failed during execution." : null;
    const error =
      status === "failed" && failureMessage
        ? buildError(failureMessage, node, execution)
        : null;

    const attempt = node.id === retriedNodeId ? attemptTotal : 1;
    const attempts: NodeAttempt[] = [];
    if (node.id === retriedNodeId && attemptTotal > 1) {
      for (let a = 1; a < attemptTotal; a++) {
        attempts.push({
          attempt: a,
          status: "failed",
          durationMs: 120 + Math.round(rand() * 900),
          errorMessage: failureMessage ?? "Attempt failed; retrying.",
        });
      }
      attempts.push({
        attempt: attemptTotal,
        status,
        durationMs: timing?.durationMs ?? null,
        errorMessage: failureMessage,
      });
    } else {
      attempts.push({
        attempt: 1,
        status,
        durationMs: timing?.durationMs ?? null,
        errorMessage: failureMessage,
      });
    }

    let output: unknown = null;
    if (status === "success") {
      output = sampleOutput(node, execution, timing?.durationMs ?? null);
    }

    const input =
      isTriggerType(node.type) || index === 0
        ? triggerInput(node, execution)
        : {
            nodeId: predecessors.get(node.id)?.[0] ?? null,
            data:
              status === "success"
                ? sampleOutput(node, execution, timing?.durationMs ?? null)
                : { from: nodeLabel(order[Math.max(0, index - 1)]!) },
          };

    return {
      nodeId: node.id,
      name: nodeLabel(node),
      type: node.type,
      status,
      attempt,
      attempts,
      startedAt: timing?.startedAt ?? null,
      finishedAt: timing?.finishedAt ?? null,
      durationMs: timing?.durationMs ?? null,
      input,
      output,
      error,
      isTrigger: isTriggerType(node.type),
    };
  });

  const counts: ExecutionDebugCounts = {
    total: nodes.length,
    success: nodes.filter((node) => node.status === "success").length,
    failed: nodes.filter((node) => node.status === "failed").length,
    skipped: nodes.filter((node) => node.status === "skipped").length,
    running: nodes.filter((node) => node.status === "running").length,
    pending: nodes.filter((node) => node.status === "pending").length,
  };

  const failedNode = nodes.find((node) => node.status === "failed") ?? null;

  return {
    graph,
    nodes,
    counts,
    failedNode,
    errorSummary: failedNode?.error?.message ?? null,
    durationMs: execution.durationMs,
  };
}

/* ------------------------------------------------------------------ */
/* Log stream                                                          */
/* ------------------------------------------------------------------ */

/**
 * Deterministic log stream for an execution, derived from the same node
 * projections the debugger renders. Timestamps follow node timings.
 */
export function buildExecutionLogs(
  execution: Execution,
  debug: ExecutionDebug = buildExecutionDebug(execution),
): ExecutionLogEntry[] {
  const entries: ExecutionLogEntry[] = [];
  let seq = 0;
  const startedMs = new Date(execution.startedAt).getTime();
  let fallbackMs = startedMs;

  const push = (
    atMs: number,
    level: LogLevel,
    source: string,
    message: string,
    nodeId: string,
    metadata?: Record<string, unknown>,
  ) => {
    entries.push({
      id: `${execution.id}.log_${seq++}`,
      at: new Date(atMs).toISOString(),
      level,
      source,
      message,
      nodeId,
      ...(metadata ? { metadata } : {}),
    });
  };

  push(
    startedMs,
    "info",
    "runner",
    `Execution started (${execution.trigger} trigger)`,
    "runner",
    { attempt: execution.attempt ?? 1 },
  );

  for (const node of debug.nodes) {
    const atMs = node.startedAt ? new Date(node.startedAt).getTime() : fallbackMs;
    for (const line of buildLogLines(node, execution, node.status, node.durationMs)) {
      push(atMs, line.level, node.name, line.message, node.nodeId, line.metadata);
    }
    if (node.error) {
      push(atMs, "error", node.name, node.error.message, node.nodeId, {
        category: node.error.category,
      });
    }
    if (node.finishedAt) fallbackMs = new Date(node.finishedAt).getTime();
  }

  const finishMs = execution.finishedAt
    ? new Date(execution.finishedAt).getTime()
    : fallbackMs;
  if (execution.status === "success") {
    push(finishMs, "info", "runner", "Execution finished successfully", "runner");
  } else if (execution.status === "failed") {
    push(finishMs, "error", "runner", "Execution aborted: a node failed", "runner");
  } else if (execution.status === "cancelled") {
    push(finishMs, "warn", "runner", "Execution cancelled", "runner");
  } else {
    push(finishMs, "info", "runner", "Execution still running", "runner");
  }

  return entries;
}
