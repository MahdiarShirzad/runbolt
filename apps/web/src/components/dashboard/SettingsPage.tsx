"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ChevronDownIcon } from "@/components/landing/icons";
import { ArrowUpRightIcon } from "./icons";
import { formatCount, initials } from "@/lib/dashboard/format";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_PREFERENCES,
  loadNotificationPreferences,
  loadPreferences,
  saveNotificationPreferences,
  savePreferences,
  subscribeSettings,
} from "@/lib/dashboard/settings";
import type {
  NotificationPreferences,
  SettingsPreferences,
  SettingsSectionId,
} from "@/lib/dashboard/settings";
import type { SessionUser, WorkspaceSummary } from "@/lib/dashboard/types";
import type { ApiKeyDisplayRow } from "@/lib/dashboard/api-keys";
import { ApiKeysSection } from "./ApiKeysSection";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";
import { SampleDataBadge } from "./SampleDataBadge";
import { primaryActionCls, secondaryActionCls } from "./actions";

const inputCls =
  "h-9 w-full rounded-md border border-line bg-ink px-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary";

const disabledActionCls =
  "inline-flex h-9 items-center justify-center rounded-md border border-line bg-surface px-3.5 text-[13px] text-faint opacity-70 cursor-not-allowed";

const disabledDangerCls =
  "inline-flex h-9 items-center justify-center rounded-md border border-bad/40 px-3.5 text-[13px] text-bad opacity-60 cursor-not-allowed";

const SECTIONS: { id: SettingsSectionId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "workspace", label: "Workspace" },
  { id: "preferences", label: "Preferences" },
  { id: "security", label: "Security" },
  { id: "api-keys", label: "API Keys" },
  { id: "notifications", label: "Notifications" },
  { id: "plan", label: "Plan & usage" },
];

const FALLBACK_TIME_ZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

/** Fixed instant used only to preview zone/clock formatting (no clock read). */
const PREVIEW_ISO = "2026-10-16T14:30:00.000Z";

function formatClockPreview(
  iso: string,
  timezone: string,
  clockFormat: SettingsPreferences["clockFormat"],
): string {
  const date = new Date(iso);
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  };
  if (timezone) options.timeZone = timezone;
  if (clockFormat !== "system") options.hour12 = clockFormat === "12h";
  const label = new Intl.DateTimeFormat("en-US", options).format(date);
  return timezone ? `${label} · ${timezone}` : `${label} · browser time zone`;
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
        {label}
      </dt>
      <dd className="mt-1 text-[13px] text-muted">{children}</dd>
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  labelledBy,
  describedBy,
}: {
  value: T;
  options: { value: T; label: string; disabled?: boolean; title?: string }[];
  onChange: (next: T) => void;
  ariaLabel?: string;
  labelledBy?: string;
  describedBy?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="inline-flex shrink-0 rounded-md border border-line bg-ink p-0.5"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            title={option.title}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`h-7 rounded px-3 text-[12.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
              active
                ? "bg-raised font-medium text-fg"
                : "text-muted hover:text-fg disabled:hover:text-muted"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Switch({
  checked,
  onChange,
  labelledBy,
  describedBy,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  labelledBy: string;
  describedBy?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
        checked ? "border-primary bg-primary/70" : "border-line-strong bg-raised"
      }`}
    >
      <span
        aria-hidden
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
          checked ? "left-[18px] bg-button-text" : "left-0.5 bg-faint"
        }`}
      />
    </button>
  );
}

const SECURITY_ACTIONS = [
  {
    id: "password",
    title: "Change password",
    detail:
      "Password changes require an account endpoint — none exists yet, so no password fields are shown.",
    button: "Change password",
  },
  {
    id: "mfa",
    title: "Two-step verification",
    detail: "TOTP or passkey enrollment is not supported by the API yet.",
    button: "Set up",
  },
  {
    id: "sessions",
    title: "Active sessions",
    detail:
      "Listing or signing out other devices requires the sessions endpoint — not available.",
    button: "Review sessions",
  },
  {
    id: "delete",
    title: "Delete account",
    detail:
      "Account deletion needs a verified backend flow — Runbolt will not simulate it in the browser.",
    button: "Delete account",
    danger: true,
  },
] as const;

const NOTIFICATION_ROWS = [
  {
    id: "workflowFailures",
    title: "Workflow failure alerts",
    detail: "Email when a workflow execution fails.",
  },
  {
    id: "executionSummaries",
    title: "Execution summaries",
    detail: "A periodic digest of workflow runs and outcomes.",
  },
  {
    id: "productAnnouncements",
    title: "Product announcements",
    detail: "New features, templates, and platform updates.",
  },
] as const;

export function SettingsPage({
  user,
  workspace,
  initialSection,
  apiKeyRows,
}: {
  user: SessionUser | null;
  workspace: WorkspaceSummary;
  initialSection: SettingsSectionId;
  apiKeyRows: ApiKeyDisplayRow[];
}) {
  const pathname = usePathname();
  const [section, setSection] = useState<SettingsSectionId>(initialSection);
  const [notice, setNotice] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<SettingsPreferences>({
    ...DEFAULT_PREFERENCES,
  });
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
    ...DEFAULT_NOTIFICATION_PREFERENCES,
  });
  const [timeZones, setTimeZones] = useState<string[]>(FALLBACK_TIME_ZONES);
  const [browserZone, setBrowserZone] = useState("");
  const [previewLabel, setPreviewLabel] = useState("");

  // Profile draft (identity is not persisted anywhere — see saveProfile).
  const [draftName, setDraftName] = useState(user?.name ?? "");
  const [nameError, setNameError] = useState<string | null>(null);

  // Hydrate browser-local preferences; subscribe for updates.
  useEffect(() => {
    function hydrate() {
      setPrefs(loadPreferences());
      setNotifPrefs(loadNotificationPreferences());
    }
    hydrate();
    return subscribeSettings(hydrate);
  }, []);

  // Full time-zone list + browser zone label hydrate after mount so the
  // server-rendered markup (fallback list) matches the first client paint.
  useEffect(() => {
    function hydrateZones() {
      const intl = Intl as typeof Intl & {
        supportedValuesOf?: (key: string) => string[];
      };
      const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (resolved) setBrowserZone(resolved);
      if (typeof intl.supportedValuesOf === "function") {
        const full = intl.supportedValuesOf("timeZone");
        if (Array.isArray(full) && full.length > FALLBACK_TIME_ZONES.length) {
          setTimeZones(full);
        }
      }
    }
    hydrateZones();
  }, []);

  // Preview follows the stored zone/clock format (fixed instant, no clock read).
  useEffect(() => {
    function update() {
      setPreviewLabel(formatClockPreview(PREVIEW_ISO, prefs.timezone, prefs.clockFormat));
    }
    update();
  }, [prefs.timezone, prefs.clockFormat]);

  // Keep the address bar shareable, matching the integrations ?tab= pattern.
  // Aliased paths (/settings/profile, /settings/api-keys) already name the
  // section, so the query must not be appended there.
  useEffect(() => {
    const search =
      section === "profile" || pathname === `/settings/${section}`
        ? ""
        : `?section=${section}`;
    window.history.replaceState(
      null,
      "",
      search ? `${pathname}${search}` : pathname,
    );
  }, [section, pathname]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const nameDirty = draftName !== (user?.name ?? "");

  const handleSaveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = draftName.trim();
    if (!trimmed) {
      setNameError("Enter a display name.");
      return;
    }
    setNameError(null);
    // Honest outcome: there is no account API to write to — never claim success.
    setNotice(
      "Not saved — profile updates require the Runbolt account API, which isn’t connected yet. Your edit is still shown above.",
    );
  };

  const handleCancelProfile = () => {
    setDraftName(user?.name ?? "");
    setNameError(null);
  };

  const setPreference = (patch: Partial<SettingsPreferences>) => {
    savePreferences(patch);
    setNotice("Saved in this browser.");
  };

  const setNotification = (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    saveNotificationPreferences({ ...notifPrefs, [key]: value });
    setNotice("Saved in this browser.");
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            Account
          </p>
          <SampleDataBadge />
        </div>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Your profile, this workspace, and how Runbolt behaves for you.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex gap-1 overflow-x-auto border-b border-line/70"
      >
        {SECTIONS.map((item) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`settings-tab-${item.id}`}
              aria-selected={active}
              aria-controls={`settings-panel-${item.id}`}
              onClick={() => setSection(item.id)}
              className={`-mb-px shrink-0 border-b-2 px-3.5 py-2.5 text-[13px] transition-colors ${
                active
                  ? "border-primary font-medium text-fg"
                  : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-md border border-line/70 bg-primary/[0.04] px-4 py-2.5 text-[12.5px] text-muted"
        >
          {notice}
        </p>
      )}

      {section === "profile" && (
        <div
          role="tabpanel"
          id="settings-panel-profile"
          aria-labelledby="settings-tab-profile"
          className="space-y-4"
        >
          <Panel
            title="Profile"
            subtitle="Personal account"
            headingId="settings-profile-heading"
          >
            {!user ? (
              <EmptyState
                title="No active session"
                description="Profile settings require a signed-in account. The demo session API hasn't returned a user."
                action={
                  <Link href="/login" className={primaryActionCls}>
                    Sign in
                  </Link>
                }
              />
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-line bg-raised text-lg font-semibold text-fg"
                  >
                    {initials(user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-fg">
                      {user.name}
                    </p>
                    <p className="mt-0.5 truncate text-[13px] text-muted">
                      {user.email}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-faint">
                      {user.role}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[12px] text-faint">
                  Profile images aren&apos;t supported yet — Runbolt uses your
                  initials.
                </p>

                <form
                  onSubmit={handleSaveProfile}
                  noValidate
                  className="mt-5 max-w-xl space-y-4"
                >
                  <div>
                    <label
                      htmlFor="settings-display-name"
                      className="mb-1.5 block text-[13px] font-medium text-fg"
                    >
                      Display name
                    </label>
                    <input
                      id="settings-display-name"
                      type="text"
                      value={draftName}
                      onChange={(event) => {
                        setDraftName(event.target.value);
                        if (nameError) setNameError(null);
                      }}
                      autoComplete="off"
                      aria-invalid={Boolean(nameError)}
                      className={`${inputCls} ${nameError ? "border-bad focus:border-bad" : ""}`}
                    />
                    {nameError && (
                      <p role="alert" className="mt-1.5 text-[12.5px] text-bad">
                        {nameError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="settings-email"
                      className="mb-1.5 block text-[13px] font-medium text-fg"
                    >
                      Email
                    </label>
                    <input
                      id="settings-email"
                      type="email"
                      value={user.email}
                      readOnly
                      aria-readonly="true"
                      autoComplete="off"
                      className={`${inputCls} cursor-default text-muted`}
                    />
                    <p className="mt-1.5 text-[12px] text-faint">
                      Email changes and verification status require the account
                      API — not available yet.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="submit"
                      disabled={!nameDirty}
                      className={`${primaryActionCls} disabled:opacity-60`}
                    >
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelProfile}
                      disabled={!nameDirty}
                      className={`${secondaryActionCls} disabled:opacity-60`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </Panel>
        </div>
      )}

      {section === "workspace" && (
        <div
          role="tabpanel"
          id="settings-panel-workspace"
          aria-labelledby="settings-tab-workspace"
          className="space-y-4"
        >
          <Panel
            title="Workspace"
            subtitle="Workspace settings"
            headingId="settings-workspace-heading"
            action={<SampleDataBadge />}
          >
            <dl className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
              <MetaRow label="Workspace name">
                <span className="text-fg">{workspace.name}</span>
              </MetaRow>
              <MetaRow label="Description">
                <span className="text-faint">Not set</span>
              </MetaRow>
              <MetaRow label="Your role">
                {user?.role ? (
                  <span className="text-fg">{user.role}</span>
                ) : (
                  <span className="text-faint">—</span>
                )}
              </MetaRow>
              <MetaRow label="Workflows">
                <span className="font-mono tabular-nums text-fg">
                  {formatCount(workspace.workflowCount)}
                </span>{" "}
                <span className="text-faint">
                  ({formatCount(workspace.activeWorkflowCount)} active)
                </span>
              </MetaRow>
            </dl>
            <p className="mt-4 text-[12.5px] leading-relaxed text-faint">
              Editing the workspace name, description, logo, or members requires
              the workspace API — this sample workspace is read-only.
            </p>
          </Panel>
        </div>
      )}

      {section === "preferences" && (
        <div
          role="tabpanel"
          id="settings-panel-preferences"
          aria-labelledby="settings-tab-preferences"
          className="space-y-4"
        >
          <Panel
            title="Preferences"
            subtitle="This browser"
            headingId="settings-preferences-heading"
          >
            <ul className="divide-y divide-line/50">
              <li className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0">
                <div className="min-w-0">
                  <p
                    id="pref-appearance-label"
                    className="text-[13.5px] font-medium text-fg"
                  >
                    Appearance
                  </p>
                  <p
                    id="pref-appearance-note"
                    className="mt-0.5 max-w-md text-[12.5px] text-muted"
                  >
                    Runbolt ships one dark theme today — Light and System unlock
                    when theming support lands.
                  </p>
                </div>
                <Segmented
                  labelledBy="pref-appearance-label"
                  describedBy="pref-appearance-note"
                  value="dark"
                  onChange={() => undefined}
                  options={[
                    {
                      value: "light",
                      label: "Light",
                      disabled: true,
                      title: "No light theme ships yet.",
                    },
                    { value: "dark", label: "Dark", disabled: true },
                    {
                      value: "system",
                      label: "System",
                      disabled: true,
                      title: "System theme detection ships with theming support.",
                    },
                  ]}
                />
              </li>

              <li className="flex flex-wrap items-start justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium text-fg">Language</p>
                  <p className="mt-0.5 max-w-md text-[12.5px] text-muted">
                    Localization isn&apos;t wired up yet — every surface renders
                    in English.
                  </p>
                </div>
                <p className="shrink-0 text-[13px] text-faint">English (en-US)</p>
              </li>

              <li className="flex flex-wrap items-start justify-between gap-3 py-4">
                <div className="min-w-0">
                  <label
                    id="pref-timezone-label"
                    htmlFor="settings-timezone"
                    className="text-[13.5px] font-medium text-fg"
                  >
                    Time zone
                  </label>
                  <p
                    id="pref-timezone-note"
                    className="mt-0.5 max-w-md text-[12.5px] text-muted"
                  >
                    Used by the preview below. App-wide timestamps follow your
                    browser until the preferences API ships.
                  </p>
                </div>
                <div className="relative shrink-0">
                  <select
                    id="settings-timezone"
                    aria-describedby="pref-timezone-note"
                    value={prefs.timezone}
                    onChange={(event) =>
                      setPreference({ timezone: event.target.value })
                    }
                    className="h-9 w-full max-w-[240px] appearance-none rounded-md border border-line bg-ink pl-3 pr-8 text-[13px] text-fg outline-none transition-colors focus:border-primary sm:w-[240px]"
                  >
                    <option value="">
                      {browserZone
                        ? `Browser default (${browserZone})`
                        : "Browser default"}
                    </option>
                    <option value="UTC">UTC</option>
                    {timeZones
                      .filter((zone) => zone !== "UTC")
                      .map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                  </select>
                  <ChevronDownIcon
                    width={13}
                    height={13}
                    aria-hidden
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint"
                  />
                </div>
              </li>

              <li className="flex flex-wrap items-start justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p
                    id="pref-clock-label"
                    className="text-[13.5px] font-medium text-fg"
                  >
                    Date &amp; time format
                  </p>
                  <p
                    id="pref-clock-note"
                    className="mt-0.5 max-w-md text-[12.5px] text-muted"
                  >
                    Controls how times render in the preview.
                  </p>
                </div>
                <Segmented
                  labelledBy="pref-clock-label"
                  describedBy="pref-clock-note"
                  value={prefs.clockFormat}
                  onChange={(next) => setPreference({ clockFormat: next })}
                  options={[
                    { value: "system", label: "System" },
                    { value: "12h", label: "12-hour" },
                    { value: "24h", label: "24-hour" },
                  ]}
                />
              </li>

              <li className="flex flex-wrap items-start justify-between gap-3 py-4 last:pb-0">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium text-fg">Preview</p>
                  <p className="mt-0.5 max-w-md text-[12.5px] text-muted">
                    Sample instant rendered with the settings above.
                  </p>
                </div>
                <p className="shrink-0 font-mono text-[12.5px] text-fg">
                  {previewLabel || "…"}
                </p>
              </li>
            </ul>
            <p className="mt-4 text-[12.5px] leading-relaxed text-faint">
              Stored in this browser. Nothing here is sent anywhere — syncing
              preferences to your account requires the preferences API.
            </p>
          </Panel>
        </div>
      )}

      {section === "security" && (
        <div
          role="tabpanel"
          id="settings-panel-security"
          aria-labelledby="settings-tab-security"
          className="space-y-4"
        >
          <Panel
            title="Security"
            subtitle="Personal account"
            headingId="settings-security-heading"
          >
            <p className="rounded-md border border-warn/30 bg-warn/[0.07] px-4 py-3 text-[12.5px] leading-relaxed text-warn">
              Security controls require the Runbolt account API — none of these
              actions are connected yet. Runbolt never displays stored
              passwords, tokens, or recovery codes.
            </p>
            <ul className="mt-4 divide-y divide-line/50">
              {SECURITY_ACTIONS.map((action) => (
                <li
                  key={action.id}
                  className="flex flex-wrap items-start justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium text-fg">
                      {action.title}
                    </p>
                    <p className="mt-0.5 max-w-xl text-[12.5px] text-muted">
                      {action.detail}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className={
                      "danger" in action && action.danger
                        ? disabledDangerCls
                        : disabledActionCls
                    }
                  >
                    {action.button}
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {section === "api-keys" && (
        <div
          role="tabpanel"
          id="settings-panel-api-keys"
          aria-labelledby="settings-tab-api-keys"
          className="space-y-4"
        >
          <ApiKeysSection rows={apiKeyRows} />
        </div>
      )}

      {section === "notifications" && (
        <div
          role="tabpanel"
          id="settings-panel-notifications"
          aria-labelledby="settings-tab-notifications"
          className="space-y-4"
        >
          <Panel
            title="Notifications"
            subtitle="Delivery preferences"
            headingId="settings-notifications-heading"
          >
            <ul className="divide-y divide-line/50">
              {NOTIFICATION_ROWS.map((row) => {
                const checked = notifPrefs[row.id];
                return (
                  <li
                    key={row.id}
                    className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p
                        id={`notif-${row.id}-label`}
                        className="text-[13.5px] font-medium text-fg"
                      >
                        {row.title}
                      </p>
                      <p
                        id={`notif-${row.id}-note`}
                        className="mt-0.5 text-[12.5px] text-muted"
                      >
                        {row.detail}
                      </p>
                    </div>
                    <Switch
                      checked={checked}
                      onChange={(next) => setNotification(row.id, next)}
                      labelledBy={`notif-${row.id}-label`}
                      describedBy={`notif-${row.id}-note`}
                    />
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-[12.5px] leading-relaxed text-faint">
              Stored in this browser. Email delivery requires the Runbolt
              notifications API — nothing is sent yet.
            </p>
          </Panel>
        </div>
      )}

      {section === "plan" && (
        <div
          role="tabpanel"
          id="settings-panel-plan"
          aria-labelledby="settings-tab-plan"
          className="space-y-4"
        >
          <Panel
            title="Plan & usage"
            subtitle="Billing"
            headingId="settings-plan-heading"
            action={<SampleDataBadge />}
          >
            <dl className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
              <MetaRow label="Current plan">
                <span
                  className="text-faint"
                  title="The billing API is not connected — no plan data exists."
                >
                  Not connected
                </span>
              </MetaRow>
              <MetaRow label="Workflows">
                <span className="font-mono tabular-nums text-fg">
                  {formatCount(workspace.workflowCount)}
                </span>
              </MetaRow>
              <MetaRow label="Active workflows">
                <span className="font-mono tabular-nums text-fg">
                  {formatCount(workspace.activeWorkflowCount)}
                </span>
              </MetaRow>
              <MetaRow label="Runs (30d)">
                <span className="font-mono tabular-nums text-fg">
                  {formatCount(workspace.runsLast30d)}
                </span>
              </MetaRow>
            </dl>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Link
                href="/pricing"
                className={secondaryActionCls}
                rel="noopener"
              >
                View pricing
                <ArrowUpRightIcon width={13} height={13} aria-hidden />
              </Link>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-faint">
              Plan tiers, quotas, and subscription management require the
              billing API — no plan or quota data exists to show. Pricing is
              informational only.
            </p>
          </Panel>
        </div>
      )}
    </div>
  );
}
