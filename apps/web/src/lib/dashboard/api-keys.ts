/**
 * API keys — Settings surface adapter.
 *
 * SECURITY: this module holds only masked key hints (e.g. `rb_••••••••4f2c`)
 * — never full key material. The Runbolt API has no API-key endpoints yet,
 * so nothing here can create, list, or revoke real keys:
 *   - rows are deterministic sample data (labeled as such in the UI);
 *   - revocation is tracked browser-locally only, with an explicit notice;
 *   - creation generates nothing — the form reports the missing endpoint
 *     instead of inventing a one-time secret.
 *
 * This is a separate credential class from Integration Credentials
 * (`credentials.ts`), webhook signing secrets (`webhooks.ts`), and session
 * JWTs — none of those ever belong in this table.
 *
 * TODO(api): required endpoints before this adapter goes live, each with
 * server-side workspace ownership checks (a key must only be readable or
 * revocable by the workspace that created it — never trust an id alone):
 *   list    → `GET    /v1/api-keys`       id, name, keyHint, createdAt,
 *                                         lastUsedAt, expiresAt, status
 *   create  → `POST   /v1/api-keys`       name, scopes, expiresIn → returns
 *                                         the full key exactly once
 *   revoke  → `DELETE /v1/api-keys/:id`   server-side revocation + audit log
 */

import { formatAbsoluteTime, formatRelativeTime } from "./format";

export type ApiKeyStatus = "active" | "revoked" | "expired";

export const API_KEY_STATUS_LABELS: Record<ApiKeyStatus, string> = {
  active: "Active",
  revoked: "Revoked",
  expired: "Expired",
};

export interface ApiKeyRow {
  id: string;
  name: string;
  /** Masked hint only — the full secret is never stored or rendered. */
  keyHint: string;
  status: ApiKeyStatus;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

/** Pre-formatted for SSR: labels are computed on the server, never in render. */
export interface ApiKeyDisplayRow {
  id: string;
  name: string;
  keyHint: string;
  status: ApiKeyStatus;
  createdLabel: string;
  createdAbsolute: string;
  /** null = never used. */
  lastUsedLabel: string | null;
  lastUsedAbsolute: string | null;
  /** null = never expires. */
  expiresLabel: string | null;
  expiresAbsolute: string | null;
}

interface SampleSeed {
  id: string;
  name: string;
  /** Last 4 characters shown after the mask in the key hint. */
  keyTail: string;
  revoked: boolean;
  createdDaysAgo: number;
  /** null = never used. */
  lastUsedDaysAgo: number | null;
  /** null = never expires; negative = already expired. */
  expiresInDays: number | null;
}

const SAMPLE_SEEDS: SampleSeed[] = [
  {
    id: "key_sample_deploy",
    name: "Deploy pipeline",
    keyTail: "4f2c",
    revoked: false,
    createdDaysAgo: 62,
    lastUsedDaysAgo: 2,
    expiresInDays: 60,
  },
  {
    id: "key_sample_ci",
    name: "CI integration",
    keyTail: "9b31",
    revoked: false,
    createdDaysAgo: 40,
    lastUsedDaysAgo: 0.04,
    expiresInDays: null,
  },
  {
    id: "key_sample_analytics",
    name: "Analytics export",
    keyTail: "d74e",
    revoked: false,
    createdDaysAgo: 120,
    lastUsedDaysAgo: 10,
    expiresInDays: -3,
  },
  {
    id: "key_sample_legacy",
    name: "Legacy automation",
    keyTail: "a5f0",
    revoked: true,
    createdDaysAgo: 90,
    lastUsedDaysAgo: 27,
    expiresInDays: null,
  },
];

function maskHint(keyTail: string): string {
  return `rb_••••••••${keyTail}`;
}

/**
 * Deterministic sample rows — every keyHint is a mask, never secret material.
 * TODO(api): replace with a `GET /v1/api-keys` request mapping.
 */
export function getApiKeys(nowMs: number): ApiKeyRow[] {
  const nowIso = new Date(nowMs).toISOString();
  return SAMPLE_SEEDS.map((seed) => {
    const expiresAt =
      seed.expiresInDays === null
        ? null
        : new Date(nowMs + seed.expiresInDays * 86_400_000).toISOString();
    const status: ApiKeyStatus = seed.revoked
      ? "revoked"
      : expiresAt !== null && expiresAt < nowIso
        ? "expired"
        : "active";
    return {
      id: seed.id,
      name: seed.name,
      keyHint: maskHint(seed.keyTail),
      status,
      createdAt: new Date(nowMs - seed.createdDaysAgo * 86_400_000).toISOString(),
      lastUsedAt:
        seed.lastUsedDaysAgo === null
          ? null
          : new Date(nowMs - seed.lastUsedDaysAgo * 86_400_000).toISOString(),
      expiresAt,
    };
  });
}

/** Format raw rows for SSR — timestamps resolve to labels once, server-side. */
export function formatApiKeyRow(row: ApiKeyRow, nowMs: number): ApiKeyDisplayRow {
  return {
    id: row.id,
    name: row.name,
    keyHint: row.keyHint,
    status: row.status,
    createdLabel: formatRelativeTime(row.createdAt, nowMs),
    createdAbsolute: formatAbsoluteTime(row.createdAt),
    lastUsedLabel: row.lastUsedAt ? formatRelativeTime(row.lastUsedAt, nowMs) : null,
    lastUsedAbsolute: row.lastUsedAt ? formatAbsoluteTime(row.lastUsedAt) : null,
    expiresLabel: row.expiresAt ? formatRelativeTime(row.expiresAt, nowMs) : null,
    expiresAbsolute: row.expiresAt ? formatAbsoluteTime(row.expiresAt) : null,
  };
}

// ---------------------------------------------------------------------------
// Browser-local revocation overlay (ids only — never key material).
// ---------------------------------------------------------------------------

const STORAGE_KEY = "runbolt.apikeys.revoked.v1";

const listeners = new Set<() => void>();

export function loadLocalRevocations(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export function subscribeApiKeys(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Mark a key revoked in THIS browser only — no server endpoint exists yet. */
export function revokeApiKeyLocally(id: string): void {
  const revoked = loadLocalRevocations();
  if (!revoked.includes(id)) {
    revoked.push(id);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(revoked));
      } catch {
        // Storage unavailable — revocation stays in-memory for this tab.
      }
    }
  }
  listeners.forEach((listener) => listener());
}

/** Overlay local revocations onto server-fetched display rows. */
export function applyLocalRevocations(
  rows: ApiKeyDisplayRow[],
  revokedIds: readonly string[],
): ApiKeyDisplayRow[] {
  if (revokedIds.length === 0) return rows;
  const ids = new Set(revokedIds);
  return rows.map((row) =>
    row.status !== "revoked" && ids.has(row.id)
      ? { ...row, status: "revoked" as const }
      : row,
  );
}
