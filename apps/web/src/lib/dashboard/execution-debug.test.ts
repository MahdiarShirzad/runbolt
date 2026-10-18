import { describe, expect, it } from "vitest";
import {
  buildExecutionDebug,
  buildExecutionLogs,
  executionGraphFor,
  workflowSlugFor,
} from "./execution-debug";
import type { Execution, ExecutionStatus, ExecutionStep } from "./types";

function step(
  name: string,
  status: ExecutionStatus,
  durationMs: number | null,
  detail?: string,
): ExecutionStep {
  return { name, status, durationMs, ...(detail ? { detail } : {}) };
}

function execution(overrides: Partial<Execution> & { steps: ExecutionStep[] }): Execution {
  return {
    id: "run_test",
    workflowId: "wf_order-fulfillment",
    workflowName: "Order fulfillment",
    status: "success",
    trigger: "webhook",
    startedAt: new Date(1_700_000_000_000).toISOString(),
    finishedAt: new Date(1_700_000_001_240).toISOString(),
    durationMs: 1240,
    attempt: 1,
    ...overrides,
  };
}

describe("workflowSlugFor", () => {
  it("strips the wf_ prefix", () => {
    expect(workflowSlugFor(execution({ steps: [] }))).toBe("order-fulfillment");
  });
});

describe("executionGraphFor", () => {
  it("returns the curated branch graph for known workflows", () => {
    const graph = executionGraphFor(
      execution({ workflowId: "wf_nightly-invoice-export", steps: [] }),
    );
    expect(graph.nodes.some((node) => node.type === "if_else")).toBe(true);
  });

  it("falls back to a linear graph for other workflows", () => {
    const graph = executionGraphFor(
      execution({
        workflowId: "wf_customer-sync",
        workflowName: "Customer sync",
        trigger: "schedule",
        steps: [],
      }),
    );
    const types = graph.nodes.map((node) => node.type);
    expect(types[0]).toBe("schedule_trigger");
    expect(types.every((type) => type === "schedule_trigger" || type === "action")).toBe(true);
  });
});

describe("buildExecutionDebug — failed run", () => {
  const failed = execution({
    status: "failed",
    attempt: 3,
    steps: [
      step("receive-order", "success", 120),
      step("charge-card", "failed", 420, "HTTP 502 from upstream after 3 attempts"),
      step("reserve-inventory", "success", 150),
      step("print-label", "success", 120),
      step("notify-customer", "success", 90),
    ],
  });
  const debug = buildExecutionDebug(failed);
  const statusOf = (id: string) => debug.nodes.find((node) => node.nodeId === id)?.status;

  it("marks the failed node and skips everything after it", () => {
    expect(debug.failedNode?.name).toBe("Charge card");
    expect(statusOf("action_2")).toBe("failed");
    expect(statusOf("action_3")).toBe("skipped");
    expect(statusOf("action_4")).toBe("skipped");
    expect(statusOf("action_5")).toBe("skipped");
  });

  it("keeps only the nodes upstream of the failure successful", () => {
    expect(statusOf("webhook_trigger_1")).toBe("success");
    expect(statusOf("action_1")).toBe("success");
    // The condition sits after the failed node, so it never evaluated.
    expect(statusOf("if_else_1")).toBe("skipped");
  });

  it("skips the branch that was not taken", () => {
    expect(statusOf("log_1")).toBe("skipped");
  });

  it("builds a deterministic error with suggestions", () => {
    expect(debug.failedNode?.error?.category).toBe("http_error");
    expect(debug.failedNode?.error?.suggestions.length).toBeGreaterThan(0);
    expect(debug.errorSummary).toContain("502");
  });

  it("records retry attempts", () => {
    expect(debug.failedNode?.attempt).toBe(3);
    expect(debug.failedNode?.attempts).toHaveLength(3);
    expect(debug.failedNode?.attempts[0]?.status).toBe("failed");
  });

  it("does not fabricate output for failed or skipped nodes", () => {
    expect(debug.failedNode?.output).toBeNull();
    expect(debug.nodes.find((node) => node.status === "skipped")?.output).toBeNull();
  });

  it("counts add up to the total", () => {
    const { counts } = debug;
    expect(counts.total).toBe(debug.nodes.length);
    expect(counts.success + counts.failed + counts.skipped + counts.running + counts.pending).toBe(
      counts.total,
    );
  });
});

describe("buildExecutionDebug — conditional branches", () => {
  const failed = execution({
    workflowId: "wf_nightly-invoice-export",
    workflowName: "Invoice export",
    trigger: "schedule",
    status: "failed",
    durationMs: 3410,
    attempt: 3,
    steps: [
      step("query-invoices", "success", 640),
      step("build-csv", "success", 980),
      step("upload-to-s3", "failed", 1410, "HTTP 502 from upstream after 3 attempts"),
      step("slack-recap", "success", 380),
    ],
  });
  const debug = buildExecutionDebug(failed);
  const statusOf = (id: string) => debug.nodes.find((node) => node.nodeId === id)?.status;

  it("evaluates the condition that ran before the failure", () => {
    expect(statusOf("if_else_1")).toBe("success");
  });

  it("skips the node after the failure and the untaken branch", () => {
    expect(statusOf("action_3")).toBe("failed");
    expect(statusOf("action_4")).toBe("skipped");
    expect(statusOf("log_1")).toBe("skipped");
  });
});

describe("buildExecutionDebug — running run", () => {
  it("leaves downstream nodes pending", () => {
    const running = execution({
      workflowId: "wf_lead-enrichment",
      workflowName: "Lead enrichment",
      trigger: "api",
      status: "running",
      durationMs: null,
      finishedAt: null,
      steps: [
        step("lookup-domain", "success", 210),
        step("enrich-firmographics", "running", null),
        step("score-lead", "success", 140),
        step("write-crm", "success", 90),
      ],
    });
    const debug = buildExecutionDebug(running);
    expect(debug.counts.running).toBe(1);
    expect(debug.nodes.find((node) => node.name === "Enrich firmographics")?.status).toBe("running");
  });
});

describe("buildExecutionLogs", () => {
  it("derives a stream with node association and runner boundaries", () => {
    const logs = buildExecutionLogs(
      execution({
        status: "failed",
        steps: [
          step("receive-order", "success", 120),
          step("charge-card", "failed", 420, "HTTP 502 from upstream after 3 attempts"),
          step("reserve-inventory", "success", 150),
          step("print-label", "success", 120),
          step("notify-customer", "success", 90),
        ],
      }),
    );
    expect(logs[0]?.source).toBe("runner");
    expect(logs.some((entry) => entry.level === "error")).toBe(true);
    expect(logs.every((entry) => typeof entry.nodeId === "string")).toBe(true);
    expect(logs.at(-1)?.message).toMatch(/aborted|finished|running/i);
  });
});

describe("determinism", () => {
  it("produces identical output for identical input", () => {
    const run = execution({
      steps: [
        step("receive-order", "success", 120),
        step("charge-card", "failed", 420, "HTTP 502 from upstream after 3 attempts"),
        step("reserve-inventory", "success", 150),
        step("print-label", "success", 120),
        step("notify-customer", "success", 90),
      ],
    });
    expect(buildExecutionDebug(run)).toEqual(buildExecutionDebug(run));
    expect(buildExecutionLogs(run)).toEqual(buildExecutionLogs(run));
  });
});
