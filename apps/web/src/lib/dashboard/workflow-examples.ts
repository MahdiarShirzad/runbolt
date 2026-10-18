import { cloneGraph, createEdge, createNode } from "./workflow-graph";
import type { WorkflowGraph } from "./workflow-graph";

/**
 * Ready-made demo workflows.
 *
 * These are frontend prototypes used to seed the editor with a realistic graph.
 * They are clearly labelled as demo data in the UI and are never executed by a
 * real engine — the deterministic preview in `workflow-run.ts` simulates a run.
 */

export interface WorkflowExample {
  name: string;
  description: string;
  build: () => WorkflowGraph;
}

const orderFulfillment = (): WorkflowGraph => ({
  nodes: [
    createNode("webhook_trigger", { x: 40, y: 240 }, {
      id: "webhook_trigger_1",
      label: "Order received",
      config: { path: "order-created", method: "POST" },
    }),
    createNode("action", { x: 340, y: 240 }, {
      id: "action_validate",
      label: "Validate Order",
      config: { title: "Validate Order", sourceStep: "Validate Order" },
    }),
    createNode("if_else", { x: 640, y: 240 }, {
      id: "if_else_1",
      label: "Is Order Valid?",
      config: {
        left: "{{ steps.validate.data.valid }}",
        operator: "equals",
        right: "true",
      },
    }),
    createNode("data_mapping", { x: 940, y: 120 }, {
      id: "data_mapping_1",
      label: "Transform Order Data",
      config: { mode: "map" },
    }),
    createNode("send_notification", { x: 1240, y: 120 }, {
      id: "send_notification_1",
      label: "Send Notification",
      config: {
        channel: "email",
        target: "fulfillment@example.com",
        message: "Order {{ steps.trigger.data.id }} is ready to fulfill.",
      },
    }),
    createNode("log", { x: 940, y: 380 }, {
      id: "log_1",
      label: "Log Validation Error",
      config: { message: "Order validation failed", level: "error" },
    }),
  ],
  edges: [
    createEdge("webhook_trigger_1", "action_validate", { id: "edge_1" }),
    createEdge("action_validate", "if_else_1", { id: "edge_2" }),
    createEdge("if_else_1", "data_mapping_1", { id: "edge_3", sourceHandle: "true" }),
    createEdge("data_mapping_1", "send_notification_1", { id: "edge_4" }),
    createEdge("if_else_1", "log_1", { id: "edge_5", sourceHandle: "false" }),
  ],
});

export const ORDER_FULFILLMENT_EXAMPLE: WorkflowExample = {
  name: "Order Fulfillment",
  description:
    "Validate incoming orders and notify the team when one is ready to fulfill. Demo data.",
  build: orderFulfillment,
};

/** A fresh copy of the Order Fulfillment demo graph. */
export function orderFulfillmentGraph(): WorkflowGraph {
  return cloneGraph(ORDER_FULFILLMENT_EXAMPLE.build());
}
