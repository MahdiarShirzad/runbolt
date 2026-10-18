import { describe, expect, it } from "vitest";
import {
  buildWorkflowDefinition,
  serializeWorkflowDefinition,
} from "./workflow-definition";
import { createEdge, createNode } from "./workflow-graph";
import type { WorkflowGraph } from "./workflow-graph";

function graphWithSecret(): WorkflowGraph {
  const trigger = createNode("webhook_trigger", { x: 0, y: 0 }, {
    id: "t",
    config: { path: "orders", method: "POST", secret: "whsec_supersecret" },
  });
  const log = createNode("log", { x: 300, y: 0 }, { id: "l" });
  return { nodes: [trigger, log], edges: [createEdge("t", "l", { id: "e" })] };
}

describe("buildWorkflowDefinition", () => {
  it("derives the app-level model from the graph", () => {
    const definition = buildWorkflowDefinition({
      name: "Orders",
      description: "Handle orders",
      status: "paused",
      graph: graphWithSecret(),
    });

    expect(definition.version).toBe(1);
    expect(definition.name).toBe("Orders");
    expect(definition.status).toBe("paused");
    expect(definition.nodes).toHaveLength(2);
    expect(definition.nodes[0]).toMatchObject({
      id: "t",
      type: "webhook_trigger",
      name: "Webhook trigger",
    });
    expect(definition.edges[0]).toMatchObject({
      id: "e",
      source: "t",
      target: "l",
      sourceHandle: "out",
      targetHandle: "in",
    });
  });

  it("redacts secret-like config values", () => {
    const definition = buildWorkflowDefinition({
      name: "Orders",
      description: "",
      status: "paused",
      graph: graphWithSecret(),
    });
    const config = definition.nodes[0]!.config;
    expect(config.secret).toBe("••••••");
    expect(config.path).toBe("orders");
  });

  it("serializes to formatted JSON that round-trips", () => {
    const definition = buildWorkflowDefinition({
      name: "Orders",
      description: "",
      status: "paused",
      graph: graphWithSecret(),
    });
    const json = serializeWorkflowDefinition(definition);
    expect(json).toContain("\n");
    expect(JSON.parse(json)).toEqual(definition);
    expect(json).not.toContain("whsec_supersecret");
  });
});
