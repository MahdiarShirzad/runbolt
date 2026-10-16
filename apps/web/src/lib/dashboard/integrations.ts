/**
 * Integrations catalog + browser-local connection store.
 *
 * The Runbolt API does not expose an integrations endpoint yet, so the
 * catalog below is a small, realistic sample set and connections are kept in
 * this browser only — mirroring how locally created workflows are stored.
 *
 * TODO(api): replace the store functions with real requests
 *   getStoredConnections  → `GET /v1/integrations/connections`
 *   connectIntegration    → `POST /v1/integrations/connections`
 *   disconnectIntegration → `DELETE /v1/integrations/connections/:slug`
 *   INTEGRATIONS          → `GET /v1/integrations`
 *
 * Secrets (API keys, tokens) are NEVER persisted — connect flows validate
 * them in memory and store only a user-chosen account label.
 */

export type IntegrationCategory =
  | "developer"
  | "communication"
  | "productivity"
  | "databases"
  | "storage"
  | "ai"
  | "webhooks";

export const INTEGRATION_CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  developer: "Developer Tools",
  communication: "Communication",
  productivity: "Productivity",
  databases: "Databases",
  storage: "Storage",
  ai: "AI Services",
  webhooks: "Webhooks & APIs",
};

export type IntegrationAuth = "oauth" | "api_key" | "webhook" | "none";

export const INTEGRATION_AUTH_LABELS: Record<IntegrationAuth, string> = {
  oauth: "OAuth 2.0",
  api_key: "API key",
  webhook: "Webhook secret",
  none: "No credentials",
};

export interface IntegrationCapability {
  label: string;
  kind: "trigger" | "action";
}

export interface Integration {
  slug: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  auth: IntegrationAuth;
  /** Which connection flows can complete in this browser today. */
  connectableLocally: boolean;
  capabilities: IntegrationCapability[];
  setupSteps: string[];
}

export interface IntegrationConnection {
  slug: string;
  /** User-chosen account label — secrets are never stored. */
  label: string;
  connectedAt: string;
  /** Last successful connection check — null until the API exists. */
  lastCheckAt: string | null;
}

export const INTEGRATIONS: Integration[] = [
  {
    slug: "github",
    name: "GitHub",
    description:
      "Trigger workflows on issues, pull requests, and pushes — and write labels, comments, and issues back.",
    category: "developer",
    auth: "oauth",
    connectableLocally: false,
    capabilities: [
      { label: "New issue or PR", kind: "trigger" },
      { label: "New push", kind: "trigger" },
      { label: "Create issue", kind: "action" },
      { label: "Add label", kind: "action" },
    ],
    setupSteps: [
      "A Runbolt GitHub App or OAuth client must be registered by the Runbolt API.",
      "Authorize Runbolt from the connection flow — scopes are granted per repository.",
      "Select the repositories a workflow is allowed to act on.",
    ],
  },
  {
    slug: "postgres",
    name: "Postgres",
    description:
      "Query and update Postgres tables from workflows — read records as triggers or write results as actions.",
    category: "databases",
    auth: "api_key",
    connectableLocally: true,
    capabilities: [
      { label: "New row", kind: "trigger" },
      { label: "Run query", kind: "action" },
      { label: "Upsert row", kind: "action" },
    ],
    setupSteps: [
      "Create a dedicated database user with least-privilege grants.",
      "Copy the connection string or password into the field below.",
      "Connection checks run through the Runbolt API once it is available.",
    ],
  },
  {
    slug: "gmail",
    name: "Gmail",
    description:
      "Send and triage email — notify customers, route incoming messages, and log correspondence.",
    category: "communication",
    auth: "oauth",
    connectableLocally: false,
    capabilities: [
      { label: "New message", kind: "trigger" },
      { label: "Send email", kind: "action" },
      { label: "Apply label", kind: "action" },
    ],
    setupSteps: [
      "Gmail access requires an OAuth consent screen hosted by the Runbolt API.",
      "Authorize the mailbox you want workflows to act on.",
      "Restrict senders and recipients per workflow once connected.",
    ],
  },
  {
    slug: "slack",
    name: "Slack",
    description:
      "Post messages, open threads, and let alerts from any tool land in the right channel.",
    category: "communication",
    auth: "api_key",
    connectableLocally: true,
    capabilities: [
      { label: "New message in channel", kind: "trigger" },
      { label: "Post message", kind: "action" },
      { label: "Reply in thread", kind: "action" },
    ],
    setupSteps: [
      "Create a Slack app with a bot token scoped to the channels you need.",
      "Paste the bot token below — it is validated in memory and never stored.",
      "Invite the bot to the channels workflows should read or post in.",
    ],
  },
  {
    slug: "google-drive",
    name: "Google Drive",
    description:
      "Watch folders for new files and upload generated reports, exports, and artifacts.",
    category: "productivity",
    auth: "oauth",
    connectableLocally: false,
    capabilities: [
      { label: "New file in folder", kind: "trigger" },
      { label: "Upload file", kind: "action" },
    ],
    setupSteps: [
      "Drive access requires OAuth hosted by the Runbolt API.",
      "Authorize the account and folder scope workflows may touch.",
    ],
  },
  {
    slug: "notion",
    name: "Notion",
    description:
      "Keep databases and pages in sync — create records from runs and trigger on database changes.",
    category: "productivity",
    auth: "oauth",
    connectableLocally: false,
    capabilities: [
      { label: "New database item", kind: "trigger" },
      { label: "Create page", kind: "action" },
      { label: "Update database item", kind: "action" },
    ],
    setupSteps: [
      "Notion access requires OAuth hosted by the Runbolt API.",
      "Share the target databases with the Runbolt integration.",
    ],
  },
  {
    slug: "openai",
    name: "OpenAI",
    description:
      "Call language models from any step — classify, extract, summarize, and generate content.",
    category: "ai",
    auth: "api_key",
    connectableLocally: true,
    capabilities: [
      { label: "Create completion", kind: "action" },
      { label: "Create embedding", kind: "action" },
    ],
    setupSteps: [
      "Create an API key in your OpenAI project settings.",
      "Paste the key below — it is validated in memory and never stored.",
      "Set usage limits on the key before exposing it to workflows.",
    ],
  },
  {
    slug: "anthropic",
    name: "Anthropic",
    description:
      "Run Claude models from workflow steps for reasoning, classification, and long-form generation.",
    category: "ai",
    auth: "api_key",
    connectableLocally: true,
    capabilities: [
      { label: "Create message", kind: "action" },
    ],
    setupSteps: [
      "Create an API key in the Anthropic console.",
      "Paste the key below — it is validated in memory and never stored.",
    ],
  },
  {
    slug: "amazon-s3",
    name: "Amazon S3",
    description:
      "Store and retrieve objects — archive run outputs, mirror uploads, and serve generated files.",
    category: "storage",
    auth: "api_key",
    connectableLocally: true,
    capabilities: [
      { label: "New object", kind: "trigger" },
      { label: "Put object", kind: "action" },
      { label: "Get object", kind: "action" },
    ],
    setupSteps: [
      "Create an IAM user with scoped access to the target bucket.",
      "Paste the access key ID and secret below — the secret is never stored.",
    ],
  },
  {
    slug: "webhooks",
    name: "Webhooks",
    description:
      "Receive signed HTTP events from any external system and start workflows with the payload.",
    category: "webhooks",
    auth: "webhook",
    connectableLocally: true,
    capabilities: [
      { label: "Incoming webhook", kind: "trigger" },
    ],
    setupSteps: [
      "Enable the integration to accept inbound events.",
      "Endpoint URLs and signing secrets are issued by the Runbolt API once it is live.",
    ],
  },
  {
    slug: "custom-api",
    name: "Custom API",
    description:
      "Call any REST endpoint from a workflow step with your own headers, auth, and payload.",
    category: "webhooks",
    auth: "api_key",
    connectableLocally: true,
    capabilities: [
      { label: "HTTP request", kind: "action" },
      { label: "Poll endpoint", kind: "trigger" },
    ],
    setupSteps: [
      "Name the connection and store the credential workflows should send.",
      "Paste the bearer token below — it is validated in memory and never stored.",
    ],
  },
];

export function getIntegration(slug: string): Integration | null {
  return INTEGRATIONS.find((integration) => integration.slug === slug) ?? null;
}

const STORAGE_KEY = "runbolt.integrations.connections.v1";

const listeners = new Set<() => void>();

function isConnectionShape(value: unknown): value is IntegrationConnection {
  if (typeof value !== "object" || value == null) return false;
  const connection = value as Record<string, unknown>;
  return (
    typeof connection.slug === "string" &&
    typeof connection.label === "string" &&
    typeof connection.connectedAt === "string"
  );
}

export function getStoredConnections(): IntegrationConnection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isConnectionShape);
  } catch {
    return [];
  }
}

function saveAndNotify(connections: IntegrationConnection[]): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
    } catch {
      // Storage unavailable — state stays in-memory for this tab.
    }
  }
  listeners.forEach((listener) => listener());
}

export function subscribeIntegrations(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Save a connection for an API-key/webhook integration. The credential
 * itself is discarded by the caller — only the label is persisted.
 */
export function connectIntegration(slug: string, label: string): void {
  const connections = getStoredConnections().filter((c) => c.slug !== slug);
  connections.unshift({
    slug,
    label,
    connectedAt: new Date(Date.now()).toISOString(),
    lastCheckAt: null,
  });
  saveAndNotify(connections);
}

export function disconnectIntegration(slug: string): void {
  saveAndNotify(getStoredConnections().filter((c) => c.slug !== slug));
}

export function findConnection(
  connections: IntegrationConnection[],
  slug: string,
): IntegrationConnection | null {
  return connections.find((connection) => connection.slug === slug) ?? null;
}

/** Icon glyph keys are mapped to components in `IntegrationIcon`. */
export type IntegrationIconKey = string;

export const INTEGRATION_ICON_KEYS: Record<string, IntegrationIconKey> = {
  github: "github",
  postgres: "db",
  gmail: "mail",
  slack: "zap",
  "google-drive": "google",
  notion: "nodes",
  openai: "bolt",
  anthropic: "worker",
  "amazon-s3": "queue",
  webhooks: "webhook",
  "custom-api": "code",
};
