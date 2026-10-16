import { WORKFLOW_SEEDS } from "../seeds";
import { hashString, mulberry32 } from "../random";
import type { ExecutionStatus, TriggerType } from "../types";
import type { AnalyticsEvent } from "./types";

/**
 * Deterministic sample analytics dataset.
 *
 * The Runbolt API has no executions/stats endpoint yet, so the dashboard works
 * from a reproducible synthetic observation stream. Generation rules:
 *
 *  - Each workflow produces exactly its configured `runsLast30d` runs across
 *    the most recent 30 local days (largest-remainder allocation), so per
 *    workflow totals agree with the workflow list on the rest of the app.
 *  - Older days (30–60) reuse the same average daily rate to power
 *    previous-period comparisons for the 30-day range.
 *  - Runs are spread across hours using a business-hours shape, and each run's
 *    status, duration, retry count and error category follow a per-workflow
 *    profile.
 *
 * Every value derives from a per-workflow seed, so the dataset is identical
 * across renders within an hour. This module is the single source of truth for
 * every aggregate on the dashboard; nothing random happens in components.
 */

export const DAY_MS = 86_400_000;
export const HOUR_MS = 3_600_000;
const DAY_SPAN = 60;

/** Relative execution volume by hour of day (0–23). */
const HOUR_SHAPE = [
  0.35, 0.28, 0.24, 0.22, 0.26, 0.4, 0.65, 0.95, 1.15, 1.25, 1.2, 1.1, 1.05,
  1.1, 1.15, 1.1, 1.0, 0.9, 0.85, 0.8, 0.7, 0.6, 0.5, 0.42,
];

interface WorkflowProfile {
  baseDurationMs: number;
  spread: number;
  failureRate: number;
  cancelledRate: number;
  retryRate: number;
  errors: string[];
}

const WORKFLOW_PROFILES: Record<string, WorkflowProfile> = {
  "order-fulfillment": {
    baseDurationMs: 1250,
    spread: 0.45,
    failureRate: 0.018,
    cancelledRate: 0.004,
    retryRate: 0.35,
    errors: ["Payment provider declined", "Inventory reservation timeout", "Label service unavailable"],
  },
  "customer-sync": {
    baseDurationMs: 940,
    spread: 0.5,
    failureRate: 0.026,
    cancelledRate: 0.003,
    retryRate: 0.4,
    errors: ["CRM API rate limit exceeded", "Field mapping validation failed", "OAuth token expired"],
  },
  "lead-enrichment": {
    baseDurationMs: 1680,
    spread: 0.6,
    failureRate: 0.042,
    cancelledRate: 0.005,
    retryRate: 0.3,
    errors: ["Enrichment provider 429", "DNS lookup failed", "Scoring model timeout"],
  },
  "nightly-invoice-export": {
    baseDurationMs: 3450,
    spread: 0.35,
    failureRate: 0.11,
    cancelledRate: 0.01,
    retryRate: 0.2,
    errors: ["Object storage upload 502", "CSV serialization error", "SQL query timeout"],
  },
  "slack-alert-triage": {
    baseDurationMs: 320,
    spread: 0.7,
    failureRate: 0.02,
    cancelledRate: 0.006,
    retryRate: 0.25,
    errors: ["Slack rate limited", "Alert classification error"],
  },
  "github-issue-triage": {
    baseDurationMs: 2150,
    spread: 0.55,
    failureRate: 0.075,
    cancelledRate: 0.008,
    retryRate: 0.3,
    errors: ["GitHub API 403", "Webhook signature invalid", "Label not found"],
  },
  "stripe-dunning-emails": {
    baseDurationMs: 4600,
    spread: 0.4,
    failureRate: 0.05,
    cancelledRate: 0.006,
    retryRate: 0.2,
    errors: ["Stripe API error", "Email render failed", "Recipient suppressed"],
  },
  "db-backup-verify": {
    baseDurationMs: 8400,
    spread: 0.3,
    failureRate: 0.14,
    cancelledRate: 0.01,
    retryRate: 0.15,
    errors: ["Checksum mismatch", "Restore check failed", "Schema diff detected"],
  },
  "abandoned-cart-reminder": {
    baseDurationMs: 610,
    spread: 0.5,
    failureRate: 0.03,
    cancelledRate: 0.004,
    retryRate: 0.25,
    errors: ["Template render error", "Message send timeout"],
  },
  "crm-contact-import": {
    baseDurationMs: 15_200,
    spread: 0.5,
    failureRate: 0.06,
    cancelledRate: 0.02,
    retryRate: 0.1,
    errors: ["Deduplication conflict", "Row parse error", "Bulk upsert failed"],
  },
  "legacy-zendesk-bridge": {
    baseDurationMs: 1050,
    spread: 0.5,
    failureRate: 0.08,
    cancelledRate: 0.02,
    retryRate: 0.1,
    errors: ["Zendesk authentication failed"],
  },
};

/** Start of the local calendar day containing `ms`. */
export function startOfLocalDay(ms: number): number {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Distributes `total` across `weights` as integers, summing exactly to total. */
function largestRemainder(weights: number[], total: number): number[] {
  if (total <= 0) return weights.map(() => 0);
  const sum = weights.reduce((acc, value) => acc + value, 0);
  if (sum <= 0) return weights.map(() => 0);

  const raw = weights.map((weight) => (weight / sum) * total);
  const result = raw.map(Math.floor);
  let assigned = result.reduce((acc, value) => acc + value, 0);

  const order = raw
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  for (let i = 0; i < order.length && assigned < total; i++) {
    result[order[i].index] += 1;
    assigned += 1;
  }
  return result;
}

/** Standard normal sample from a uniform generator (Box–Muller). */
function normal(rand: () => number): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function pickError(errors: string[], rand: () => number): string {
  return errors[Math.floor(rand() * errors.length)] ?? errors[0]!;
}

/** Generates the full observation stream ending at `now`. */
export function generateAnalyticsEvents(now: number): AnalyticsEvent[] {
  const todayStart = startOfLocalDay(now);
  const events: AnalyticsEvent[] = [];
  let counter = 0;

  for (const seed of WORKFLOW_SEEDS) {
    const profile = WORKFLOW_PROFILES[seed.slug];
    if (!profile || seed.runsLast30d <= 0) continue;

    const rand = mulberry32(hashString(`runbolt.analytics.${seed.slug}`));

    // Per-day volume weights: weekday rhythm with deterministic jitter.
    const weights: number[] = [];
    for (let d = 0; d < DAY_SPAN; d++) {
      const date = new Date(todayStart - d * DAY_MS);
      const day = date.getDay();
      const weekend = day === 0 || day === 6 ? 0.6 : 1;
      weights.push(weekend * (0.7 + rand() * 0.6));
    }

    const recentWeights = weights.slice(0, 30);
    const recentSum = recentWeights.reduce((acc, value) => acc + value, 0);
    const recentAlloc = largestRemainder(recentWeights, seed.runsLast30d);
    const perWeight = recentSum > 0 ? seed.runsLast30d / recentSum : 0;

    const dayCounts = Array.from({ length: DAY_SPAN }, (_, d) =>
      d < 30 ? recentAlloc[d]! : Math.round(weights[d]! * perWeight),
    );

    for (let d = 0; d < DAY_SPAN; d++) {
      const count = dayCounts[d]!;
      if (count <= 0) continue;
      const dayStart = todayStart - d * DAY_MS;
      const hourAlloc = largestRemainder(HOUR_SHAPE, count);

      for (let h = 0; h < 24; h++) {
        const inHour = hourAlloc[h]!;
        for (let k = 0; k < inHour; k++) {
          const startedAt =
            dayStart + h * HOUR_MS + Math.floor(rand() * 60) * 60_000 + Math.floor(rand() * 60) * 1000;
          if (startedAt > now) continue;
          // Paused workflows stop producing new runs today.
          if (seed.status === "paused" && d === 0) continue;

          const ageMinutes = (now - startedAt) / 60_000;
          const roll = rand();
          let status: ExecutionStatus;
          let liveRoll = -1;
          if (ageMinutes <= 6) liveRoll = rand();
          if (liveRoll >= 0 && liveRoll < 0.4) status = "queued";
          else if (liveRoll >= 0 && liveRoll < 0.85) status = "running";
          else if (roll < profile.cancelledRate) status = "cancelled";
          else if (roll < profile.cancelledRate + profile.failureRate) status = "failed";
          else status = "success";

          const isLive = status === "running" || status === "queued";
          let durationMs: number | null = null;
          if (!isLive) {
            let value = profile.baseDurationMs * Math.exp(normal(rand) * profile.spread);
            if (status === "failed") value *= 0.75 + rand() * 1.1;
            else if (status === "cancelled") value *= 0.4 + rand() * 0.6;
            durationMs = Math.max(15, Math.round(value));
          }

          let retries = 0;
          if (status === "success") {
            if (rand() < profile.retryRate * 0.5) retries = 1 + Math.floor(rand() * 2);
          } else if (status === "failed") {
            if (rand() < profile.retryRate) retries = 1 + Math.floor(rand() * 3);
          } else if (status === "cancelled") {
            if (rand() < 0.05) retries = 1;
          }

          events.push({
            id: `run_${startedAt.toString(36)}${(counter++).toString(36)}`,
            workflowId: `wf_${seed.slug}`,
            workflowName: seed.name,
            workflowSlug: seed.slug,
            workflowStatus: seed.status,
            status,
            trigger: seed.trigger as TriggerType,
            startedAt,
            durationMs,
            retries,
            errorCategory: status === "failed" ? pickError(profile.errors, rand) : null,
          });
        }
      }
    }
  }

  events.sort((a, b) => b.startedAt - a.startedAt);
  return events;
}

let cacheKey = "";
let cache: AnalyticsEvent[] = [];

/**
 * Returns the observation stream, memoized for the current hour. Regenerating
 * each hour keeps the "now" edge fresh while remaining stable across the many
 * renders within a single page request.
 */
export function getAnalyticsEvents(now: number): AnalyticsEvent[] {
  const key = `${startOfLocalDay(now)}:${Math.floor(now / HOUR_MS)}`;
  if (cacheKey === key) return cache;
  cache = generateAnalyticsEvents(now);
  cacheKey = key;
  return cache;
}
