/**
 * Webhook endpoints + deliveries — isolated mock adapter.
 *
 * The Runbolt API does not expose a webhooks/events endpoint yet, so the
 * data below is deterministic sample data derived from the same workflow
 * and execution history the rest of the dashboard uses. Endpoint URLs use
 * the reserved `.invalid` TLD (RFC 2606) so they can never be mistaken for
 * live, usable endpoints.
 *
 * TODO(api): replace the fetchers with real requests once the events API
 * ships, and delete the generators below:
 *   getWebhookEndpoints    → `GET /v1/webhooks`
 *   getWebhookEndpoint     → `GET /v1/webhooks/:id`
 *   getWebhookDeliveries   → `GET /v1/webhooks/:id/deliveries`
 * Creation, enable/disable, editing, secret rotation, and retry are NOT
 * modeled here on purpose — they require backend endpoints that do not
 * exist. UI surfaces must show honest unavailable states for those.
 */

import { getExecutions, getWorkflows } from "./data";
import type { Execution } from "./types";

export type WebhookEndpointStatus = "active" | "disabled";

export type WebhookAuthMethod = "hmac-sha256" | "none";

/**
 * Delivery lifecycle — deliberately distinguishes requests that reached
 * workflow processing from ones that were rejected or dropped:
 *   processed → an execution ran and finished successfully
 *   failed    → an execution ran and finished with an error
 *   rejected  → refused before processing (e.g. bad signature) — no execution
 *   dropped   → endpoint was disabled when the request arrived — no execution
 */
export type WebhookDeliveryStatus = "processed" | "failed" | "rejected" | "dropped";

export interface WebhookEndpoint {
  id: string;
  name: string;
  description: string;
  workflowId: string;
  workflowSlug: string;
  workflowName: string;
  status: WebhookEndpointStatus;
  /** Placeholder URL on the reserved `.invalid` TLD — never live. */
  url: string;
  /** URL with the secret path segment masked, safe for list views. */
  urlMasked: string;
  authMethod: WebhookAuthMethod;
  /** Masked signing-secret hint — the full value is never present here. */
  secretHint: string;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp of the last received request, or null. */
  lastEventAt: string | null;
}

export interface WebhookHeader {
  name: string;
  /** Pre-sanitized value — secrets and cookies are already redacted. */
  value: string;
  redacted: boolean;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  receivedAt: string;
  status: WebhookDeliveryStatus;
  /** Present only when the request produced an execution. */
  executionId: string | null;
  workflowSlug: string;
  durationMs: number | null;
  /** Failure summary for failed/rejected/dropped deliveries. */
  error: string | null;
  method: "POST";
  contentType: string;
  headers: WebhookHeader[];
  /** Sanitized sample payload. */
  payload: Record<string, unknown>;
}

function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface EndpointSeed {
  id: string;
  name: string;
  description: string;
  workflowSlug: string;
  pathToken: string;
  secretTail: string;
  status: WebhookEndpointStatus;
  authMethod: WebhookAuthMethod;
  createdMinutesAgo: number;
  payload: Record<string, unknown>;
}

const ENDPOINT_SEEDS: EndpointSeed[] = [
  {
    id: "wh_order_fulfillment",
    name: "Order fulfillment events",
    description: "Receives order.created events from the storefront and starts fulfillment.",
    workflowSlug: "order-fulfillment",
    pathToken: "ord_7k2m9x",
    secretTail: "3f9a",
    status: "active",
    authMethod: "hmac-sha256",
    createdMinutesAgo: 60 * 24 * 90,
    payload: {
      event: "order.created",
      order_id: "ord_10482",
      customer_id: "cus_88213",
      total_cents: 12900,
      currency: "USD",
    },
  },
  {
    id: "wh_slack_alerts",
    name: "Slack alert intake",
    description: "Accepts signed events from the monitoring Slack app for triage.",
    workflowSlug: "slack-alert-triage",
    pathToken: "alt_4p1w8e",
    secretTail: "b217",
    status: "active",
    authMethod: "hmac-sha256",
    createdMinutesAgo: 60 * 24 * 45,
    payload: {
      event: "alert.received",
      source: "datadog",
      severity: "warning",
      title: "Elevated 5xx rate on checkout-api",
      monitor_id: "mon_4412",
    },
  },
  {
    id: "wh_github_issues",
    name: "GitHub issues",
    description: "Receives GitHub issues webhook events for the triage workflow.",
    workflowSlug: "github-issue-triage",
    pathToken: "ghk_9d4c2v",
    secretTail: "c08e",
    status: "active",
    authMethod: "hmac-sha256",
    createdMinutesAgo: 60 * 24 * 30,
    payload: {
      action: "opened",
      issue: { number: 812, title: "Flaky nightly export step", labels: [] },
      repository: { full_name: "acmelabs/runbolt-exporter" },
    },
  },
  {
    id: "wh_zendesk_legacy",
    name: "Legacy Zendesk bridge",
    description: "Disabled endpoint from the retired Zendesk integration — kept for delivery history.",
    workflowSlug: "legacy-zendesk-bridge",
    pathToken: "zd_0h5n3q",
    secretTail: "91d4",
    status: "disabled",
    authMethod: "none",
    createdMinutesAgo: 60 * 24 * 200,
    payload: {
      event: "ticket.created",
      ticket_id: 44190,
      priority: "normal",
    },
  },
];

function maskUrl(seed: EndpointSeed): string {
  return `https://hooks.example.invalid/e/${seed.pathToken.slice(0, 4)}••••${seed.pathToken.slice(-2)}`;
}

function fullUrl(seed: EndpointSeed): string {
  return `https://hooks.example.invalid/e/${seed.pathToken}`;
}

function deliveryHeaders(seed: EndpointSeed, deliveryId: string): WebhookHeader[] {
  return [
    { name: "content-type", value: "application/json", redacted: false },
    { name: "user-agent", value: "ExampleWebhook/1.0", redacted: false },
    { name: "x-runbolt-delivery", value: deliveryId, redacted: false },
    {
      name: "x-runbolt-signature",
      value:
        seed.authMethod === "hmac-sha256"
          ? `sha256=••••${seed.secretTail}`
          : "not configured",
      redacted: seed.authMethod === "hmac-sha256",
    },
    { name: "authorization", value: "[redacted]", redacted: true },
    { name: "cookie", value: "[redacted]", redacted: true },
  ];
}

interface BuiltEndpoint {
  endpoint: WebhookEndpoint;
  seed: EndpointSeed;
}

async function buildEndpoints(): Promise<BuiltEndpoint[]> {
  const workflows = await getWorkflows();
  const now = Date.now();

  const built: BuiltEndpoint[] = [];
  for (const seed of ENDPOINT_SEEDS) {
    const workflow = workflows.find((w) => w.slug === seed.workflowSlug);
    if (!workflow) continue;
    built.push({
      seed,
      endpoint: {
        id: seed.id,
        name: seed.name,
        description: seed.description,
        workflowId: workflow.id,
        workflowSlug: workflow.slug,
        workflowName: workflow.name,
        status: seed.status,
        url: fullUrl(seed),
        urlMasked: maskUrl(seed),
        authMethod: seed.authMethod,
        secretHint:
          seed.authMethod === "hmac-sha256"
            ? `whsec_••••••••${seed.secretTail}`
            : "—",
        createdAt: new Date(now - seed.createdMinutesAgo * 60_000).toISOString(),
        lastEventAt: null,
      },
    });
  }
  return built;
}

/**
 * Deliveries for one endpoint — recent webhook-trigger executions from the
 * unified history are linked as processed/failed deliveries; signature
 * rejections and drops while disabled are added as honest no-execution
 * records.
 */
async function buildDeliveriesFor(
  built: BuiltEndpoint,
  executions: Execution[],
): Promise<WebhookDelivery[]> {
  const { endpoint, seed } = built;
  const rand = mulberry32(hashString(seed.id) ^ 0x5e17);
  const deliveries: WebhookDelivery[] = [];

  const runs = executions
    .filter((e) => e.workflowId === endpoint.workflowId && e.trigger === "webhook")
    .slice(0, 8);

  for (const run of runs) {
    const status: WebhookDeliveryStatus =
      run.status === "success"
        ? "processed"
        : run.status === "failed"
          ? "failed"
          : run.status === "cancelled"
            ? "rejected"
            : "processed";
    const id = `whd_${hashString(`${seed.id}#${run.id}`).toString(16)}`;
    deliveries.push({
      id,
      endpointId: endpoint.id,
      receivedAt: run.startedAt,
      status,
      executionId:
        status === "processed" || status === "failed" ? run.id : null,
      workflowSlug: endpoint.workflowSlug,
      durationMs: run.durationMs,
      error:
        status === "failed"
          ? "Workflow execution finished with an error."
          : status === "rejected"
            ? "Request rejected during processing — no execution created."
            : null,
      method: "POST",
      contentType: "application/json",
      headers: deliveryHeaders(seed, id),
      payload: seed.payload,
    });
  }

  // A couple of signature rejections on secured endpoints — no execution.
  if (seed.authMethod === "hmac-sha256" && endpoint.status === "active") {
    for (let i = 0; i < 2; i++) {
      const id = `whd_${hashString(`${seed.id}#rej${i}`).toString(16)}`;
      const at = Date.now() - Math.round((2 + rand() * 40) * 3_600_000);
      deliveries.push({
        id,
        endpointId: endpoint.id,
        receivedAt: new Date(at).toISOString(),
        status: "rejected",
        executionId: null,
        workflowSlug: endpoint.workflowSlug,
        durationMs: null,
        error: "Signature verification failed — payload discarded before processing.",
        method: "POST",
        contentType: "application/json",
        headers: deliveryHeaders(seed, id),
        payload: seed.payload,
      });
    }
  }

  // Requests that arrived while the endpoint was disabled — no execution.
  if (endpoint.status === "disabled") {
    for (let i = 0; i < 3; i++) {
      const id = `whd_${hashString(`${seed.id}#drop${i}`).toString(16)}`;
      const at = Date.now() - Math.round((24 + i * 36) * 3_600_000);
      deliveries.push({
        id,
        endpointId: endpoint.id,
        receivedAt: new Date(at).toISOString(),
        status: "dropped",
        executionId: null,
        workflowSlug: endpoint.workflowSlug,
        durationMs: null,
        error: "Endpoint was disabled when the request arrived — no execution created.",
        method: "POST",
        contentType: "application/json",
        headers: deliveryHeaders(seed, id),
        payload: seed.payload,
      });
    }
  }

  deliveries.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  if (deliveries.length > 0) {
    endpoint.lastEventAt = deliveries[0].receivedAt;
  }
  return deliveries;
}

export async function getWebhookEndpoints(): Promise<WebhookEndpoint[]> {
  const built = await buildEndpoints();
  const executions = await getExecutions();
  for (const item of built) {
    await buildDeliveriesFor(item, executions);
  }
  return built.map((item) => item.endpoint);
}

export async function getWebhookEndpoint(id: string): Promise<WebhookEndpoint | null> {
  const endpoints = await getWebhookEndpoints();
  return endpoints.find((endpoint) => endpoint.id === id) ?? null;
}

export async function getWebhookDeliveries(endpointId: string): Promise<WebhookDelivery[]> {
  const built = await buildEndpoints();
  const match = built.find((item) => item.endpoint.id === endpointId);
  if (!match) return [];
  const executions = await getExecutions();
  return buildDeliveriesFor(match, executions);
}

export const WEBHOOK_DELIVERY_STATUS_LABELS: Record<WebhookDeliveryStatus, string> = {
  processed: "Processed",
  failed: "Failed",
  rejected: "Rejected",
  dropped: "Dropped",
};
