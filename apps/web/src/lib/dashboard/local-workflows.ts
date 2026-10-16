import type { TriggerType, WorkflowStatus } from "./types";

/**
 * Browser-local workflow layer (localStorage).
 *
 * The Runbolt API is not connected yet, so workflows created here and every
 * action taken on sample workflows (pause/activate, duplicate, delete) are
 * persisted in this browser on top of the deterministic mock baseline.
 *
 * TODO(api): replace these reads/writes with real requests
 *   addCreatedWorkflow      → POST   /v1/workflows
 *   updateCreatedWorkflow   → PATCH  /v1/workflows/:id
 *   removeCreatedWorkflow   → DELETE /v1/workflows/:id
 *   markMockDeleted         → DELETE /v1/workflows/:id
 *   setMockStatusOverride   → PATCH  /v1/workflows/:id { status }
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
}

export interface LocalWorkflowState {
  created: LocalWorkflow[];
  deletedMockIds: string[];
  statusOverrides: Record<string, WorkflowStatus>;
}

const EMPTY_STATE: LocalWorkflowState = {
  created: [],
  deletedMockIds: [],
  statusOverrides: {},
};

const listeners = new Set<() => void>();

export function isLocalWorkflow(id: string): boolean {
  return id.startsWith("local_");
}

function isLocalWorkflowShape(value: unknown): value is LocalWorkflow {
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

export function loadLocalState(): LocalWorkflowState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed == null) return EMPTY_STATE;
    const state = parsed as Record<string, unknown>;
    return {
      created: Array.isArray(state.created)
        ? state.created.filter(isLocalWorkflowShape)
        : [],
      deletedMockIds: Array.isArray(state.deletedMockIds)
        ? state.deletedMockIds.filter((id): id is string => typeof id === "string")
        : [],
      statusOverrides:
        typeof state.statusOverrides === "object" && state.statusOverrides != null
          ? (state.statusOverrides as Record<string, WorkflowStatus>)
          : {},
    };
  } catch {
    return EMPTY_STATE;
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
  patch: Partial<Pick<LocalWorkflow, "status" | "name" | "steps" | "triggerDetail">>,
): void {
  const state = loadLocalState();
  state.created = state.created.map((w) => (w.id === id ? { ...w, ...patch } : w));
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
