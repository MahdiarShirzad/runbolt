import { INTEGRATIONS } from "./integrations";
import type { TriggerType } from "./types";

/**
 * Graph-based workflow definition.
 *
 * A workflow is a directed acyclic graph of nodes (triggers, actions,
 * conditions, transforms and utilities) connected by edges. Node positions are
 * presentation-only; the execution semantics live in `type` + `config`.
 *
 * The Runbolt API currently persists workflows in the browser-local layer
 * (`local-workflows.ts`). This module is the single source of truth for the
 * graph shape, node registry, migration from legacy `steps`, validation, and
 * serialization — so both the editor and the persistence layer agree on one
 * structure.
 */

export type WorkflowNodeCategory =
  | "trigger"
  | "action"
  | "integration"
  | "transform"
  | "condition"
  | "utility";

export type WorkflowNodeType =
  | "manual_trigger"
  | "webhook_trigger"
  | "schedule_trigger"
  | "api_trigger"
  | "http_request"
  | "integration_action"
  | "action"
  | "data_mapping"
  | "filter"
  | "if_else"
  | "switch"
  | "loop"
  | "delay"
  | "log";

export interface GraphPosition {
  x: number;
  y: number;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: GraphPosition;
  /** User-facing label (falls back to the node type's default label). */
  label?: string;
  /** Optional free-text note shown in the config panel. */
  description?: string;
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  /** Output handle id on the source node ("out", "true", "false", "case:0"…). */
  sourceHandle?: string | null;
  /** Input handle id on the target node (always "in" for targeted nodes). */
  targetHandle?: string | null;
  label?: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

/* ------------------------------------------------------------------ */
/* Node registry                                                       */
/* ------------------------------------------------------------------ */

export type NodeConfigFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "boolean"
  | "key_value"
  | "credential";

export interface NodeConfigField {
  key: string;
  label: string;
  type: NodeConfigFieldType;
  placeholder?: string;
  help?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

export interface NodeTypeDefinition {
  type: WorkflowNodeType;
  label: string;
  category: WorkflowNodeCategory;
  description: string;
  /** Whether the deterministic runner can execute this node honours its config. */
  executable: boolean;
  /** Reason shown in the UI when a node is not executable. */
  unavailableReason?: string;
  fields: NodeConfigField[];
  defaultConfig: Record<string, unknown>;
}

export const CATEGORY_LABELS: Record<WorkflowNodeCategory, string> = {
  trigger: "Triggers",
  action: "Actions & Integrations",
  integration: "Actions & Integrations",
  transform: "Data Transformation",
  condition: "Conditions & Control Flow",
  utility: "Utilities",
};

export const CATEGORY_ORDER: WorkflowNodeCategory[] = [
  "trigger",
  "integration",
  "action",
  "transform",
  "condition",
  "utility",
];

/**
 * Static Tailwind class strings per category (never build class names
 * dynamically — Tailwind only sees literal strings).
 */
export const CATEGORY_STYLES: Record<
  WorkflowNodeCategory,
  { border: string; text: string; dot: string; soft: string; chip: string }
> = {
  trigger: {
    border: "border-node-trigger/60",
    text: "text-node-trigger",
    dot: "bg-node-trigger",
    soft: "bg-node-trigger/10",
    chip: "border-node-trigger/40 bg-node-trigger/10 text-node-trigger",
  },
  integration: {
    border: "border-node-database/60",
    text: "text-node-database",
    dot: "bg-node-database",
    soft: "bg-node-database/10",
    chip: "border-node-database/40 bg-node-database/10 text-node-database",
  },
  action: {
    border: "border-node-action/70",
    text: "text-node-action",
    dot: "bg-node-action",
    soft: "bg-node-action/10",
    chip: "border-node-action/40 bg-node-action/10 text-node-action",
  },
  transform: {
    border: "border-node-transform/70",
    text: "text-node-transform",
    dot: "bg-node-transform",
    soft: "bg-node-transform/10",
    chip: "border-node-transform/40 bg-node-transform/10 text-node-transform",
  },
  condition: {
    border: "border-node-condition/60",
    text: "text-node-condition",
    dot: "bg-node-condition",
    soft: "bg-node-condition/10",
    chip: "border-node-condition/40 bg-node-condition/10 text-node-condition",
  },
  utility: {
    border: "border-node-queue/70",
    text: "text-node-queue",
    dot: "bg-node-queue",
    soft: "bg-node-queue/10",
    chip: "border-node-queue/40 bg-node-queue/10 text-node-queue",
  },
};

const COMPARISON_OPERATORS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
  { value: "gt", label: "greater than" },
  { value: "gte", label: "greater or equal" },
  { value: "lt", label: "less than" },
  { value: "lte", label: "less or equal" },
  { value: "exists", label: "exists" },
  { value: "empty", label: "is empty" },
];

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"].map((value) => ({
  value,
  label: value,
}));

const INTEGRATION_OPTIONS = INTEGRATIONS.map((integration) => ({
  value: integration.slug,
  label: integration.name,
}));

export const NODE_DEFINITIONS: Record<WorkflowNodeType, NodeTypeDefinition> = {
  manual_trigger: {
    type: "manual_trigger",
    label: "Manual trigger",
    category: "trigger",
    description: "Start the workflow by hand from the editor or API.",
    executable: true,
    fields: [],
    defaultConfig: {},
  },
  webhook_trigger: {
    type: "webhook_trigger",
    label: "Webhook trigger",
    category: "trigger",
    description: "Start when an external service posts to an endpoint.",
    executable: true,
    fields: [
      {
        key: "path",
        label: "Endpoint path",
        type: "text",
        placeholder: "order-fulfillment",
        required: true,
        help: "The URL suffix that accepts incoming events.",
      },
      { key: "method", label: "Method", type: "select", options: HTTP_METHODS },
      {
        key: "secret",
        label: "Signing secret",
        type: "text",
        placeholder: "whsec_…",
        help: "Used to verify the request signature (never stored by this demo).",
      },
    ],
    defaultConfig: { path: "", method: "POST", secret: "" },
  },
  schedule_trigger: {
    type: "schedule_trigger",
    label: "Schedule trigger",
    category: "trigger",
    description: "Run automatically on a recurring interval.",
    executable: true,
    fields: [
      {
        key: "preset",
        label: "Schedule",
        type: "select",
        required: true,
        options: [
          { value: "Every 5 minutes", label: "Every 5 minutes" },
          { value: "Every hour", label: "Every hour" },
          { value: "Daily at 09:00 UTC", label: "Daily at 09:00 UTC" },
          {
            value: "Weekly on Monday 09:00 UTC",
            label: "Weekly on Monday 09:00 UTC",
          },
        ],
      },
      {
        key: "timezone",
        label: "Timezone",
        type: "text",
        placeholder: "UTC",
      },
    ],
    defaultConfig: { preset: "Daily at 09:00 UTC", timezone: "UTC" },
  },
  api_trigger: {
    type: "api_trigger",
    label: "API trigger",
    category: "trigger",
    description: "Start when your application requests a run.",
    executable: true,
    fields: [
      { key: "method", label: "Method", type: "select", options: HTTP_METHODS },
      {
        key: "auth",
        label: "Authentication",
        type: "select",
        options: [
          { value: "api_key", label: "API key" },
          { value: "bearer", label: "Bearer token" },
          { value: "none", label: "None" },
        ],
      },
    ],
    defaultConfig: { method: "POST", auth: "api_key" },
  },
  http_request: {
    type: "http_request",
    label: "HTTP request",
    category: "integration",
    description: "Call any REST endpoint with custom method, headers, and body.",
    executable: true,
    fields: [
      { key: "method", label: "Method", type: "select", options: HTTP_METHODS, required: true },
      {
        key: "url",
        label: "URL",
        type: "text",
        placeholder: "https://api.example.com/orders",
        required: true,
      },
      {
        key: "credentialId",
        label: "Credential",
        type: "credential",
        help: "Attach a saved credential to sign the request.",
      },
      { key: "headers", label: "Headers", type: "key_value" },
      { key: "query", label: "Query parameters", type: "key_value" },
      {
        key: "body",
        label: "Request body",
        type: "textarea",
        placeholder: '{ "orderId": "{{ steps.trigger.data.id }}" }',
      },
      { key: "timeoutMs", label: "Timeout (ms)", type: "number", min: 100, max: 120000 },
      { key: "retries", label: "Retries", type: "number", min: 0, max: 10 },
    ],
    defaultConfig: {
      method: "GET",
      url: "",
      credentialId: "",
      headers: [],
      query: [],
      body: "",
      timeoutMs: 30000,
      retries: 2,
    },
  },
  integration_action: {
    type: "integration_action",
    label: "Integration action",
    category: "integration",
    description: "Run a supported operation on a connected integration.",
    executable: true,
    fields: [
      {
        key: "integrationSlug",
        label: "Integration",
        type: "select",
        required: true,
        options: INTEGRATION_OPTIONS,
      },
      {
        key: "operation",
        label: "Operation",
        type: "text",
        placeholder: "create_issue",
        required: true,
        help: "The action name from the integration's catalog.",
      },
      { key: "credentialId", label: "Credential", type: "credential" },
      {
        key: "parameters",
        label: "Parameters",
        type: "key_value",
      },
    ],
    defaultConfig: { integrationSlug: "github", operation: "", credentialId: "", parameters: [] },
  },
  action: {
    type: "action",
    label: "Action step",
    category: "action",
    description: "A generic step. Used by workflows imported from step lists.",
    executable: true,
    fields: [
      {
        key: "title",
        label: "Title",
        type: "text",
        placeholder: "Fetch pending orders",
        required: true,
      },
    ],
    defaultConfig: { title: "" },
  },
  data_mapping: {
    type: "data_mapping",
    label: "Data mapping",
    category: "transform",
    description: "Reshape data — rename, pick, or build a new payload.",
    executable: true,
    fields: [
      {
        key: "mode",
        label: "Mode",
        type: "select",
        options: [
          { value: "map", label: "Map fields" },
          { value: "pick", label: "Pick fields" },
          { value: "rename", label: "Rename fields" },
        ],
      },
      {
        key: "mappings",
        label: "Field mappings",
        type: "key_value",
        help: "Left is the output field, right is the source expression.",
      },
    ],
    defaultConfig: { mode: "map", mappings: [] },
  },
  filter: {
    type: "filter",
    label: "Filter",
    category: "transform",
    description: "Continue only when a condition is met; otherwise stop the branch.",
    executable: true,
    fields: [
      { key: "left", label: "Field / expression", type: "text", placeholder: "{{ steps.trigger.data.status }}" },
      { key: "operator", label: "Operator", type: "select", options: COMPARISON_OPERATORS },
      { key: "right", label: "Value", type: "text", placeholder: "paid" },
    ],
    defaultConfig: { left: "", operator: "equals", right: "" },
  },
  if_else: {
    type: "if_else",
    label: "If / Else",
    category: "condition",
    description: "Branch the workflow into a true and a false path.",
    executable: true,
    fields: [
      { key: "left", label: "Field / expression", type: "text", placeholder: "{{ steps.trigger.data.amount }}" },
      { key: "operator", label: "Operator", type: "select", options: COMPARISON_OPERATORS },
      { key: "right", label: "Value", type: "text", placeholder: "100" },
    ],
    defaultConfig: { left: "", operator: "equals", right: "" },
  },
  switch: {
    type: "switch",
    label: "Switch",
    category: "condition",
    description: "Route to one of several paths based on a value.",
    executable: true,
    fields: [
      { key: "expression", label: "Expression", type: "text", placeholder: "{{ steps.trigger.data.type }}" },
      {
        key: "cases",
        label: "Cases",
        type: "textarea",
        placeholder: "created\nupdated\ndeleted",
        help: "One case per line. Unmatched values fall through to the default path.",
      },
    ],
    defaultConfig: { expression: "", cases: "case_a\ncase_b" },
  },
  loop: {
    type: "loop",
    label: "Loop over items",
    category: "condition",
    description: "Iterate a branch once per item.",
    executable: false,
    unavailableReason:
      "Iterative execution is not supported by the Runbolt engine yet, so this node cannot run.",
    fields: [
      {
        key: "items",
        label: "Items expression",
        type: "text",
        placeholder: "{{ steps.trigger.data.items }}",
      },
      { key: "maxIterations", label: "Max iterations", type: "number", min: 1, max: 1000 },
    ],
    defaultConfig: { items: "", maxIterations: 100 },
  },
  delay: {
    type: "delay",
    label: "Delay",
    category: "utility",
    description: "Pause the workflow for a fixed duration before continuing.",
    executable: true,
    fields: [
      { key: "duration", label: "Duration", type: "number", min: 1, required: true },
      {
        key: "unit",
        label: "Unit",
        type: "select",
        options: [
          { value: "seconds", label: "Seconds" },
          { value: "minutes", label: "Minutes" },
          { value: "hours", label: "Hours" },
        ],
      },
    ],
    defaultConfig: { duration: 5, unit: "seconds" },
  },
  log: {
    type: "log",
    label: "Log message",
    category: "utility",
    description: "Write a message to the execution log (handy while debugging).",
    executable: true,
    fields: [
      { key: "message", label: "Message", type: "text", placeholder: "Processing {{ steps.trigger.data.id }}" },
      {
        key: "level",
        label: "Level",
        type: "select",
        options: [
          { value: "info", label: "Info" },
          { value: "warn", label: "Warning" },
          { value: "error", label: "Error" },
        ],
      },
    ],
    defaultConfig: { message: "", level: "info" },
  },
};

export const ALL_NODE_TYPES = Object.keys(NODE_DEFINITIONS) as WorkflowNodeType[];

const TRIGGER_TYPES = new Set<WorkflowNodeType>([
  "manual_trigger",
  "webhook_trigger",
  "schedule_trigger",
  "api_trigger",
]);

export function isTriggerType(type: WorkflowNodeType): boolean {
  return TRIGGER_TYPES.has(type);
}

export function getNodeDefinition(type: WorkflowNodeType): NodeTypeDefinition {
  return NODE_DEFINITIONS[type];
}

export function nodeLabel(node: WorkflowNode): string {
  if (node.label) return node.label;
  return NODE_DEFINITIONS[node.type]?.label ?? node.type;
}

/* ------------------------------------------------------------------ */
/* Handles                                                             */
/* ------------------------------------------------------------------ */

export interface OutputHandle {
  id: string;
  label: string;
}

export const INPUT_HANDLE = "in";

export function getInputHandle(node: WorkflowNode): string | null {
  return isTriggerType(node.type) ? null : INPUT_HANDLE;
}

/** Output handles depend on node type (and switch cases at runtime). */
export function getOutputHandles(node: WorkflowNode): OutputHandle[] {
  switch (node.type) {
    case "if_else":
    case "filter":
      return [
        { id: "true", label: "True" },
        { id: "false", label: "False" },
      ];
    case "switch": {
      const cases = switchCases(node);
      const handles = cases.map((value, index) => ({
        id: `case:${index}`,
        label: value || `Case ${index + 1}`,
      }));
      handles.push({ id: "default", label: "Default" });
      return handles;
    }
    default:
      return [{ id: "out", label: "Out" }];
  }
}

export function switchCases(node: WorkflowNode): string[] {
  const raw = node.config.cases;
  if (typeof raw !== "string") return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/* ------------------------------------------------------------------ */
/* Construction & ids                                                  */
/* ------------------------------------------------------------------ */

let idCounter = 0;

export function makeNodeId(type: WorkflowNodeType, existing: Iterable<string> = []): string {
  const taken = new Set(existing);
  let index = idCounter + 1;
  let candidate = `${type}_${index}`;
  while (taken.has(candidate)) {
    index += 1;
    candidate = `${type}_${index}`;
  }
  idCounter = index;
  return candidate;
}

export function makeEdgeId(existing: Iterable<string> = []): string {
  const taken = new Set(existing);
  let index = idCounter + 1;
  let candidate = `edge_${index}`;
  while (taken.has(candidate)) {
    index += 1;
    candidate = `edge_${index}`;
  }
  idCounter = index;
  return candidate;
}

/** Used by tests to get deterministic ids. */
export function resetIdCounter(): void {
  idCounter = 0;
}

export function createNode(
  type: WorkflowNodeType,
  position: GraphPosition,
  options: {
    id?: string;
    existing?: Iterable<string>;
    label?: string;
    description?: string;
    config?: Record<string, unknown>;
  } = {},
): WorkflowNode {
  const definition = NODE_DEFINITIONS[type];
  const id = options.id ?? makeNodeId(type, options.existing ?? []);
  return {
    id,
    type,
    position,
    ...(options.label ? { label: options.label } : {}),
    ...(options.description ? { description: options.description } : {}),
    config: { ...definition.defaultConfig, ...(options.config ?? {}) },
  };
}

export function createEdge(
  source: string,
  target: string,
  options: {
    id?: string;
    existing?: Iterable<string>;
    sourceHandle?: string;
    targetHandle?: string;
    label?: string;
  } = {},
): WorkflowEdge {
  return {
    id: options.id ?? makeEdgeId(options.existing ?? []),
    source,
    target,
    sourceHandle: options.sourceHandle ?? "out",
    targetHandle: options.targetHandle ?? INPUT_HANDLE,
    ...(options.label ? { label: options.label } : {}),
  };
}

/* ------------------------------------------------------------------ */
/* Layout & migration from legacy step lists                           */
/* ------------------------------------------------------------------ */

const COLUMN_WIDTH = 300;
const ROW_HEIGHT = 160;
const ORIGIN = { x: 40, y: 80 };

export function humanizeStepName(name: string): string {
  const cleaned = name.replace(/[_-]+/g, " ").trim();
  if (!cleaned) return "Step";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function triggerTypeFor(trigger: TriggerType): WorkflowNodeType {
  switch (trigger) {
    case "webhook":
      return "webhook_trigger";
    case "schedule":
      return "schedule_trigger";
    case "api":
      return "api_trigger";
    default:
      return "manual_trigger";
  }
}

function linearLayout(index: number): GraphPosition {
  return { x: ORIGIN.x + index * COLUMN_WIDTH, y: ORIGIN.y + ROW_HEIGHT };
}

/**
 * Builds a linear graph from an ordered step list (the legacy model). A
 * linear workflow is stored with the same graph shape as a branched one.
 */
export function stepsToGraph(
  steps: string[],
  trigger: TriggerType,
  options: { slug?: string; triggerDetail?: string | null } = {},
): WorkflowGraph {
  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];

  const triggerNode = createNode(triggerTypeFor(trigger), linearLayout(0), {
    id: `${triggerTypeFor(trigger)}_1`,
    config: triggerConfigFor(trigger, options),
  });
  nodes.push(triggerNode);

  let previous = triggerNode.id;
  steps.forEach((step, index) => {
    const node = createNode("action", linearLayout(index + 1), {
      id: `action_${index + 1}`,
      label: humanizeStepName(step),
      config: { title: humanizeStepName(step), sourceStep: step },
    });
    nodes.push(node);
    edges.push(
      createEdge(previous, node.id, { id: `edge_${index + 1}`, sourceHandle: "out" }),
    );
    previous = node.id;
  });

  return { nodes, edges };
}

function triggerConfigFor(
  trigger: TriggerType,
  options: { slug?: string; triggerDetail?: string | null },
): Record<string, unknown> {
  switch (trigger) {
    case "webhook":
      return { path: options.slug ?? "", method: "POST", secret: "" };
    case "schedule":
      return {
        preset: options.triggerDetail ?? "Daily at 09:00 UTC",
        timezone: "UTC",
      };
    case "api":
      return { method: "POST", auth: "api_key" };
    default:
      return {};
  }
}

/** A brand-new workflow: a single configured trigger node. */
export function createStarterGraph(
  trigger: TriggerType,
  options: { slug?: string; triggerDetail?: string | null } = {},
): WorkflowGraph {
  const type = triggerTypeFor(trigger);
  return {
    nodes: [
      createNode(type, linearLayout(0), {
        id: `${type}_1`,
        config: triggerConfigFor(trigger, options),
      }),
    ],
    edges: [],
  };
}

/* ------------------------------------------------------------------ */
/* Serialization                                                       */
/* ------------------------------------------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

export function isWorkflowNodeType(value: unknown): value is WorkflowNodeType {
  return typeof value === "string" && value in NODE_DEFINITIONS;
}

function isPosition(value: unknown): value is GraphPosition {
  return (
    isRecord(value) &&
    typeof value.x === "number" &&
    Number.isFinite(value.x) &&
    typeof value.y === "number" &&
    Number.isFinite(value.y)
  );
}

function normalizeNode(value: unknown): WorkflowNode | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || value.id.length === 0) return null;
  if (!isWorkflowNodeType(value.type)) return null;
  if (!isPosition(value.position)) return null;
  const definition = NODE_DEFINITIONS[value.type];
  const config = isRecord(value.config) ? value.config : {};
  return {
    id: value.id,
    type: value.type,
    position: { x: value.position.x, y: value.position.y },
    ...(typeof value.label === "string" && value.label ? { label: value.label } : {}),
    ...(typeof value.description === "string" && value.description
      ? { description: value.description }
      : {}),
    config: { ...definition.defaultConfig, ...config },
  };
}

function normalizeEdge(value: unknown, nodeIds: Set<string>): WorkflowEdge | null {
  if (!isRecord(value)) return null;
  if (typeof value.source !== "string" || typeof value.target !== "string") return null;
  if (!nodeIds.has(value.source) || !nodeIds.has(value.target)) return null;
  return {
    id: typeof value.id === "string" && value.id ? value.id : `edge_${value.source}_${value.target}`,
    source: value.source,
    target: value.target,
    sourceHandle: typeof value.sourceHandle === "string" ? value.sourceHandle : "out",
    targetHandle: typeof value.targetHandle === "string" ? value.targetHandle : INPUT_HANDLE,
    ...(typeof value.label === "string" && value.label ? { label: value.label } : {}),
  };
}

/**
 * Defensive deserialization for anything read back from storage or the API.
 * Unknown nodes/edges are dropped rather than trusted.
 */
export function parseWorkflowGraph(value: unknown): WorkflowGraph | null {
  if (!isRecord(value)) return null;
  const rawNodes = Array.isArray(value.nodes) ? value.nodes : [];
  const nodes = rawNodes
    .map(normalizeNode)
    .filter((node): node is WorkflowNode => node != null);

  const nodeIds = new Set(nodes.map((node) => node.id));
  const rawEdges = Array.isArray(value.edges) ? value.edges : [];
  const edges = rawEdges
    .map((edge) => normalizeEdge(edge, nodeIds))
    .filter((edge): edge is WorkflowEdge => edge != null);

  return { nodes, edges };
}

export function cloneGraph(graph: WorkflowGraph): WorkflowGraph {
  return {
    nodes: graph.nodes.map((node) => ({
      ...node,
      position: { ...node.position },
      config: structuredCloneSafe(node.config),
    })),
    edges: graph.edges.map((edge) => ({ ...edge })),
  };
}

function structuredCloneSafe(value: unknown): Record<string, unknown> {
  try {
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export type GraphIssueSeverity = "error" | "warning";

export interface GraphIssue {
  code: string;
  message: string;
  severity: GraphIssueSeverity;
  nodeId?: string;
  edgeId?: string;
}

export interface GraphValidation {
  issues: GraphIssue[];
  /** Structural problems prevent saving (the graph would be corrupted). */
  saveable: boolean;
  /** A saveable graph that also has no run-blocking warnings can execute. */
  runnable: boolean;
}

const RUN_BLOCKING_CODES = new Set([
  "no-trigger",
  "multiple-triggers",
  "no-entry-edge",
  "unreachable-node",
  "missing-config",
  "unsupported-node",
  "invalid-handle",
]);

export function findTriggerNodes(graph: WorkflowGraph): WorkflowNode[] {
  return graph.nodes.filter((node) => isTriggerType(node.type));
}

/** Reaches every node that is transitively downstream of `startIds`. */
export function reachableFrom(graph: WorkflowGraph, startIds: Iterable<string>): Set<string> {
  const adjacency = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const list = adjacency.get(edge.source) ?? [];
    list.push(edge.target);
    adjacency.set(edge.source, list);
  }
  const seen = new Set<string>();
  const stack = [...startIds];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const next of adjacency.get(id) ?? []) stack.push(next);
  }
  return seen;
}

export function wouldCreateCycle(
  graph: WorkflowGraph,
  source: string,
  target: string,
): boolean {
  if (source === target) return true;
  // Adding source -> target creates a cycle if target can already reach source.
  return reachableFrom(graph, [target]).has(source);
}

function missingRequiredConfig(node: WorkflowNode): NodeConfigField[] {
  const definition = NODE_DEFINITIONS[node.type];
  if (!definition) return [];
  return definition.fields.filter((field) => {
    if (!field.required) return false;
    const value = node.config[field.key];
    if (field.type === "key_value") {
      return !Array.isArray(value) || value.length === 0;
    }
    if (field.type === "number") return typeof value !== "number" || !Number.isFinite(value);
    return typeof value !== "string" || value.trim() === "";
  });
}

export function validateGraph(graph: WorkflowGraph): GraphValidation {
  const issues: GraphIssue[] = [];

  if (graph.nodes.length === 0) {
    issues.push({ code: "empty", message: "Add at least one node.", severity: "warning" });
    return { issues, saveable: true, runnable: false };
  }

  const ids = new Set<string>();
  for (const node of graph.nodes) {
    if (ids.has(node.id)) {
      issues.push({
        code: "duplicate-node-id",
        message: `Duplicate node id "${node.id}".`,
        severity: "error",
        nodeId: node.id,
      });
    }
    ids.add(node.id);
    if (!NODE_DEFINITIONS[node.type]) {
      issues.push({
        code: "unsupported-node",
        message: `Unsupported node type "${node.type}".`,
        severity: "error",
        nodeId: node.id,
      });
      continue;
    }
    const definition = NODE_DEFINITIONS[node.type];
    if (!definition.executable) {
      issues.push({
        code: "unsupported-node",
        message: definition.unavailableReason ?? `"${definition.label}" is not executable yet.`,
        severity: "warning",
        nodeId: node.id,
      });
    }
    const missing = missingRequiredConfig(node);
    if (missing.length > 0) {
      issues.push({
        code: "missing-config",
        message: `${nodeLabel(node)} is missing ${missing
          .map((field) => field.label)
          .join(", ")}.`,
        severity: "warning",
        nodeId: node.id,
      });
    }
  }

  for (const edge of graph.edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) {
      issues.push({
        code: "dangling-edge",
        message: "A connection references a node that no longer exists.",
        severity: "error",
        edgeId: edge.id,
      });
      continue;
    }
    const target = graph.nodes.find((node) => node.id === edge.target)!;
    if (isTriggerType(target.type)) {
      issues.push({
        code: "invalid-handle",
        message: `Triggers cannot receive connections (${nodeLabel(target)}).`,
        severity: "error",
        edgeId: edge.id,
        nodeId: target.id,
      });
    }
  }

  const triggers = findTriggerNodes(graph);
  if (triggers.length === 0) {
    issues.push({
      code: "no-trigger",
      message: "Add a trigger node to define how this workflow starts.",
      severity: "warning",
    });
  } else if (triggers.length > 1) {
    issues.push({
      code: "multiple-triggers",
      message: `${triggers.length} triggers found — the engine starts from a single trigger.`,
      severity: "warning",
    });
  }

  const entry = triggers[0];
  if (entry && !graph.edges.some((edge) => edge.source === entry.id)) {
    issues.push({
      code: "no-entry-edge",
      message: `${nodeLabel(entry)} is not connected to any step yet.`,
      severity: "warning",
      nodeId: entry.id,
    });
  }

  if (entry) {
    const reachable = reachableFrom(graph, [entry.id]);
    for (const node of graph.nodes) {
      if (node.id === entry.id) continue;
      if (!reachable.has(node.id)) {
        issues.push({
          code: "unreachable-node",
          message: `${nodeLabel(node)} is not reachable from the trigger.`,
          severity: "warning",
          nodeId: node.id,
        });
      }
    }
  }

  if (hasCycle(graph)) {
    issues.push({
      code: "cycle",
      message: "The graph contains a cycle. Loops and cycles are not supported.",
      severity: "error",
    });
  }

  const saveable = !issues.some((issue) => issue.severity === "error");
  const runnable =
    saveable && !issues.some((issue) => RUN_BLOCKING_CODES.has(issue.code));
  return { issues, saveable, runnable };
}

export function hasCycle(graph: WorkflowGraph): boolean {
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
  const queue: string[] = [];
  for (const [id, degree] of inDegree) if (degree === 0) queue.push(id);
  let visited = 0;
  while (queue.length > 0) {
    const id = queue.shift()!;
    visited += 1;
    for (const next of adjacency.get(id) ?? []) {
      const nextDegree = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, nextDegree);
      if (nextDegree === 0) queue.push(next);
    }
  }
  return visited !== graph.nodes.length;
}

/* ------------------------------------------------------------------ */
/* Connection rules                                                    */
/* ------------------------------------------------------------------ */

export interface ConnectionAttempt {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export function validateConnection(
  graph: WorkflowGraph,
  attempt: ConnectionAttempt,
): { ok: true } | { ok: false; reason: string } {
  const source = graph.nodes.find((node) => node.id === attempt.source);
  const target = graph.nodes.find((node) => node.id === attempt.target);
  if (!source || !target) return { ok: false, reason: "Unknown node in connection." };
  if (source.id === target.id) return { ok: false, reason: "A node cannot connect to itself." };
  if (isTriggerType(target.type)) {
    return { ok: false, reason: "Triggers cannot receive connections." };
  }
  const handles = getOutputHandles(source);
  if (attempt.sourceHandle && !handles.some((handle) => handle.id === attempt.sourceHandle)) {
    return { ok: false, reason: "That output no longer exists on the source node." };
  }
  const duplicate = graph.edges.some(
    (edge) =>
      edge.source === attempt.source &&
      edge.target === attempt.target &&
      (edge.sourceHandle ?? "out") === (attempt.sourceHandle ?? "out"),
  );
  if (duplicate) return { ok: false, reason: "These nodes are already connected." };
  if (wouldCreateCycle(graph, attempt.source, attempt.target)) {
    return {
      ok: false,
      reason: "That connection would create a cycle, which the engine cannot run.",
    };
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Config helpers                                                      */
/* ------------------------------------------------------------------ */

export function configString(node: WorkflowNode, key: string): string {
  const value = node.config[key];
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function configNumber(node: WorkflowNode, key: string, fallback = 0): number {
  const value = node.config[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export interface KeyValuePair {
  key: string;
  value: string;
}

export function configKeyValues(node: WorkflowNode, key: string): KeyValuePair[] {
  const value = node.config[key];
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is Record<string, unknown> => isRecord(entry))
    .map((entry) => ({
      key: typeof entry.key === "string" ? entry.key : "",
      value: typeof entry.value === "string" ? entry.value : "",
    }));
}
