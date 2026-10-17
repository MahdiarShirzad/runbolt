import { parseWorkflowGraph } from "./workflow-graph";
import type { WorkflowGraph } from "./workflow-graph";
import type { TriggerType, WorkflowStatus } from "./types";

/**
 * Browser-local workflow layer (localStorage).
 *
 * The Runbolt API is not connected yet, so workflows created here and every
 * action taken on sample workflows (pause/activate, duplicate, delete, edit
 * the graph) are persisted in this browser on top of the deterministic mock
 * baseline.
 *
 * Workflows are graph-based: each record can carry a `graph` (nodes + edges).
 * Legacy records with only `steps` remain valid and are migrated to a linear
 * graph on read, so existing data keeps working.
 *
 * TODO(api): replace these reads/writes with real requests
 *   addCreatedWorkflow      → POST   /v1/workflows
 *   updateCreatedWorkflow   → PATCH  /v1/workflows/:id
 *   removeCreatedWorkflow   → DELETE /v1/workflows/:id
 *   markMockDeleted         → DELETE /v1/workflows/:id
 *   setMockStatusOverride   → PATCH  /v1/workflows/:id { status }
 *   setMockGraphOverride    → PUT    /v1/workflows/:id/definition
 */

const STORAGE_KEY = "runbolt.workflows.local.v1";

export interface LocalWorkflow {
  id: string;
  name: string;
  slug: string;
  status: WorkflowStatus;
  trigger: TriggerType;
  steps: string[];
  triggerDetail: string | null;
  createdAt: string;
  /** Optional free-text description edited in the builder. */
  description?: string;
  /** Graph definition. When absent, the workflow migrates from `steps`. */
  graph?: WorkflowGraph;
  /** Bumped on every saved graph change — used for stale-edit detection. */
  version?: number;
  /** ISO timestamp of the last edit; falls back to `createdAt`. */
  updatedAt?: string;
}

/** A saved graph (and optional metadata) for a baseline/mock workflow. */
export interface MockWorkflowOverride {
  graph: WorkflowGraph;
  name?: string;
  description?: string;
  version?: number;
  updatedAt: string;
}

export interface LocalWorkflowState {
  created: LocalWorkflow[];
  deletedMockIds: string[];
  statusOverrides: Record<string, WorkflowStatus>;
  graphOverrides: Record<string, MockWorkflowOverride>;
}

/** A fresh empty state — never share this object, callers mutate what they get. */
function emptyState(): LocalWorkflowState {
  return {
    created: [],
    deletedMockIds: [],
    statusOverrides: {},
    graphOverrides: {},
  };
}

const listeners = new Set<() => void>();

export function isLocalWorkflow(id: string): boolean {
  return id.startsWith("local_");
}

function isLocalWorkflowShape(value: unknown): value is Omit<LocalWorkflow, "graph"> & {
  graph?: unknown;
} {
  if (typeof value !== "object" || value == null) return false;
  const w = value as Record<string, unknown>;
  return (
    typeof w.id === "string" &&
    w.id.startsWith("local_") &&
    typeof w.name === "string" &&
    typeof w.slug === "string" &&
    (w.status === "active" || w.status === "paused") &&
    typeof w.createdAt === "string" &&
    Array.isArray(w.steps)
  );
}

function normalizeCreated(value: unknown): LocalWorkflow | null {
  if (!isLocalWorkflowShape(value)) return null;
  const record = value as Record<string, unknown>;
  const graph =
    record.graph == null ? undefined : parseWorkflowGraph(record.graph) ?? undefined;
  return {
    id: record.id as string,
    name: record.name as string,
    slug: record.slug as string,
    status: record.status as WorkflowStatus,
    trigger: (typeof record.trigger === "string" ? record.trigger : "manual") as TriggerType,
    steps: (record.steps as unknown[]).filter((s): s is string => typeof s === "string"),
    triggerDetail: typeof record.triggerDetail === "string" ? record.triggerDetail : null,
    createdAt: record.createdAt as string,
    ...(typeof record.description === "string" ? { description: record.description } : {}),
    ...(graph ? { graph } : {}),
    ...(typeof record.version === "number" ? { version: record.version } : {}),
    ...(typeof record.updatedAt === "string" ? { updatedAt: record.updatedAt } : {}),
  };
}

function normalizeOverride(value: unknown): MockWorkflowOverride | null {
  if (typeof value !== "object" || value == null) return null;
  const record = value as Record<string, unknown>;
  const graph = parseWorkflowGraph(record.graph);
  if (!graph) return null;
  return {
    graph,
    ...(typeof record.name === "string" ? { name: record.name } : {}),
    ...(typeof record.description === "string" ? { description: record.description } : {}),
    ...(typeof record.version === "number" ? { version: record.version } : {}),
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : new Date(0).toISOString(),
  };
}

export function loadLocalState(): LocalWorkflowState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed == null) return emptyState();
    const state = parsed as Record<string, unknown>;

    const graphOverrides: Record<string, MockWorkflowOverride> = {};
    if (typeof state.graphOverrides === "object" && state.graphOverrides != null) {
      for (const [id, rawOverride] of Object.entries(
        state.graphOverrides as Record<string, unknown>,
      )) {
        const override = normalizeOverride(rawOverride);
        if (override) graphOverrides[id] = override;
      }
    }

    return {
      created: Array.isArray(state.created)
        ? state.created
            .map(normalizeCreated)
            .filter((workflow): workflow is LocalWorkflow => workflow != null)
        : [],
      deletedMockIds: Array.isArray(state.deletedMockIds)
        ? state.deletedMockIds.filter((id): id is string => typeof id === "string")
        : [],
      statusOverrides:
        typeof state.statusOverrides === "object" && state.statusOverrides != null
          ? (state.statusOverrides as Record<string, WorkflowStatus>)
          : {},
      graphOverrides,
    };
  } catch {
    return emptyState();
  }
}

function saveAndNotify(state: LocalWorkflowState): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable (private mode/quota) — state stays in-memory for this tab.
    }
  }
  listeners.forEach((listener) => listener());
}

export function subscribeLocalWorkflows(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function addCreatedWorkflow(workflow: LocalWorkflow): void {
  const state = loadLocalState();
  state.created = [workflow, ...state.created.filter((w) => w.id !== workflow.id)];
  saveAndNotify(state);
}

export function updateCreatedWorkflow(
  id: string,
  patch: Partial<
    Pick<
      LocalWorkflow,
      "status" | "name" | "steps" | "triggerDetail" | "description" | "graph" | "version"
    >
  >,
): void {
  const state = loadLocalState();
  const now = new Date(Date.now()).toISOString();
  state.created = state.created.map((w) =>
    w.id === id
      ? {
          ...w,
          ...patch,
          ...(patch.graph || patch.name !== undefined ? { updatedAt: now } : {}),
        }
      : w,
  );
  saveAndNotify(state);
}

export function removeCreatedWorkflow(id: string): void {
  const state = loadLocalState();
  state.created = state.created.filter((w) => w.id !== id);
  saveAndNotify(state);
}

export function markMockDeleted(id: string): void {
  const state = loadLocalState();
  if (!state.deletedMockIds.includes(id)) {
    state.deletedMockIds = [...state.deletedMockIds, id];
  }
  saveAndNotify(state);
}

export function setMockStatusOverride(id: string, status: WorkflowStatus): void {
  const state = loadLocalState();
  state.statusOverrides = { ...state.statusOverrides, [id]: status };
  saveAndNotify(state);
}

export function getMockOverride(id: string): MockWorkflowOverride | null {
  return loadLocalState().graphOverrides[id] ?? null;
}

/** Upserts the saved graph (and metadata) for a baseline/mock workflow. */
export function setMockGraphOverride(
  id: string,
  patch: Partial<Omit<MockWorkflowOverride, "updatedAt">> & { graph: WorkflowGraph },
): void {
  const state = loadLocalState();
  const previous = state.graphOverrides[id];
  state.graphOverrides = {
    ...state.graphOverrides,
    [id]: {
      graph: patch.graph,
      name: patch.name ?? previous?.name,
      description: patch.description ?? previous?.description,
      version: patch.version ?? (previous?.version ?? 0) + 1,
      updatedAt: new Date(Date.now()).toISOString(),
    },
  };
  saveAndNotify(state);
}

export function findCreatedWorkflow(
  state: LocalWorkflowState,
  idOrSlug: string,
): LocalWorkflow | null {
  return (
    state.created.find(
      (workflow) => workflow.id === idOrSlug || workflow.slug === idOrSlug,
    ) ?? null
  );
}

export function makeSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function nextCopySlug(baseSlug: string, takenSlugs: string[]): string {
  const taken = new Set(takenSlugs);
  const first = `${baseSlug}-copy`;
  if (!taken.has(first)) return first;
  let n = 2;
  while (taken.has(`${first}-${n}`)) n += 1;
  return `${first}-${n}`;
}
