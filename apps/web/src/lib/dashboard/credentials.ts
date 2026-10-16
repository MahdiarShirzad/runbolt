/**
 * Credentials — isolated mock adapter, metadata only.
 *
 * SECURITY: this module has no secret-valued fields by design. The Runbolt
 * API does not expose a credential store yet, so nothing here can (or
 * should) persist secret material. The browser-local layer stores name,
 * type, integration link, and non-secret setup fields (usernames, header
 * names, hosts) — never API keys, tokens, or passwords. Secrets typed into
 * forms are validated in memory and discarded.
 *
 * TODO(api): replace with real requests once the encrypted store ships
 *   getSampleCredentials   → `GET /v1/credentials` (metadata-only contract)
 *   addLocalCredential     → `POST /v1/credentials`
 *   updateLocalCredential  → `PATCH /v1/credentials/:id`
 *   removeLocalCredential  → `DELETE /v1/credentials/:id`
 * Connection testing (`POST /v1/credentials/:id/test`) does not exist —
 * the UI must keep showing an honest unavailable state for it.
 */

import { INTEGRATIONS } from "./integrations";

export type CredentialType =
  | "api_key"
  | "bearer_token"
  | "basic_auth"
  | "database"
  | "custom_header"
  | "oauth";

export const CREDENTIAL_TYPE_LABELS: Record<CredentialType, string> = {
  api_key: "API key",
  bearer_token: "Bearer token",
  basic_auth: "Basic auth",
  database: "Database",
  custom_header: "Custom header",
  oauth: "OAuth connection",
};

export const CREDENTIAL_TYPE_DESCRIPTIONS: Record<CredentialType, string> = {
  api_key: "A single API key sent as a header or query parameter.",
  bearer_token: "An opaque bearer token sent in the Authorization header.",
  basic_auth: "A username and password pair for HTTP basic authentication.",
  database: "Host and login for a database connection (password never stored here).",
  custom_header: "A named header and value, e.g. X-Api-Key.",
  oauth: "An OAuth 2.0 connection authorized through the provider — requires the Runbolt API.",
};

export interface CredentialMetadata {
  id: string;
  name: string;
  type: CredentialType;
  /** Integration slug from the integrations catalog, or null when unlinked. */
  integrationSlug: string | null;
  integrationName: string | null;
  description: string;
  /** Non-secret setup fields only (username, header name, host…). */
  fields: Record<string, string>;
  /** ISO timestamps */
  createdAt: string;
  updatedAt: string;
  /** Always null — no validation backend exists. Never invent health. */
  lastCheckedAt: string | null;
  /** "sample" = deterministic baseline; "local" = created in this browser. */
  origin: "sample" | "local";
}

interface SampleSeed {
  id: string;
  name: string;
  type: CredentialType;
  integrationSlug: string;
  description: string;
  fields: Record<string, string>;
  createdDaysAgo: number;
  updatedDaysAgo: number;
}

const SAMPLE_SEEDS: SampleSeed[] = [
  {
    id: "cred_sample_github",
    name: "GitHub API key",
    type: "api_key",
    integrationSlug: "github",
    description: "Repository-scoped key for issue and label actions.",
    fields: {},
    createdDaysAgo: 62,
    updatedDaysAgo: 12,
  },
  {
    id: "cred_sample_slack",
    name: "Slack bot token",
    type: "bearer_token",
    integrationSlug: "slack",
    description: "Bot token used to post messages in the alerts channel.",
    fields: {},
    createdDaysAgo: 45,
    updatedDaysAgo: 45,
  },
  {
    id: "cred_sample_postgres",
    name: "Postgres reporting user",
    type: "basic_auth",
    integrationSlug: "postgres",
    description: "Read-only login for the nightly report queries.",
    fields: { username: "report_reader" },
    createdDaysAgo: 30,
    updatedDaysAgo: 5,
  },
  {
    id: "cred_sample_openai",
    name: "OpenAI project key",
    type: "api_key",
    integrationSlug: "openai",
    description: "Key with usage limits for classification steps.",
    fields: {},
    createdDaysAgo: 21,
    updatedDaysAgo: 21,
  },
  {
    id: "cred_sample_drive",
    name: "Google Drive OAuth",
    type: "oauth",
    integrationSlug: "google-drive",
    description: "OAuth connection placeholder — authorization requires the Runbolt API.",
    fields: {},
    createdDaysAgo: 14,
    updatedDaysAgo: 14,
  },
];

function integrationNameFor(slug: string | null): string | null {
  if (!slug) return null;
  return INTEGRATIONS.find((integration) => integration.slug === slug)?.name ?? null;
}

/** Deterministic sample metadata — no secret values exist in this shape. */
export function getSampleCredentials(nowMs: number): CredentialMetadata[] {
  return SAMPLE_SEEDS.map((seed) => ({
    id: seed.id,
    name: seed.name,
    type: seed.type,
    integrationSlug: seed.integrationSlug,
    integrationName: integrationNameFor(seed.integrationSlug),
    description: seed.description,
    fields: { ...seed.fields },
    createdAt: new Date(nowMs - seed.createdDaysAgo * 86_400_000).toISOString(),
    updatedAt: new Date(nowMs - seed.updatedDaysAgo * 86_400_000).toISOString(),
    lastCheckedAt: null,
    origin: "sample" as const,
  }));
}

export function findSampleCredential(
  samples: CredentialMetadata[],
  id: string,
): CredentialMetadata | null {
  return samples.find((credential) => credential.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Browser-local metadata store (names/types/fields only — never secrets).
// ---------------------------------------------------------------------------

const STORAGE_KEY = "runbolt.credentials.local.v1";

export interface LocalCredentialRecord {
  id: string;
  name: string;
  type: CredentialType;
  integrationSlug: string | null;
  description: string;
  fields: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface LocalCredentialState {
  created: LocalCredentialRecord[];
}

const listeners = new Set<() => void>();

export function isLocalCredentialId(id: string): boolean {
  return id.startsWith("local_");
}

function isLocalRecordShape(value: unknown): value is LocalCredentialRecord {
  if (typeof value !== "object" || value == null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    record.id.startsWith("local_") &&
    typeof record.name === "string" &&
    typeof record.type === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  );
}

export function loadLocalCredentials(): LocalCredentialRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed == null) return [];
    const state = parsed as Record<string, unknown>;
    if (!Array.isArray(state.created)) return [];
    return state.created.filter(isLocalRecordShape);
  } catch {
    return [];
  }
}

function saveAndNotify(created: LocalCredentialRecord[]): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ created } satisfies LocalCredentialState),
      );
    } catch {
      // Storage unavailable — state stays in-memory for this tab.
    }
  }
  listeners.forEach((listener) => listener());
}

export function subscribeCredentials(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Persist credential METADATA only. Callers must never pass secret values. */
export function addLocalCredential(record: LocalCredentialRecord): void {
  const created = loadLocalCredentials().filter((item) => item.id !== record.id);
  created.unshift(record);
  saveAndNotify(created);
}

/** Patch non-secret metadata. Secret values are not part of this contract. */
export function updateLocalCredential(
  id: string,
  patch: Partial<
    Pick<
      LocalCredentialRecord,
      "name" | "description" | "integrationSlug" | "fields"
    >
  >,
): void {
  const created = loadLocalCredentials().map((record) =>
    record.id === id
      ? { ...record, ...patch, updatedAt: new Date(Date.now()).toISOString() }
      : record,
  );
  saveAndNotify(created);
}

export function removeLocalCredential(id: string): void {
  saveAndNotify(loadLocalCredentials().filter((record) => record.id !== id));
}

export function localToMetadata(
  record: LocalCredentialRecord,
): CredentialMetadata {
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    integrationSlug: record.integrationSlug,
    integrationName: integrationNameFor(record.integrationSlug),
    description: record.description,
    fields: { ...record.fields },
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastCheckedAt: null,
    origin: "local",
  };
}

/** Merge sample + local metadata for list views (client-side). */
export function mergeCredentialLists(
  samples: CredentialMetadata[],
  locals: LocalCredentialRecord[],
): CredentialMetadata[] {
  const localIds = new Set(locals.map((record) => record.id));
  const merged = samples
    .filter((sample) => !localIds.has(sample.id))
    .concat(locals.map(localToMetadata));
  return merged.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
