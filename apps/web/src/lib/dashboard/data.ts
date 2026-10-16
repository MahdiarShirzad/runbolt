import { formatRelativeTime } from "./format";
import type {
  ActivityPoint,
  ActivitySeries,
  AppNotification,
  Execution,
  ExecutionStep,
  ExecutionStatus,
  MetricSnapshot,
  SessionUser,
  TimeRange,
  TriggerType,
  WorkflowSummary,
  WorkflowStatus,
  WorkspaceSummary,
} from "./types";

/**
 * Dashboard data layer.
 *
 * The Runbolt API does not expose workflows/executions endpoints yet (the
 * NestJS app currently serves a single hello route), so every fetcher below
 * serves deterministic sample data. All sample generation is isolated here —
 * UI components only ever see the typed contracts above.
 *
 * TODO(api): replace each body with a real request once the corresponding
 * endpoint exists, and delete the generators below:
 *   getUser                → session/auth context (`GET /v1/session`)
 *   getWorkspaceSummary    → `GET /v1/workspace/summary`
 *   getActivitySeries      → `GET /v1/executions/stats?range=…`
 *   getMetrics             → derived from the stats endpoint
 *   getRecentExecutions    → `GET /v1/executions?limit=10`
 *   getWorkflows           → `GET /v1/workflows?sort=-updated_at`
 *   getNotifications       → `GET /v1/notifications?limit=5`
 */

const RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

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

const HOUR_SHAPE = [
  0.35, 0.28, 0.24, 0.22, 0.26, 0.4, 0.65, 0.95, 1.15, 1.25, 1.2, 1.1, 1.05,
  1.1, 1.15, 1.1, 1.0, 0.9, 0.85, 0.8, 0.7, 0.6, 0.5, 0.42,
];

const DAY_SHAPE = [0.55, 1.1, 1.15, 1.1, 1.05, 0.95, 0.5];

function bucketCount(range: TimeRange): number {
  if (range === "24h") return 24;
  if (range === "7d") return 7;
  return 30;
}

function rangeStepMs(range: TimeRange): number {
  return range === "24h" ? 3_600_000 : 86_400_000;
}

function buildActivityPoints(range: TimeRange, now: Date): ActivityPoint[] {
  const rand = mulberry32(range === "24h" ? 0x24a1 : range === "7d" ? 0x07d2 : 0x30d3);
  const count = bucketCount(range);
  const stepMs = rangeStepMs(range);
  const base = range === "24h" ? 7 : 132;
  const points: ActivityPoint[] = [];

  for (let i = 0; i < count; i++) {
    const at = new Date(Math.floor(now.getTime() / stepMs) * stepMs - (count - 1 - i) * stepMs);
    const shape =
      range === "24h" ? HOUR_SHAPE[at.getHours()] : DAY_SHAPE[at.getDay()];
    const noise = 0.82 + rand() * 0.36;
    const success = Math.max(0, Math.round(base * shape * noise));
    let failed = rand() < 0.22 ? 1 + Math.floor(rand() * 3) : 0;
    if (rand() < 0.05) failed += 2 + Math.floor(rand() * 4);
    if (failed > success) failed = Math.max(0, Math.floor(success * 0.15));
    points.push({ at: at.toISOString(), success, failed });
  }

  return points;
}

export async function getUser(): Promise<SessionUser | null> {
  // TODO(api): read the authenticated user from the session instead.
  return {
    name: "Alex Rivera",
    email: "alex@acmelabs.dev",
    role: "Owner",
  };
}

export async function getWorkspaceSummary(): Promise<WorkspaceSummary> {
  const workflows = await getWorkflows();
  const series = await getActivitySeries("30d");
  return {
    name: "Acme Labs",
    workflowCount: workflows.length,
    activeWorkflowCount: workflows.filter((w) => w.status === "active").length,
    runsLast30d: series.points.reduce((sum, p) => sum + p.success + p.failed, 0),
  };
}

export async function getActivitySeries(range: TimeRange): Promise<ActivitySeries> {
  return {
    range,
    rangeLabel: RANGE_LABELS[range],
    bucketLabel: range === "24h" ? "hour" : "day",
    points: buildActivityPoints(range, new Date()),
  };
}

export async function getMetrics(range: TimeRange): Promise<MetricSnapshot> {
  const [series, workflows] = await Promise.all([
    getActivitySeries(range),
    getWorkflows(),
  ]);
  const successfulRuns = series.points.reduce((sum, p) => sum + p.success, 0);
  const failedRuns = series.points.reduce((sum, p) => sum + p.failed, 0);
  const totalRuns = successfulRuns + failedRuns;
  return {
    range,
    rangeLabel: RANGE_LABELS[range],
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter((w) => w.status === "active").length,
    pausedWorkflows: workflows.filter((w) => w.status === "paused").length,
    successfulRuns,
    failedRuns,
    totalRuns,
    successRate: totalRuns === 0 ? null : successfulRuns / totalRuns,
  };
}

const EXECUTION_SEEDS: {
  workflowName: string;
  slug: string;
  status: ExecutionStatus;
  trigger: TriggerType;
  minutesAgo: number;
  durationMs: number | null;
  failingStep?: number;
}[] = [
  { workflowName: "Order fulfillment", slug: "order-fulfillment", status: "success", trigger: "webhook", minutesAgo: 3, durationMs: 1240 },
  { workflowName: "Customer sync", slug: "customer-sync", status: "success", trigger: "schedule", minutesAgo: 11, durationMs: 890 },
  { workflowName: "Lead enrichment", slug: "lead-enrichment", status: "running", trigger: "api", minutesAgo: 2, durationMs: null },
  { workflowName: "Invoice export", slug: "nightly-invoice-export", status: "failed", trigger: "schedule", minutesAgo: 48, durationMs: 3410, failingStep: 2 },
  { workflowName: "Slack alert triage", slug: "slack-alert-triage", status: "success", trigger: "webhook", minutesAgo: 95, durationMs: 320 },
  { workflowName: "GitHub issue triage", slug: "github-issue-triage", status: "success", trigger: "webhook", minutesAgo: 140, durationMs: 2150 },
  { workflowName: "Stripe dunning emails", slug: "stripe-dunning-emails", status: "success", trigger: "schedule", minutesAgo: 210, durationMs: 4680 },
  { workflowName: "DB backup verification", slug: "db-backup-verify", status: "failed", trigger: "schedule", minutesAgo: 320, durationMs: 8420, failingStep: 3 },
  { workflowName: "Abandoned cart reminder", slug: "abandoned-cart-reminder", status: "success", trigger: "schedule", minutesAgo: 480, durationMs: 610 },
  { workflowName: "CRM contact import", slug: "crm-contact-import", status: "cancelled", trigger: "manual", minutesAgo: 720, durationMs: 15_200 },
];

function buildSteps(
  seed: (typeof EXECUTION_SEEDS)[number],
  rand: () => number,
): ExecutionStep[] {
  const plan: Record<string, string[]> = {
    "order-fulfillment": ["receive-order", "charge-card", "reserve-inventory", "print-label", "notify-customer"],
    "customer-sync": ["pull-changes", "map-fields", "upsert-contacts"],
    "lead-enrichment": ["lookup-domain", "enrich-firmographics", "score-lead", "write-crm"],
    "nightly-invoice-export": ["query-invoices", "build-csv", "upload-to-s3", "slack-recap"],
    "slack-alert-triage": ["receive-event", "classify", "post-thread"],
    "github-issue-triage": ["receive-webhook", "label-issue", "assign-reviewer"],
    "stripe-dunning-emails": ["list-delinquent", "render-email", "send", "record-event"],
    "db-backup-verify": ["snapshot", "restore-check", "validate-schema", "compare-checksums"],
    "abandoned-cart-reminder": ["find-carts", "render-email", "send"],
    "crm-contact-import": ["parse-upload", "dedupe", "upsert"],
  };
  const names = plan[seed.slug] ?? ["step-1", "step-2", "step-3"];
  return names.map((name, i) => {
    const isFailing = seed.failingStep === i;
    const isLast = i === names.length - 1;
    const status: ExecutionStatus = isFailing
      ? "failed"
      : seed.status === "running" && isLast
        ? "running"
        : seed.status === "cancelled" && i >= names.length - 2
          ? "cancelled"
          : "success";
    const durationMs =
      status === "running"
        ? null
        : Math.max(12, Math.round((seed.durationMs ?? 600) / names.length + (rand() - 0.5) * 180));
    return {
      name,
      status,
      durationMs,
      ...(isFailing ? { detail: "HTTP 502 from upstream after 3 attempts" } : {}),
    };
  });
}

export async function getRecentExecutions(limit = 10): Promise<Execution[]> {
  const rand = mulberry32(0xec91);
  const now = Date.now();
  return EXECUTION_SEEDS.slice(0, limit).map((seed, index) => {
    const startedAt = new Date(now - seed.minutesAgo * 60_000);
    const running = seed.status === "running";
    return {
      id: `run_${(0x9f2000 + index * 0x1d37).toString(16)}`,
      workflowId: `wf_${seed.slug}`,
      workflowName: seed.workflowName,
      status: seed.status,
      trigger: seed.trigger,
      startedAt: startedAt.toISOString(),
      finishedAt: running
        ? null
        : new Date(startedAt.getTime() + (seed.durationMs ?? 0)).toISOString(),
      durationMs: seed.durationMs,
      steps: buildSteps(seed, rand),
    };
  });
}

const WORKFLOW_SEEDS: {
  name: string;
  slug: string;
  status: WorkflowStatus;
  trigger: TriggerType;
  lastRunMinutesAgo: number | null;
  lastRunStatus: ExecutionStatus | null;
  runsLast30d: number;
}[] = [
  { name: "Order fulfillment", slug: "order-fulfillment", status: "active", trigger: "webhook", lastRunMinutesAgo: 3, lastRunStatus: "success", runsLast30d: 1840 },
  { name: "Customer sync", slug: "customer-sync", status: "active", trigger: "schedule", lastRunMinutesAgo: 11, lastRunStatus: "success", runsLast30d: 730 },
  { name: "Lead enrichment", slug: "lead-enrichment", status: "active", trigger: "api", lastRunMinutesAgo: 2, lastRunStatus: "running", runsLast30d: 412 },
  { name: "Nightly invoice export", slug: "nightly-invoice-export", status: "active", trigger: "schedule", lastRunMinutesAgo: 48, lastRunStatus: "failed", runsLast30d: 30 },
  { name: "Slack alert triage", slug: "slack-alert-triage", status: "active", trigger: "webhook", lastRunMinutesAgo: 95, lastRunStatus: "success", runsLast30d: 2890 },
  { name: "GitHub issue triage", slug: "github-issue-triage", status: "active", trigger: "webhook", lastRunMinutesAgo: 140, lastRunStatus: "success", runsLast30d: 640 },
  { name: "Stripe dunning emails", slug: "stripe-dunning-emails", status: "active", trigger: "schedule", lastRunMinutesAgo: 210, lastRunStatus: "success", runsLast30d: 92 },
  { name: "DB backup verification", slug: "db-backup-verify", status: "paused", trigger: "schedule", lastRunMinutesAgo: 320, lastRunStatus: "failed", runsLast30d: 30 },
  { name: "Abandoned cart reminder", slug: "abandoned-cart-reminder", status: "active", trigger: "schedule", lastRunMinutesAgo: 480, lastRunStatus: "success", runsLast30d: 210 },
  { name: "CRM contact import", slug: "crm-contact-import", status: "active", trigger: "manual", lastRunMinutesAgo: 720, lastRunStatus: "cancelled", runsLast30d: 18 },
  { name: "Legacy Zendesk bridge", slug: "legacy-zendesk-bridge", status: "paused", trigger: "webhook", lastRunMinutesAgo: null, lastRunStatus: null, runsLast30d: 0 },
];

export async function getWorkflows(limit?: number): Promise<WorkflowSummary[]> {
  const now = Date.now();
  const all = WORKFLOW_SEEDS.map((seed) => ({
    id: `wf_${seed.slug}`,
    name: seed.name,
    slug: seed.slug,
    status: seed.status,
    trigger: seed.trigger,
    lastRun:
      seed.lastRunMinutesAgo == null
        ? null
        : {
            status: seed.lastRunStatus as ExecutionStatus,
            at: new Date(now - seed.lastRunMinutesAgo * 60_000).toISOString(),
          },
    runsLast30d: seed.runsLast30d,
  }));
  return limit == null ? all : all.slice(0, limit);
}

export async function getNotifications(): Promise<AppNotification[]> {
  const now = Date.now();
  const minutes = (m: number) => new Date(now - m * 60_000).toISOString();
  // TODO(api): replace with `GET /v1/notifications`.
  return [
    {
      id: "ntf_1",
      kind: "error",
      title: "Invoice export failed",
      body: "nightly-invoice-export failed at upload-to-s3 (HTTP 502).",
      at: minutes(48),
      read: false,
    },
    {
      id: "ntf_2",
      kind: "warning",
      title: "Webhook retries elevated",
      body: "github-issue-triage retried 14 times in the last hour.",
      at: minutes(160),
      read: false,
    },
    {
      id: "ntf_3",
      kind: "success",
      title: "Deployed order-fulfillment v14",
      body: "New version promoted to production by Alex Rivera.",
      at: minutes(340),
      read: true,
    },
    {
      id: "ntf_4",
      kind: "info",
      title: "Worker pool scaled",
      body: "Queue workers increased from 4 to 6 for peak traffic.",
      at: minutes(900),
      read: true,
    },
  ];
}

export function notificationTimeLabel(at: string): string {
  return formatRelativeTime(at);
}


