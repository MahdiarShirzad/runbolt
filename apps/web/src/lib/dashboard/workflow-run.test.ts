import { describe, expect, it } from "vitest";
import { createEdge, createNode, resetIdCounter } from "./workflow-graph";
import type { WorkflowGraph } from "./workflow-graph";
import { runWorkflowGraph } from "./workflow-run";

function linearGraph(): WorkflowGraph {
  const trigger = createNode("manual_trigger", { x: 0, y: 0 }, { id: "trigger_1" });
  const log = createNode("log", { x: 300, y: 0 }, { id: "log_1" });
  return {
    nodes: [trigger, log],
    edges: [createEdge("trigger_1", "log_1", { id: "edge_1" })],
  };
}

function branchGraph(): WorkflowGraph {
  const trigger = createNode("manual_trigger", { x: 0, y: 0 }, { id: "trigger_1" });
  const condition = createNode("if_else", { x: 300, y: 0 }, {
    id: "if_1",
    config: { left: "5", operator: "equals", right: "5" },
  });
  const onTrue = createNode("log", { x: 600, y: 0 }, { id: "true_1" });
  const onFalse = createNode("log", { x: 600, y: 200 }, { id: "false_1" });
  return {
    nodes: [trigger, condition, onTrue, onFalse],
    edges: [
      createEdge("trigger_1", "if_1", { id: "edge_1", sourceHandle: "out" }),
      createEdge("if_1", "true_1", { id: "edge_2", sourceHandle: "true" }),
      createEdge("if_1", "false_1", { id: "edge_3", sourceHandle: "false" }),
    ],
  };
}

describe("runWorkflowGraph", () => {
  it("runs a linear graph successfully in topological order", () => {
    resetIdCounter();
    const result = runWorkflowGraph(linearGraph(), { seed: 42, startedAt: 0 });

    expect(result.ok).toBe(true);
    expect(result.status).toBe("success");
    expect(result.steps.map((step) => step.nodeId)).toEqual(["trigger_1", "log_1"]);
    expect(result.counts).toEqual({ success: 2, failed: 0, running: 0, skipped: 0 });
    expect(result.startedAt).toBe(new Date(0).toISOString());
  });

  it("is deterministic for the same seed", () => {
    resetIdCounter();
    const first = runWorkflowGraph(linearGraph(), { seed: 7, startedAt: 0 });
    const second = runWorkflowGraph(linearGraph(), { seed: 7, startedAt: 0 });
    expect(second.steps).toEqual(first.steps);
    expect(second.durationMs).toBe(first.durationMs);
  });

  it("marks the target node failed and the run failed", () => {
    resetIdCounter();
    const result = runWorkflowGraph(linearGraph(), { seed: 1, failNodeId: "log_1" });
    expect(result.ok).toBe(true);
    expect(result.status).toBe("failed");
    expect(result.counts.failed).toBe(1);
    const failed = result.steps.find((step) => step.nodeId === "log_1");
    expect(failed?.status).toBe("failed");
  });

  it("prunes the branch that the condition does not select", () => {
    resetIdCounter();
    const result = runWorkflowGraph(branchGraph(), { seed: 3 });

    expect(result.ok).toBe(true);
    const byId = new Map(result.steps.map((step) => [step.nodeId, step.status]));
    expect(byId.get("true_1")).toBe("success");
    expect(byId.get("false_1")).toBe("skipped");
    expect(result.counts.skipped).toBe(1);
  });

  it("refuses to run an empty or invalid graph", () => {
    const empty = runWorkflowGraph({ nodes: [], edges: [] });
    expect(empty.ok).toBe(false);
    expect(empty.steps).toHaveLength(0);

    resetIdCounter();
    const triggerA = createNode("manual_trigger", { x: 0, y: 0 }, { id: "a" });
    const triggerB = createNode("manual_trigger", { x: 0, y: 0 }, { id: "b" });
    const multi = runWorkflowGraph({ nodes: [triggerA, triggerB], edges: [] });
    expect(multi.ok).toBe(false);
    expect(multi.error).toBeTruthy();
  });
});
