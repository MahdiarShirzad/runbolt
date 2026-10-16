/**
 * Workflow templates — isolated mock catalog.
 *
 * No template API exists yet; this is a small, realistic sample set kept
 * separate from production data. Required-integration slugs reference the
 * integrations catalog so prerequisites link to real detail pages.
 *
 * TODO(api): replace reads with real requests
 *   getTemplates → `GET /v1/templates`
 *   getTemplate  → `GET /v1/templates/:slug`
 */

import type { TriggerType } from "./types";

export type TemplateCategory =
  | "developer"
  | "api"
  | "communication"
  | "data"
  | "ai"
  | "productivity"
  | "webhooks"
  | "database";

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  developer: "Developer Tools",
  api: "API Automation",
  communication: "Communication",
  data: "Data Processing",
  ai: "AI Workflows",
  productivity: "Productivity",
  webhooks: "Webhooks",
  database: "Database Automation",
};

export interface TemplateStep {
  name: string;
  description: string;
}

export interface WorkflowTemplate {
  slug: string;
  name: string;
  description: string;
  category: TemplateCategory;
  trigger: TriggerType;
  /** Schedule preset when trigger is "schedule". */
  triggerDetail: string | null;
  /** The problem this template automates. */
  problem: string;
  /** Who typically uses it and when. */
  useCase: string;
  /** What a run does from trigger to final step. */
  behavior: string;
  steps: TemplateStep[];
  /** Integration slugs from the integrations catalog. */
  requiredIntegrations: string[];
  /** What the user must have or supply before the workflow can run. */
  prerequisites: string[];
  /** Concrete values the user fills in during setup. */
  configFields: string[];
  /** Estimated minutes of configuration — meaningful catalog data. */
  setupMinutes: number;
}

export const TEMPLATES: WorkflowTemplate[] = [
  {
    slug: "github-issue-triage",
    name: "GitHub issue triage",
    description:
      "Label, comment on, and route new GitHub issues the moment they open.",
    category: "developer",
    trigger: "webhook",
    triggerDetail: null,
    problem:
      "New issues pile up unlabeled and unanswered until someone manually sorts them.",
    useCase:
      "Open-source maintainers and product teams who want consistent first-response triage.",
    behavior:
      "A webhook fires when an issue is opened. The workflow classifies it, applies a priority label, and posts a short acknowledgement comment.",
    steps: [
      {
        name: "Receive issue webhook",
        description: "Accept the GitHub issues opened event on the endpoint.",
      },
      {
        name: "Classify issue",
        description: "Read the title and body to pick a triage label.",
      },
      {
        name: "Add label",
        description: "Apply the matching label to the issue.",
      },
      {
        name: "Post acknowledgement",
        description: "Comment with next steps and response expectations.",
      },
    ],
    requiredIntegrations: ["github"],
    prerequisites: [
      "A GitHub repository where the Runbolt GitHub App is installed.",
      "Webhook delivery configured for issues events.",
    ],
    configFields: ["Repository", "Label set to apply", "Acknowledgement message"],
    setupMinutes: 10,
  },
  {
    slug: "nightly-db-report",
    name: "Nightly database report",
    description:
      "Query Postgres on a schedule and post a formatted summary to Slack.",
    category: "database",
    trigger: "schedule",
    triggerDetail: "Daily at 09:00 UTC",
    problem:
      "Key operational numbers live in the database but no one checks them until something breaks.",
    useCase:
      "Ops and engineering teams that want a daily written pulse without building a dashboard.",
    behavior:
      "Every morning the workflow runs a saved query, formats the results into a short summary, and posts it to a Slack channel.",
    steps: [
      {
        name: "Run scheduled query",
        description: "Execute the saved SQL against Postgres.",
      },
      {
        name: "Format summary",
        description: "Turn the result rows into a readable digest.",
      },
      {
        name: "Post to Slack",
        description: "Send the summary to the configured channel.",
      },
    ],
    requiredIntegrations: ["postgres", "slack"],
    prerequisites: [
      "Postgres credentials with read access to the report tables.",
      "A Slack bot token scoped to the target channel.",
    ],
    configFields: ["SQL query", "Slack channel", "Schedule"],
    setupMinutes: 15,
  },
  {
    slug: "support-ticket-classifier",
    name: "Support ticket classifier",
    description:
      "Route incoming support tickets by urgency with an AI classification step.",
    category: "ai",
    trigger: "webhook",
    triggerDetail: null,
    problem:
      "Tickets arrive in one queue and wait for a human to decide what is urgent.",
    useCase:
      "Support teams that want urgent issues escalated before the next shift picks up the queue.",
    behavior:
      "When a ticket webhook fires, the workflow sends the ticket text to a language model, stores the predicted urgency, and branches on the result.",
    steps: [
      {
        name: "Receive ticket",
        description: "Accept the ticket payload from your helpdesk.",
      },
      {
        name: "Classify urgency",
        description: "Ask the model to score urgency and topic.",
      },
      {
        name: "Store routing result",
        description: "Write the classification back for the queue to consume.",
      },
    ],
    requiredIntegrations: ["openai"],
    prerequisites: [
      "An OpenAI API key with usage limits set.",
      "A helpdesk or form that can POST ticket payloads.",
    ],
    configFields: ["OpenAI model", "Urgency rubric", "Webhook payload mapping"],
    setupMinutes: 20,
  },
  {
    slug: "s3-upload-notify",
    name: "Upload notification",
    description:
      "Email the right people when a new object lands in an S3 bucket.",
    category: "communication",
    trigger: "webhook",
    triggerDetail: null,
    problem:
      "Teammates learn about new uploads late because nothing watches the bucket.",
    useCase:
      "Teams that share delivery folders or export buckets and need instant notification.",
    behavior:
      "An object-created event starts the workflow. It validates the path against a prefix filter and sends an email with the object details.",
    steps: [
      {
        name: "Receive S3 event",
        description: "Accept the object-created notification.",
      },
      {
        name: "Check path prefix",
        description: "Ignore objects outside the watched folder.",
      },
      {
        name: "Send email",
        description: "Notify the recipients with object name and size.",
      },
    ],
    requiredIntegrations: ["amazon-s3", "gmail"],
    prerequisites: [
      "An IAM user with permission to read bucket notifications.",
      "Gmail OAuth access for the sending mailbox (requires the Runbolt API).",
    ],
    configFields: ["Bucket name", "Path prefix", "Recipient list"],
    setupMinutes: 15,
  },
  {
    slug: "stale-pr-reminder",
    name: "Stale PR reminder",
    description:
      "Find pull requests with no activity and nudge owners in Slack.",
    category: "developer",
    trigger: "schedule",
    triggerDetail: "Weekly on Monday 09:00 UTC",
    problem:
      "Open pull requests stall quietly and only surface in code review meetings.",
    useCase:
      "Engineering teams that want a lightweight weekly nudge instead of a process change.",
    behavior:
      "Each week the workflow lists open pull requests, filters for inactivity past a threshold, and posts a reminder thread with the stale PRs.",
    steps: [
      {
        name: "List open PRs",
        description: "Fetch open pull requests from GitHub.",
      },
      {
        name: "Filter stale",
        description: "Keep PRs with no updates past the inactivity threshold.",
      },
      {
        name: "Post reminder",
        description: "Send a Slack summary with links to each stale PR.",
      },
    ],
    requiredIntegrations: ["github", "slack"],
    prerequisites: [
      "A GitHub App or token with pull-request read access.",
      "A Slack bot token for the reminder channel.",
    ],
    configFields: ["Repository list", "Inactivity threshold", "Slack channel"],
    setupMinutes: 15,
  },
  {
    slug: "crm-sync-notion",
    name: "CRM records to Notion",
    description:
      "Mirror new CRM records into a Notion database on a schedule.",
    category: "productivity",
    trigger: "schedule",
    triggerDetail: "Every hour",
    problem:
      "Sales context lives in the CRM while planning lives in Notion, and copies drift.",
    useCase:
      "Small teams that plan in Notion but cannot leave their CRM.",
    behavior:
      "Hourly, the workflow pulls recently changed CRM records, upserts them into the Notion database, and skips records that already match.",
    steps: [
      {
        name: "Fetch changed records",
        description: "Pull CRM records updated since the last run.",
      },
      {
        name: "Upsert into Notion",
        description: "Create or update matching database items.",
      },
      {
        name: "Record sync cursor",
        description: "Save the high-water mark for the next run.",
      },
    ],
    requiredIntegrations: ["notion", "custom-api"],
    prerequisites: [
      "Notion shared with the Runbolt integration (requires the Runbolt API for OAuth).",
      "A CRM API token for the source records.",
    ],
    configFields: ["CRM endpoint", "Notion database ID", "Field mapping"],
    setupMinutes: 25,
  },
  {
    slug: "webhook-to-slack",
    name: "Webhook to Slack",
    description:
      "Turn any signed webhook into a formatted Slack message.",
    category: "webhooks",
    trigger: "webhook",
    triggerDetail: null,
    problem:
      "Tools emit webhooks but have no native Slack integration worth enabling.",
    useCase:
      "Any team consolidating alerts from monitors, billing, or internal tools into one channel.",
    behavior:
      "The endpoint accepts a signed payload, renders it into a readable message with the fields you choose, and posts it to Slack.",
    steps: [
      {
        name: "Receive event",
        description: "Accept and verify the signed webhook payload.",
      },
      {
        name: "Format message",
        description: "Render the chosen fields into message text.",
      },
      {
        name: "Post to Slack",
        description: "Deliver the message to the configured channel.",
      },
    ],
    requiredIntegrations: ["webhooks", "slack"],
    prerequisites: [
      "A Slack bot token with chat:write for the target channel.",
      "The signing secret shared with the event source.",
    ],
    configFields: ["Slack channel", "Field mapping", "Signing secret"],
    setupMinutes: 10,
  },
  {
    slug: "article-digest",
    name: "Article digest",
    description:
      "Summarize a reading list with Claude and save the digest to Drive.",
    category: "ai",
    trigger: "schedule",
    triggerDetail: "Daily at 08:00 UTC",
    problem:
      "A shared reading list grows faster than anyone can read it.",
    useCase:
      "Research and content teams that want a daily written digest of new links.",
    behavior:
      "Each morning the workflow fetches new links, asks Claude to summarize each one, and uploads a single digest document to Google Drive.",
    steps: [
      {
        name: "Fetch new links",
        description: "Read unread URLs from the configured list.",
      },
      {
        name: "Summarize each article",
        description: "Ask Claude for a short summary of every link.",
      },
      {
        name: "Save digest to Drive",
        description: "Upload the compiled digest as a document.",
      },
    ],
    requiredIntegrations: ["anthropic", "google-drive"],
    prerequisites: [
      "An Anthropic API key.",
      "Google Drive OAuth access (requires the Runbolt API).",
      "A readable source for the link list.",
    ],
    configFields: ["Link list source", "Anthropic model", "Drive folder"],
    setupMinutes: 20,
  },
  {
    slug: "failed-payment-followup",
    name: "Failed payment follow-up",
    description:
      "Email customers and log a record when a payment webhook reports failure.",
    category: "data",
    trigger: "webhook",
    triggerDetail: null,
    problem:
      "Failed payments sit unnoticed until churn shows up in revenue reports.",
    useCase:
      "Subscription products that want a same-day dunning touch without a billing-suite add-on.",
    behavior:
      "A payment-failed event starts the workflow. It records the failure in Postgres and sends the customer a follow-up email with a payment link.",
    steps: [
      {
        name: "Receive payment event",
        description: "Accept the payment-failed webhook payload.",
      },
      {
        name: "Log failure",
        description: "Insert the failure record into Postgres.",
      },
      {
        name: "Send follow-up email",
        description: "Email the customer with a retry payment link.",
      },
    ],
    requiredIntegrations: ["postgres", "gmail"],
    prerequisites: [
      "A payment provider that emits failure webhooks.",
      "Postgres table for failure records.",
      "Gmail OAuth access (requires the Runbolt API).",
    ],
    configFields: ["Webhook source", "Postgres table", "Email template"],
    setupMinutes: 25,
  },
  {
    slug: "api-downtime-alert",
    name: "API downtime alert",
    description:
      "Poll a health endpoint and alert Slack the moment it stops responding.",
    category: "api",
    trigger: "schedule",
    triggerDetail: "Every 5 minutes",
    problem:
      "Internal APIs fail quietly until a customer reports it.",
    useCase:
      "Teams running small services without a full observability stack.",
    behavior:
      "Every five minutes the workflow calls the health endpoint, checks the status code, and posts an alert when the check fails.",
    steps: [
      {
        name: "Call health endpoint",
        description: "Issue an HTTP request to the configured URL.",
      },
      {
        name: "Check response",
        description: "Treat non-2xx responses as a failure.",
      },
      {
        name: "Alert on failure",
        description: "Post an alert with the endpoint and status to Slack.",
      },
    ],
    requiredIntegrations: ["custom-api", "slack"],
    prerequisites: [
      "A publicly reachable health endpoint.",
      "A Slack bot token for the alert channel.",
    ],
    configFields: ["Health URL", "Expected status", "Slack channel"],
    setupMinutes: 10,
  },
  {
    slug: "csv-to-postgres",
    name: "CSV import to Postgres",
    description:
      "Load uploaded CSV exports into a staging table on a schedule.",
    category: "data",
    trigger: "schedule",
    triggerDetail: "Every hour",
    problem:
      "Manual CSV imports into staging tables are error-prone and easy to forget.",
    useCase:
      "Data teams ingesting periodic exports from a vendor or internal tool.",
    behavior:
      "Hourly, the workflow checks for new CSV files, parses them, upserts rows into the staging table, and records the row counts.",
    steps: [
      {
        name: "Find new CSVs",
        description: "List export files not yet imported.",
      },
      {
        name: "Parse and upsert",
        description: "Load rows into the staging table, skipping duplicates.",
      },
      {
        name: "Record import stats",
        description: "Store inserted and skipped counts for auditing.",
      },
    ],
    requiredIntegrations: ["amazon-s3", "postgres"],
    prerequisites: [
      "An S3 prefix where exports land.",
      "Postgres credentials with write access to the staging table.",
    ],
    configFields: ["S3 prefix", "Staging table", "Primary key columns"],
    setupMinutes: 20,
  },
  {
    slug: "form-submission-ack",
    name: "Form submission acknowledgment",
    description:
      "Acknowledge every inbound form webhook and store the submission.",
    category: "webhooks",
    trigger: "webhook",
    triggerDetail: null,
    problem:
      "Form submissions vanish into inboxes with no record of who was contacted.",
    useCase:
      "Marketing and ops teams that need a reliable paper trail for every submission.",
    behavior:
      "On each submission the workflow stores the payload, sends the submitter a confirmation email, and tags the record with the received timestamp.",
    steps: [
      {
        name: "Receive submission",
        description: "Accept the form webhook payload.",
      },
      {
        name: "Store record",
        description: "Save the submission for later processing.",
      },
      {
        name: "Send confirmation",
        description: "Email the submitter a receipt message.",
      },
    ],
    requiredIntegrations: ["webhooks", "postgres", "gmail"],
    prerequisites: [
      "A form tool that can POST to a webhook.",
      "Postgres table for submissions.",
      "Gmail OAuth access (requires the Runbolt API).",
    ],
    configFields: ["Webhook payload mapping", "Postgres table", "Confirmation copy"],
    setupMinutes: 15,
  },
];

export function getTemplates(): WorkflowTemplate[] {
  return TEMPLATES;
}

export function getTemplate(slug: string): WorkflowTemplate | null {
  return TEMPLATES.find((template) => template.slug === slug) ?? null;
}
