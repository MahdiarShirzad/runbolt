import { formatRelativeTime } from "./format";
import type {
  ActivityPoint,
  ActivitySeries,
  AppNotification,
  Execution,
  ExecutionLogEntry,
  ExecutionStep,
  ExecutionStatus,
  LogLevel,
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
 *   getExecutions          → `GET /v1/executions?range=…`
 *   getExecutionById       → `GET /v1/executions/:id`
 *   getExecutionLogs       → `GET /v1/executions/:id/logs`
 *   getRecentExecutions    → `GET /v1/executions?limit=10`
 *   getWorkflowExecutions  → `GET /v1/executions?workflow_id=…&limit=…`
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

const STEP_PLANS: Record<string, string[]> = {
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

function buildStepsFor(
  slug: string,
  status: ExecutionStatus,
  durationMs: number | null,
  failingStep: number | null,
  rand: () => number,
): ExecutionStep[] {
  const names = STEP_PLANS[slug] ?? ["step-1", "step-2", "step-3"];
  return names.map((name, i) => {
    const isFailing = failingStep === i;
    const isLast = i === names.length - 1;
    const stepStatus: ExecutionStatus = isFailing
      ? "failed"
      : status === "running" && isLast
        ? "running"
        : status === "cancelled" && i >= names.length - 2
          ? "cancelled"
          : "success";
    const stepDuration =
      stepStatus === "running"
        ? null
        : Math.max(12, Math.round((durationMs ?? 600) / names.length + (rand() - 0.5) * 180));
    return {
      name,
      status: stepStatus,
      durationMs: stepDuration,
      ...(isFailing ? { detail: "HTTP 502 from upstream after 3 attempts" } : {}),
    };
  });
}

const HISTORY_WINDOW_MS = 30 * 86_400_000;

function makeRun(
  seed: (typeof EXECUTION_SEEDS)[number],
  status: ExecutionStatus,
  durationMs: number | null,
  failingStep: number | null,
  startedAtMs: number,
  runIndex: number,
  rand: () => number,
): Execution {
  const running = status === "running";
  return {
    id: `run_${hashString(`${seed.slug}#${runIndex}`).toString(16)}`,
    workflowId: `wf_${seed.slug}`,
    workflowName: seed.workflowName,
    status,
    trigger: seed.trigger,
    startedAt: new Date(startedAtMs).toISOString(),
    finishedAt: running
      ? null
      : new Date(startedAtMs + (durationMs ?? 0)).toISOString(),
    durationMs: running ? null : durationMs,
    steps: buildStepsFor(seed.slug, status, durationMs, failingStep, rand),
  };
}

/**
 * Deterministic execution history for the whole workspace — the single
 * source every executions fetcher reads. The newest run of each seed matches
 * its workflow's `lastRun`; older runs are generated per workflow so the
 * history is stable across requests.
 */
function buildExecutionHistory(nowMs: number): Execution[] {
  const executions: Execution[] = [];

  for (const seed of EXECUTION_SEEDS) {
    const rand = mulberry32(hashString(seed.slug) ^ 0x3c1f);
    let startedAtMs = nowMs - seed.minutesAgo * 60_000;

    executions.push(
      makeRun(seed, seed.status, seed.durationMs, seed.failingStep ?? null, startedAtMs, 0, rand),
    );

    const olderRuns = 4 + Math.floor(rand() * 5);
    for (let i = 1; i <= olderRuns; i++) {
      startedAtMs -= (4 + rand() * 40) * 3_600_000;
      if (nowMs - startedAtMs > HISTORY_WINDOW_MS) break;
      const roll = rand();
      const status: ExecutionStatus =
        roll < 0.15 ? "failed" : roll < 0.19 ? "cancelled" : "success";
      const durationMs = 300 + Math.round(rand() * 9000);
      const failingStep =
        status === "failed" ? Math.floor(rand() * STEP_PLANS[seed.slug]!.length) : null;
      executions.push(makeRun(seed, status, durationMs, failingStep, startedAtMs, i, rand));
    }
  }

  executions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return executions;
}

/** All executions in the sample window (newest first). */
export async function getExecutions(): Promise<Execution[]> {
  return buildExecutionHistory(Date.now());
}

export async function getExecutionById(id: string): Promise<Execution | null> {
  return buildExecutionHistory(Date.now()).find((execution) => execution.id === id) ?? null;
}

/**
 * Sample log stream for one execution, derived deterministically from the
 * execution's own step data (timestamps follow step durations).
 *
 * TODO(api): replace with `GET /v1/executions/:id/logs`.
 */
export async function getExecutionLogs(executionId: string): Promise<ExecutionLogEntry[]> {
  const execution = await getExecutionById(executionId);
  if (!execution) return [];

  const entries: ExecutionLogEntry[] = [];
  let seq = 0;
  let cursorMs = new Date(execution.startedAt).getTime();
  const push = (level: LogLevel, source: string, message: string) => {
    entries.push({
      id: `${executionId}.log_${seq++}`,
      at: new Date(cursorMs).toISOString(),
      level,
      source,
      message,
    });
  };

  push("info", "runner", `Execution started (${execution.trigger} trigger)`);
  for (const step of execution.steps) {
    push("info", step.name, `Step "${step.name}" started`);
    const durationMs = step.durationMs ?? 0;
    cursorMs += durationMs;
    if (step.status === "success") {
      push("info", step.name, `Step completed in ${durationMs}ms`);
    } else if (step.status === "failed") {
      push("error", step.name, step.detail ?? "Step failed");
    } else if (step.status === "cancelled") {
      push("warn", step.name, "Step cancelled");
    } else {
      push("info", step.name, "Step is still running");
    }
  }
  if (execution.status === "success") {
    push("info", "runner", "Execution finished successfully");
  } else if (execution.status === "failed") {
    push("error", "runner", "Execution aborted: a step failed");
  } else if (execution.status === "cancelled") {
    push("warn", "runner", "Execution cancelled");
  } else {
    push("info", "runner", "Execution still running");
  }
  return entries;
}

export async function getRecentExecutions(limit = 10): Promise<Execution[]> {
  const executions = await getExecutions();
  return executions.slice(0, limit);
}

const WORKFLOW_SEEDS: {
  name: string;
  slug: string;
  status: WorkflowStatus;
  trigger: TriggerType;
  lastRunMinutesAgo: number | null;
  lastRunStatus: ExecutionStatus | null;
  runsLast30d: number;
  updatedAtMinutesAgo: number;
}[] = [
  { name: "Order fulfillment", slug: "order-fulfillment", status: "active", trigger: "webhook", lastRunMinutesAgo: 3, lastRunStatus: "success", runsLast30d: 1840, updatedAtMinutesAgo: 5 },
  { name: "Customer sync", slug: "customer-sync", status: "active", trigger: "schedule", lastRunMinutesAgo: 11, lastRunStatus: "success", runsLast30d: 730, updatedAtMinutesAgo: 20 },
  { name: "Lead enrichment", slug: "lead-enrichment", status: "active", trigger: "api", lastRunMinutesAgo: 2, lastRunStatus: "running", runsLast30d: 412, updatedAtMinutesAgo: 6 },
  { name: "Nightly invoice export", slug: "nightly-invoice-export", status: "active", trigger: "schedule", lastRunMinutesAgo: 48, lastRunStatus: "failed", runsLast30d: 30, updatedAtMinutesAgo: 60 },
  { name: "Slack alert triage", slug: "slack-alert-triage", status: "active", trigger: "webhook", lastRunMinutesAgo: 95, lastRunStatus: "success", runsLast30d: 2890, updatedAtMinutesAgo: 120 },
  { name: "GitHub issue triage", slug: "github-issue-triage", status: "active", trigger: "webhook", lastRunMinutesAgo: 140, lastRunStatus: "success", runsLast30d: 640, updatedAtMinutesAgo: 180 },
  { name: "Stripe dunning emails", slug: "stripe-dunning-emails", status: "active", trigger: "schedule", lastRunMinutesAgo: 210, lastRunStatus: "success", runsLast30d: 92, updatedAtMinutesAgo: 260 },
  { name: "DB backup verification", slug: "db-backup-verify", status: "paused", trigger: "schedule", lastRunMinutesAgo: 320, lastRunStatus: "failed", runsLast30d: 30, updatedAtMinutesAgo: 400 },
  { name: "Abandoned cart reminder", slug: "abandoned-cart-reminder", status: "active", trigger: "schedule", lastRunMinutesAgo: 480, lastRunStatus: "success", runsLast30d: 210, updatedAtMinutesAgo: 520 },
  { name: "CRM contact import", slug: "crm-contact-import", status: "active", trigger: "manual", lastRunMinutesAgo: 720, lastRunStatus: "cancelled", runsLast30d: 18, updatedAtMinutesAgo: 800 },
  { name: "Legacy Zendesk bridge", slug: "legacy-zendesk-bridge", status: "paused", trigger: "webhook", lastRunMinutesAgo: null, lastRunStatus: null, runsLast30d: 0, updatedAtMinutesAgo: 6000 },
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
    updatedAt: new Date(now - seed.updatedAtMinutesAgo * 60_000).toISOString(),
  }));
  return limit == null ? all : all.slice(0, limit);
}

function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Recent run history for one workflow, taken from the unified sample history
 * (newest run matches the workflow's `lastRun`).
 */
export async function getWorkflowExecutions(
  workflowId: string,
  limit = 8,
): Promise<Execution[]> {
  const executions = await getExecutions();
  return executions
    .filter((execution) => execution.workflowId === workflowId)
    .slice(0, limit);
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


