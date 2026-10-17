import { describe, expect, it } from "vitest";
import {
  createEdge,
  createNode,
  createStarterGraph,
  getInputHandle,
  getOutputHandles,
  hasCycle,
  parseWorkflowGraph,
  resetIdCounter,
  stepsToGraph,
  switchCases,
  validateConnection,
  validateGraph,
  wouldCreateCycle,
} from "./workflow-graph";
import type { WorkflowGraph } from "./workflow-graph";

function manualGraph(): { graph: WorkflowGraph; triggerId: string; logId: string } {
  resetIdCounter();
  const trigger = createNode("manual_trigger", { x: 0, y: 0 }, { id: "trigger_1" });
  const log = createNode("log", { x: 300, y: 0 }, { id: "log_1" });
  const edge = createEdge(trigger.id, log.id, { id: "edge_1" });
  return {
    graph: { nodes: [trigger, log], edges: [edge] },
    triggerId: trigger.id,
    logId: log.id,
  };
}

describe("stepsToGraph", () => {
  it("migrates an ordered step list into a chained linear graph", () => {
    const graph = stepsToGraph(["Fetch orders", "Charge card"], "webhook", {
      slug: "orders",
    });

    expect(graph.nodes).toHaveLength(3);
    expect(graph.nodes[0]?.type).toBe("webhook_trigger");
    expect(graph.nodes[0]?.config).toMatchObject({ path: "orders", method: "POST" });
    expect(graph.nodes[1]?.label).toBe("Fetch orders");
    expect(graph.nodes[2]?.label).toBe("Charge card");
    expect(graph.edges).toHaveLength(2);
    expect(graph.edges[0]?.source).toBe(graph.nodes[0]?.id);
    expect(graph.edges[0]?.target).toBe(graph.nodes[1]?.id);
    expect(graph.edges[1]?.target).toBe(graph.nodes[2]?.id);
  });

  it("produces a single trigger node for a starter graph", () => {
    const graph = createStarterGraph("schedule", { triggerDetail: "Every hour" });
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0]?.type).toBe("schedule_trigger");
    expect(graph.nodes[0]?.config).toMatchObject({ preset: "Every hour" });
    expect(graph.edges).toHaveLength(0);
  });
});

describe("parseWorkflowGraph", () => {
  it("drops unknown nodes and edges that reference them", () => {
    const parsed = parseWorkflowGraph({
      nodes: [
        { id: "a", type: "manual_trigger", position: { x: 0, y: 0 } },
        { id: "b", type: "not_a_real_type", position: { x: 0, y: 0 } },
      ],
      edges: [{ id: "e", source: "a", target: "b" }],
    });

    expect(parsed?.nodes).toHaveLength(1);
    expect(parsed?.edges).toHaveLength(0);
  });

  it("fills defaults and rejects non-objects", () => {
    expect(parseWorkflowGraph(null)).toBeNull();
    expect(parseWorkflowGraph("graph")).toBeNull();

    const parsed = parseWorkflowGraph({
      nodes: [{ id: "a", type: "http_request", position: { x: 1, y: 2 } }],
      edges: [{ source: "a", target: "a" }],
    });
    expect(parsed?.nodes[0]?.config).toMatchObject({ method: "GET", retries: 2 });
  });

  it("round-trips through a defensive reparse", () => {
    const graph = stepsToGraph(["One", "Two"], "manual");
    const reparsed = parseWorkflowGraph(JSON.parse(JSON.stringify(graph)));
    expect(reparsed).toEqual(graph);
  });
});

describe("handles", () => {
  it("gives triggers no input and branches named outputs", () => {
    const trigger = createNode("manual_trigger", { x: 0, y: 0 });
    const condition = createNode("if_else", { x: 0, y: 0 });
    const router = createNode("switch", { x: 0, y: 0 }, {
      config: { cases: "created\nupdated" },
    });

    expect(getInputHandle(trigger)).toBeNull();
    expect(getInputHandle(condition)).toBe("in");
    expect(getOutputHandles(condition).map((handle) => handle.id)).toEqual([
      "true",
      "false",
    ]);
    expect(getOutputHandles(router).map((handle) => handle.id)).toEqual([
      "case:0",
      "case:1",
      "default",
    ]);
    expect(getOutputHandles(trigger).map((handle) => handle.id)).toEqual(["out"]);
  });

  it("parses switch cases from a newline-separated config value", () => {
    const router = createNode("switch", { x: 0, y: 0 }, {
      config: { cases: "  created \n\n updated\n" },
    });
    expect(switchCases(router)).toEqual(["created", "updated"]);
  });
});

describe("validateGraph", () => {
  it("flags an empty graph as not runnable but still saveable", () => {
    const result = validateGraph({ nodes: [], edges: [] });
    expect(result.saveable).toBe(true);
    expect(result.runnable).toBe(false);
    expect(result.issues.some((issue) => issue.code === "empty")).toBe(true);
  });

  it("treats a disconnected trigger as a run blocker", () => {
    const trigger = createNode("manual_trigger", { x: 0, y: 0 }, { id: "t" });
    const result = validateGraph({ nodes: [trigger], edges: [] });
    expect(result.saveable).toBe(true);
    expect(result.runnable).toBe(false);
    expect(result.issues.some((issue) => issue.code === "no-entry-edge")).toBe(true);
  });

  it("accepts a connected trigger-to-step graph", () => {
    const { graph } = manualGraph();
    const result = validateGraph(graph);
    expect(result.saveable).toBe(true);
    expect(result.runnable).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("rejects a cycle as an error that blocks saving", () => {
    const a = createNode("log", { x: 0, y: 0 }, { id: "a" });
    const b = createNode("log", { x: 0, y: 0 }, { id: "b" });
    const graph: WorkflowGraph = {
      nodes: [a, b],
      edges: [
        createEdge("a", "b", { id: "e1" }),
        createEdge("b", "a", { id: "e2" }),
      ],
    };
    expect(hasCycle(graph)).toBe(true);
    const result = validateGraph(graph);
    expect(result.saveable).toBe(false);
    expect(result.issues.some((issue) => issue.code === "cycle")).toBe(true);
  });

  it("warns when a required config field is blank", () => {
    resetIdCounter();
    const trigger = createNode("manual_trigger", { x: 0, y: 0 }, { id: "t" });
    const request = createNode("http_request", { x: 300, y: 0 }, { id: "r" });
    const graph: WorkflowGraph = {
      nodes: [trigger, request],
      edges: [createEdge("t", "r", { id: "e" })],
    };
    const result = validateGraph(graph);
    expect(result.saveable).toBe(true);
    expect(result.runnable).toBe(false);
    expect(result.issues.some((issue) => issue.code === "missing-config")).toBe(true);
  });
});

describe("validateConnection", () => {
  it("accepts a valid connection and rejects the invalid cases", () => {
    const { graph } = manualGraph();
    const extra = createNode("log", { x: 0, y: 200 }, { id: "log_2" });

    expect(validateConnection(graph, { source: "trigger_1", target: "log_1" }).ok).toBe(
      false,
    );
    expect(validateConnection(graph, { source: "log_1", target: "log_1" }).ok).toBe(false);
    expect(validateConnection(graph, { source: "log_1", target: "trigger_1" }).ok).toBe(
      false,
    );
    expect(validateConnection(graph, { source: "missing", target: "log_1" }).ok).toBe(
      false,
    );

    const withExtra = { nodes: [...graph.nodes, extra], edges: graph.edges };
    expect(
      validateConnection(withExtra, { source: "log_1", target: "log_2" }).ok,
    ).toBe(true);
    expect(wouldCreateCycle(withExtra, "log_2", "trigger_1")).toBe(false);
  });
});

describe("id generation", () => {
  it("never reuses an existing id", () => {
    resetIdCounter();
    const first = createNode("log", { x: 0, y: 0 }, { existing: [] });
    const second = createNode("log", { x: 0, y: 0 }, { existing: [first.id] });
    expect(first.id).not.toBe(second.id);
  });
});
