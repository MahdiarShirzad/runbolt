import type {
  ExecutionStatus,
  TriggerType,
  WorkflowStatus,
} from "./types";

/**
 * Shared sample-data seeds.
 *
 * Kept separate from `data.ts` so both the execution fetch layer and the
 * analytics dataset can derive from the exact same workflows without an import
 * cycle. Step plans live here too so any consumer that needs to synthesise an
 * execution (analytics rows, detail pages) uses one canonical definition.
 */

export interface WorkflowSeed {
  name: string;
  slug: string;
  status: WorkflowStatus;
  trigger: TriggerType;
  lastRunMinutesAgo: number | null;
  lastRunStatus: ExecutionStatus | null;
  runsLast30d: number;
  updatedAtMinutesAgo: number;
}

export const WORKFLOW_SEEDS: WorkflowSeed[] = [
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

export const STEP_PLANS: Record<string, string[]> = {
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
