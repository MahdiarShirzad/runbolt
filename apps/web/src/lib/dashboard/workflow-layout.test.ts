import { describe, expect, it } from "vitest";
import { autoLayoutGraph } from "./workflow-layout";
import { orderFulfillmentGraph } from "./workflow-examples";
import type { WorkflowGraph } from "./workflow-graph";

describe("autoLayoutGraph", () => {
  it("preserves nodes and edges while repositioning", () => {
    const graph = orderFulfillmentGraph();
    const layout = autoLayoutGraph(graph);
    expect(layout.nodes.map((node) => node.id).sort()).toEqual(
      graph.nodes.map((node) => node.id).sort(),
    );
    expect(layout.edges).toEqual(graph.edges);
  });

  it("places downstream nodes to the right of upstream nodes", () => {
    const layout = autoLayoutGraph(orderFulfillmentGraph());
    const x = (id: string) => layout.nodes.find((node) => node.id === id)!.position.x;
    expect(x("webhook_trigger_1")).toBeLessThan(x("action_validate"));
    expect(x("action_validate")).toBeLessThan(x("if_else_1"));
    expect(x("if_else_1")).toBeLessThan(x("data_mapping_1"));
    expect(x("data_mapping_1")).toBeLessThan(x("send_notification_1"));
  });

  it("stacks siblings in the same column without overlap", () => {
    const layout = autoLayoutGraph(orderFulfillmentGraph());
    const dataMapping = layout.nodes.find((n) => n.id === "data_mapping_1")!;
    const log = layout.nodes.find((n) => n.id === "log_1")!;
    expect(dataMapping.position.x).toBe(log.position.x);
    expect(dataMapping.position.y).not.toBe(log.position.y);
  });

  it("is deterministic", () => {
    expect(autoLayoutGraph(orderFulfillmentGraph())).toEqual(
      autoLayoutGraph(orderFulfillmentGraph()),
    );
  });

  it("handles an empty graph", () => {
    const empty: WorkflowGraph = { nodes: [], edges: [] };
    expect(autoLayoutGraph(empty)).toEqual(empty);
  });
});
