"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
} from "@/components/landing/icons";
import {
  INTEGRATION_AUTH_LABELS,
  INTEGRATION_CATEGORY_LABELS,
  connectIntegration,
  disconnectIntegration,
  findConnection,
  getStoredConnections,
  subscribeIntegrations,
} from "@/lib/dashboard/integrations";
import type {
  Integration,
  IntegrationConnection,
} from "@/lib/dashboard/integrations";
import { primaryActionCls, secondaryActionCls } from "./actions";
import { IntegrationIcon } from "./IntegrationIcon";
import { Panel } from "./Panel";

const inputCls =
  "h-9 w-full rounded-md border border-line bg-ink px-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary";
const inputErrorCls = "border-bad focus:border-bad";

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
        connected
          ? "border-ok/30 bg-ok/10 text-ok"
          : "border-line bg-ink text-faint"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-ok" : "bg-faint"}`}
        aria-hidden
      />
      {connected ? "Connected" : "Not connected"}
    </span>
  );
}

interface FormErrors {
  label?: string;
  secret?: string;
}

export function IntegrationDetailView({ integration }: { integration: Integration }) {
  const router = useRouter();
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [connectedDateLabel, setConnectedDateLabel] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState("");
  const [revealSecret, setRevealSecret] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const cancelDisconnectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function refresh() {
      const stored = getStoredConnections();
      setConnections(stored);
      const match = stored.find((entry) => entry.slug === integration.slug);
      setConnectedDateLabel(
        match
          ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
              new Date(match.connectedAt),
            )
          : null,
      );
    }
    refresh();
    return subscribeIntegrations(refresh);
  }, [integration.slug]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (Object.values(errors).some(Boolean)) {
      document
        .querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    }
  }, [errors]);

  const closeDisconnect = useCallback(() => setConfirmDisconnect(false), []);

  useEffect(() => {
    if (!confirmDisconnect) return;
    cancelDisconnectRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDisconnect();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [confirmDisconnect, closeDisconnect]);

  const connection = findConnection(connections, integration.slug);
  const needsSecret = integration.auth === "api_key";

  const handleConnect = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedLabel = label.trim() || integration.name;
    const nextErrors: FormErrors = {};
    if (!trimmedLabel) nextErrors.label = "Enter an account label.";
    if (needsSecret && secret.trim().length < 8) {
      nextErrors.secret = "Enter the credential (at least 8 characters).";
    }
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    // The credential is used for validation only and never persisted.
    connectIntegration(integration.slug, trimmedLabel);
    setSecret("");
    setRevealSecret(false);
    setNotice(
      `“${integration.name}” connected as ${trimmedLabel} — saved in this browser; the credential was not stored.`,
    );
    router.refresh();
  };

  const handleDisconnect = () => {
    disconnectIntegration(integration.slug);
    setConfirmDisconnect(false);
    setNotice(`“${integration.name}” disconnected.`);
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <Link
        href="/integrations"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
      >
        <ArrowLeftIcon width={13} height={13} aria-hidden />
        Back to integrations
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <IntegrationIcon slug={integration.slug} size={22} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
                {INTEGRATION_CATEGORY_LABELS[integration.category]}
              </p>
              <StatusPill connected={Boolean(connection)} />
            </div>
            <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
              {integration.name}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
              {integration.description}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2.5">
          <Link href="/workflows/new" className={secondaryActionCls}>
            Create workflow
          </Link>
          {connection && (
            <button
              type="button"
              onClick={() => setConfirmDisconnect(true)}
              className="inline-flex h-9 items-center justify-center rounded-md border border-bad/40 px-3.5 text-[13px] text-bad transition-colors hover:bg-bad/10 active:translate-y-px"
            >
              Disconnect…
            </button>
          )}
        </div>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-md border border-line/70 bg-primary/[0.04] px-4 py-2.5 text-[12.5px] text-muted"
        >
          {notice}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="space-y-4">
          <Panel
            title="Capabilities"
            subtitle="Triggers and actions for workflows"
            headingId="integration-capabilities-heading"
          >
            <ul className="space-y-2">
              {integration.capabilities.map((capability) => (
                <li
                  key={capability.label}
                  className="flex items-center justify-between gap-3 rounded-md border border-line bg-ink px-3.5 py-2.5"
                >
                  <span className="min-w-0 truncate text-[13px] text-fg">
                    {capability.label}
                  </span>
                  <span
                    className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
                      capability.kind === "trigger"
                        ? "border-volt/40 bg-volt/10 text-volt"
                        : "border-line bg-surface text-muted"
                    }`}
                  >
                    {capability.kind}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] leading-relaxed text-faint">
              Capabilities become selectable in the workflow editor once it
              ships — linking a connection here is the only setup needed today.
            </p>
            <div className="mt-3">
              <Link href="/workflows/new" className={secondaryActionCls}>
                Start from a workflow
              </Link>
            </div>
          </Panel>

          <Panel
            title="Setup"
            subtitle="What connecting requires"
            headingId="integration-setup-heading"
          >
            <ol className="space-y-3">
              {integration.setupSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line bg-ink font-mono text-[10.5px] text-faint">
                    {index + 1}
                  </span>
                  <span className="text-[13px] leading-relaxed text-muted">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="self-start lg:sticky lg:top-4">
          <Panel
            title="Connection"
            subtitle={INTEGRATION_AUTH_LABELS[integration.auth]}
            headingId="integration-connection-heading"
          >
            {connection ? (
              <div className="space-y-3">
                <dl className="divide-y divide-line/50 rounded-md border border-line bg-ink px-3.5">
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                      Account
                    </dt>
                    <dd className="min-w-0 truncate text-[12.5px] text-fg">
                      {connection.label}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                      Connected
                    </dt>
                    <dd className="text-[12.5px] text-fg">
                      {connectedDateLabel ?? "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt
                      className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint"
                      title="Connection checks require the Runbolt API."
                    >
                      Last check
                    </dt>
                    <dd className="text-[12.5px] text-faint">Not available</dd>
                  </div>
                </dl>
                <p className="flex items-start gap-2 text-[12px] leading-relaxed text-faint">
                  <CheckIcon width={13} height={13} className="mt-0.5 shrink-0 text-ok" />
                  No credentials are stored — only this account label.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmDisconnect(true)}
                  className="inline-flex h-9 w-full items-center justify-center rounded-md border border-bad/40 px-3.5 text-[13px] text-bad transition-colors hover:bg-bad/10"
                >
                  Disconnect
                </button>
              </div>
            ) : integration.auth === "oauth" ? (
              <div className="space-y-3">
                <p className="rounded-md border border-warn/30 bg-warn/[0.07] px-3.5 py-3 text-[12.5px] leading-relaxed text-warn">
                  OAuth authorization requires the Runbolt API, which is not
                  connected yet — Runbolt will not simulate an external sign-in.
                </p>
                <p className="text-[12.5px] leading-relaxed text-muted">
                  Once the API is live, Connect will redirect you to{" "}
                  {integration.name} to grant scopes. The setup steps on the
                  left describe what will be required.
                </p>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="inline-flex h-9 w-full items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-faint opacity-60"
                  title="OAuth connection requires the Runbolt API."
                >
                  Connect via OAuth — unavailable
                </button>
              </div>
            ) : integration.auth === "webhook" ? (
              <form onSubmit={handleConnect} noValidate className="space-y-4">
                <p className="text-[12.5px] leading-relaxed text-muted">
                  Enable inbound webhooks for this workspace. Endpoint URLs and
                  signing secrets are issued by the Runbolt API once it is
                  live.
                </p>
                <div>
                  <label htmlFor="connection-label" className="mb-1.5 block text-[13px] font-medium text-fg">
                    Label
                  </label>
                  <input
                    id="connection-label"
                    type="text"
                    value={label}
                    onChange={(event) => {
                      setLabel(event.target.value);
                      if (errors.label) setErrors((prev) => ({ ...prev, label: undefined }));
                    }}
                    placeholder="Default"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.label)}
                    className={`${inputCls} ${errors.label ? inputErrorCls : ""}`}
                  />
                  {errors.label && (
                    <p role="alert" className="mt-1.5 text-[12.5px] text-bad">
                      {errors.label}
                    </p>
                  )}
                </div>
                <button type="submit" className={`${primaryActionCls} w-full`}>
                  Enable webhooks
                </button>
              </form>
            ) : (
              <form onSubmit={handleConnect} noValidate className="space-y-4">
                <p className="text-[12.5px] leading-relaxed text-muted">
                  Store an account label for this connection. The credential is
                  validated in memory and never written to disk or URLs.
                </p>
                <div>
                  <label htmlFor="connection-label" className="mb-1.5 block text-[13px] font-medium text-fg">
                    Account label
                  </label>
                  <input
                    id="connection-label"
                    type="text"
                    value={label}
                    onChange={(event) => {
                      setLabel(event.target.value);
                      if (errors.label) setErrors((prev) => ({ ...prev, label: undefined }));
                    }}
                    placeholder="e.g. Production"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.label)}
                    className={`${inputCls} ${errors.label ? inputErrorCls : ""}`}
                  />
                  {errors.label && (
                    <p role="alert" className="mt-1.5 text-[12.5px] text-bad">
                      {errors.label}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="connection-secret" className="mb-1.5 block text-[13px] font-medium text-fg">
                    {integration.slug === "postgres"
                      ? "Password"
                      : integration.slug === "amazon-s3"
                        ? "Secret access key"
                        : "API key"}
                  </label>
                  <div className="relative">
                    <input
                      id="connection-secret"
                      type={revealSecret ? "text" : "password"}
                      value={secret}
                      onChange={(event) => {
                        setSecret(event.target.value);
                        if (errors.secret)
                          setErrors((prev) => ({ ...prev, secret: undefined }));
                      }}
                      placeholder="Paste credential"
                      autoComplete="off"
                      spellCheck={false}
                      aria-invalid={Boolean(errors.secret)}
                      className={`${inputCls} pr-10 font-mono ${errors.secret ? inputErrorCls : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setRevealSecret((prev) => !prev)}
                      aria-label={revealSecret ? "Hide credential" : "Show credential"}
                      className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted transition-colors hover:text-fg"
                    >
                      {revealSecret ? (
                        <EyeOffIcon width={14} height={14} />
                      ) : (
                        <EyeIcon width={14} height={14} />
                      )}
                    </button>
                  </div>
                  {errors.secret && (
                    <p role="alert" className="mt-1.5 text-[12.5px] text-bad">
                      {errors.secret}
                    </p>
                  )}
                </div>
                <button type="submit" className={`${primaryActionCls} w-full`}>
                  Save connection
                </button>
                <p className="text-[11.5px] leading-relaxed text-faint">
                  Saved in this browser until the Runbolt API is connected —
                  the credential itself is discarded after validation.
                </p>
              </form>
            )}
          </Panel>
        </div>
      </div>

      {confirmDisconnect && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disconnect-title"
          aria-describedby="disconnect-description"
        >
          <div
            className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
            onClick={closeDisconnect}
            aria-hidden
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface shadow-2xl shadow-overlay/40">
            <div className="px-5 py-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
                Disconnect integration
              </p>
              <h2
                id="disconnect-title"
                className="mt-2 font-display text-lg font-semibold tracking-[-0.01em] text-fg"
              >
                {integration.name}
              </h2>
              <p
                id="disconnect-description"
                className="mt-2.5 text-[13px] leading-relaxed text-muted"
              >
                Workflows using this connection will fail to authenticate until
                it is connected again.
              </p>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-line/70 px-5 py-3.5">
              <button
                ref={cancelDisconnectRef}
                type="button"
                onClick={closeDisconnect}
                className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                className="inline-flex h-9 items-center justify-center rounded-md bg-bad px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-bad/90 active:translate-y-px"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
