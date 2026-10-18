import { describe, expect, it } from "vitest";
import { orderFulfillmentGraph, ORDER_FULFILLMENT_EXAMPLE } from "./workflow-examples";
import { validateGraph } from "./workflow-graph";
import { runWorkflowGraph } from "./workflow-run";

describe("Order Fulfillment example", () => {
  it("is a valid, runnable demo graph", () => {
    const graph = orderFulfillmentGraph();
    expect(graph.nodes).toHaveLength(6);
    expect(graph.edges).toHaveLength(5);

    const validation = validateGraph(graph);
    expect(validation.saveable).toBe(true);
    expect(validation.runnable).toBe(true);
  });

  it("has metadata that is clearly labelled as demo data", () => {
    expect(ORDER_FULFILLMENT_EXAMPLE.name).toBe("Order Fulfillment");
    expect(ORDER_FULFILLMENT_EXAMPLE.description.toLowerCase()).toContain("demo");
  });

  it("runs without calling a real engine", () => {
    const result = runWorkflowGraph(orderFulfillmentGraph(), { seed: 11, startedAt: 0 });
    expect(result.ok).toBe(true);
    expect(result.status).toBe("success");
    expect(result.steps.length).toBe(6);
  });

  it("returns an independent copy on each call", () => {
    const first = orderFulfillmentGraph();
    first.nodes[0]!.position.x = 9999;
    first.nodes.pop();
    const second = orderFulfillmentGraph();
    expect(second.nodes).toHaveLength(6);
    expect(second.nodes[0]!.position.x).not.toBe(9999);
  });
});
