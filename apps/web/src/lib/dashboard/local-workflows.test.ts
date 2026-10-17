import { beforeEach, describe, expect, it } from "vitest";
import {
  addCreatedWorkflow,
  findCreatedWorkflow,
  getMockOverride,
  loadLocalState,
  makeSlug,
  markMockDeleted,
  nextCopySlug,
  removeCreatedWorkflow,
  setMockGraphOverride,
  setMockStatusOverride,
  updateCreatedWorkflow,
} from "./local-workflows";
import type { LocalWorkflow } from "./local-workflows";
import { stepsToGraph } from "./workflow-graph";

const STORAGE_KEY = "runbolt.workflows.local.v1";

function installStorage() {
  const store = new Map<string, string>();
  const localStorageStub = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  };
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: localStorageStub,
  };
  return { store, localStorageStub };
}

function createdWorkflow(overrides: Partial<LocalWorkflow> = {}): LocalWorkflow {
  return {
    id: "local_my-flow",
    name: "My flow",
    slug: "my-flow",
    status: "paused",
    trigger: "manual",
    steps: ["Fetch", "Send"],
    triggerDetail: null,
    createdAt: new Date(0).toISOString(),
    ...overrides,
  };
}

describe("local-workflows persistence", () => {
  let store: Map<string, string>;

  beforeEach(() => {
    ({ store } = installStorage());
  });

  it("round-trips created workflows and finds them by id or slug", () => {
    addCreatedWorkflow(createdWorkflow());

    const state = loadLocalState();
    expect(state.created).toHaveLength(1);
    expect(findCreatedWorkflow(state, "local_my-flow")?.name).toBe("My flow");
    expect(findCreatedWorkflow(state, "my-flow")?.slug).toBe("my-flow");
    expect(findCreatedWorkflow(state, "missing")).toBeNull();
  });

  it("applies patches and stamps updatedAt when the graph changes", () => {
    addCreatedWorkflow(createdWorkflow());
    const graph = stepsToGraph(["Fetch"], "manual");

    updateCreatedWorkflow("local_my-flow", { name: "Renamed", graph, version: 2 });

    const updated = loadLocalState().created[0];
    expect(updated?.name).toBe("Renamed");
    expect(updated?.version).toBe(2);
    expect(updated?.graph?.nodes).toHaveLength(2);
    expect(typeof updated?.updatedAt).toBe("string");
  });

  it("removes created workflows", () => {
    addCreatedWorkflow(createdWorkflow());
    removeCreatedWorkflow("local_my-flow");
    expect(loadLocalState().created).toHaveLength(0);
  });

  it("tracks deleted mocks and status overrides", () => {
    markMockDeleted("wf_1");
    setMockStatusOverride("wf_2", "active");
    const state = loadLocalState();
    expect(state.deletedMockIds).toContain("wf_1");
    expect(state.statusOverrides.wf_2).toBe("active");
  });

  it("upserts graph overrides and bumps the version", () => {
    const first = stepsToGraph(["Step one"], "manual");
    const second = stepsToGraph(["Step one", "Step two"], "manual");

    setMockGraphOverride("wf_1", { graph: first, name: "Edited" });
    setMockGraphOverride("wf_1", { graph: second, name: "Edited" });

    const override = getMockOverride("wf_1");
    expect(override?.name).toBe("Edited");
    expect(override?.version).toBe(2);
    expect(override?.graph.nodes).toHaveLength(3);
    expect(getMockOverride("missing")).toBeNull();
  });

  it("migrates legacy records without a graph", () => {
    store.set(
      STORAGE_KEY,
      JSON.stringify({
        created: [
          {
            id: "local_legacy",
            name: "Legacy",
            slug: "legacy",
            status: "paused",
            trigger: "webhook",
            steps: ["First", "Second"],
            triggerDetail: null,
            createdAt: new Date(0).toISOString(),
          },
        ],
        deletedMockIds: [],
        statusOverrides: {},
        graphOverrides: {},
      }),
    );

    const record = loadLocalState().created[0];
    expect(record?.steps).toEqual(["First", "Second"]);
    expect(record?.graph).toBeUndefined();
  });

  it("discards a corrupt graph value but keeps the record", () => {
    store.set(
      STORAGE_KEY,
      JSON.stringify({
        created: [
          {
            id: "local_bad",
            name: "Bad",
            slug: "bad",
            status: "paused",
            trigger: "manual",
            steps: [],
            triggerDetail: null,
            createdAt: new Date(0).toISOString(),
            graph: "not a graph",
          },
        ],
        deletedMockIds: [],
        statusOverrides: {},
        graphOverrides: {},
      }),
    );

    const record = loadLocalState().created[0];
    expect(record?.id).toBe("local_bad");
    expect(record?.graph).toBeUndefined();
  });

  it("returns an empty state when storage is unreadable", () => {
    store.set(STORAGE_KEY, "{ not json");
    expect(loadLocalState().created).toHaveLength(0);
  });
});

describe("slug helpers", () => {
  it("slugs names and derives copy slugs", () => {
    expect(makeSlug("My Flow!")).toBe("my-flow");
    expect(nextCopySlug("my-flow", [])).toBe("my-flow-copy");
    expect(nextCopySlug("my-flow", ["my-flow-copy"])).toBe("my-flow-copy-2");
    expect(nextCopySlug("my-flow", ["my-flow-copy", "my-flow-copy-2"])).toBe(
      "my-flow-copy-3",
    );
  });
});
