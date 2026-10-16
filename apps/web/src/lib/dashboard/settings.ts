/**
 * Settings — browser-local preferences adapter.
 *
 * Only non-secret display/notification preferences live here, following the
 * same localStorage pub/sub pattern as workflows, integrations, and
 * credentials metadata. Nothing sensitive (passwords, tokens, sessions) is
 * part of this contract.
 *
 * TODO(api): no settings endpoints exist yet — the UI must stay honest:
 *   preferences   → `PATCH /v1/me/preferences` does not exist
 *   notifications → `PATCH /v1/me/notifications` does not exist
 * Profile and workspace fields are not persisted here at all: identity data
 * requires the account API, and this browser store must not pretend otherwise.
 */

export interface SettingsPreferences {
  /** IANA zone id; "" follows the browser's time zone. */
  timezone: string;
  /** How clock times render in the preview: locale default or a fixed style. */
  clockFormat: "system" | "12h" | "24h";
}

export interface NotificationPreferences {
  workflowFailures: boolean;
  executionSummaries: boolean;
  productAnnouncements: boolean;
}

export const DEFAULT_PREFERENCES: SettingsPreferences = {
  timezone: "",
  clockFormat: "system",
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  workflowFailures: true,
  executionSummaries: false,
  productAnnouncements: false,
};

/** Valid `?section=` values for /settings (validated server-side too). */
export const SETTINGS_SECTION_IDS = [
  "profile",
  "workspace",
  "preferences",
  "security",
  "api-keys",
  "notifications",
  "plan",
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTION_IDS)[number];

export function isSettingsSectionId(value: string): value is SettingsSectionId {
  return (SETTINGS_SECTION_IDS as readonly string[]).includes(value);
}

const STORAGE_KEY = "runbolt.settings.local.v1";

interface SettingsState {
  preferences: SettingsPreferences;
  notifications: NotificationPreferences;
}

const listeners = new Set<() => void>();

function fallbackState(): SettingsState {
  return {
    preferences: { ...DEFAULT_PREFERENCES },
    notifications: { ...DEFAULT_NOTIFICATION_PREFERENCES },
  };
}

function readState(): SettingsState {
  if (typeof window === "undefined") return fallbackState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallbackState();
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed == null) return fallbackState();
    const state = parsed as Record<string, unknown>;
    const p =
      typeof state.preferences === "object" && state.preferences !== null
        ? (state.preferences as Record<string, unknown>)
        : {};
    const n =
      typeof state.notifications === "object" && state.notifications !== null
        ? (state.notifications as Record<string, unknown>)
        : {};
    const fallback = fallbackState();
    const preferences: SettingsPreferences = {
      timezone: typeof p.timezone === "string" ? p.timezone : fallback.preferences.timezone,
      clockFormat:
        p.clockFormat === "system" || p.clockFormat === "12h" || p.clockFormat === "24h"
          ? p.clockFormat
          : fallback.preferences.clockFormat,
    };
    const notifications: NotificationPreferences = {
      workflowFailures:
        typeof n.workflowFailures === "boolean"
          ? n.workflowFailures
          : fallback.notifications.workflowFailures,
      executionSummaries:
        typeof n.executionSummaries === "boolean"
          ? n.executionSummaries
          : fallback.notifications.executionSummaries,
      productAnnouncements:
        typeof n.productAnnouncements === "boolean"
          ? n.productAnnouncements
          : fallback.notifications.productAnnouncements,
    };
    return { preferences, notifications };
  } catch {
    return fallbackState();
  }
}

function writeState(state: SettingsState): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable — state stays in-memory for this tab.
    }
  }
  listeners.forEach((listener) => listener());
}

export function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function loadPreferences(): SettingsPreferences {
  return readState().preferences;
}

export function loadNotificationPreferences(): NotificationPreferences {
  return readState().notifications;
}

/** Persist preference metadata only. */
export function savePreferences(patch: Partial<SettingsPreferences>): void {
  const state = readState();
  writeState({
    ...state,
    preferences: { ...state.preferences, ...patch },
  });
}

/** Persist notification intent only — no addresses, no tokens. */
export function saveNotificationPreferences(
  patch: Partial<NotificationPreferences>,
): void {
  const state = readState();
  writeState({
    ...state,
    notifications: { ...state.notifications, ...patch },
  });
}
