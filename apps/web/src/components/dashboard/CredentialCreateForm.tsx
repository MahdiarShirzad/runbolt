"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
} from "@/components/landing/icons";
import { currentTimestamp } from "@/lib/dashboard/format";
import {
  CREDENTIAL_TYPE_DESCRIPTIONS,
  CREDENTIAL_TYPE_LABELS,
  addLocalCredential,
} from "@/lib/dashboard/credentials";
import type { CredentialType } from "@/lib/dashboard/credentials";
import { Panel } from "./Panel";
import { primaryActionCls, secondaryActionCls } from "./actions";

const inputCls =
  "h-9 w-full rounded-md border border-line bg-ink px-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary";
const inputErrorCls = "border-bad focus:border-bad";

const TYPE_ORDER: CredentialType[] = [
  "api_key",
  "bearer_token",
  "basic_auth",
  "database",
  "custom_header",
  "oauth",
];

const SECRET_TYPES: CredentialType[] = [
  "api_key",
  "bearer_token",
  "basic_auth",
  "database",
  "custom_header",
];

interface FormErrors {
  name?: string;
  secret?: string;
  username?: string;
  host?: string;
  headerName?: string;
}

export function CredentialCreateForm({
  integrationOptions,
}: {
  integrationOptions: { slug: string; name: string }[];
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CredentialType>("api_key");
  const [integrationSlug, setIntegrationSlug] = useState("");
  const [description, setDescription] = useState("");
  const [secret, setSecret] = useState("");
  const [username, setUsername] = useState("");
  const [host, setHost] = useState("");
  const [headerName, setHeaderName] = useState("");
  const [revealSecret, setRevealSecret] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ id: string; name: string } | null>(
    null,
  );
  const rootRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (Object.values(errors).some(Boolean)) {
      rootRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [errors]);

  const supportsSecret = SECRET_TYPES.includes(type);
  const isOAuth = type === "oauth";

  const resetSecretFields = () => {
    setSecret("");
    setUsername("");
    setHost("");
    setHeaderName("");
    setRevealSecret(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || created) return;

    const trimmedName = name.trim();
    const nextErrors: FormErrors = {};
    if (!trimmedName) nextErrors.name = "Enter a name for this credential.";
    if (isOAuth) {
      // OAuth creation requires the backend redirect flow — never simulated.
      return;
    }
    if (supportsSecret && secret.trim().length < 8) {
      nextErrors.secret = "Enter the secret value (at least 8 characters).";
    }
    if (type === "basic_auth" && !username.trim()) {
      nextErrors.username = "Enter the username.";
    }
    if (type === "database") {
      if (!username.trim()) nextErrors.username = "Enter the database user.";
      if (!host.trim()) nextErrors.host = "Enter the database host.";
    }
    if (type === "custom_header" && !headerName.trim()) {
      nextErrors.headerName = "Enter the header name, e.g. X-Api-Key.";
    }

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);

    // Non-secret setup fields only — the secret value is never passed here.
    const fields: Record<string, string> = {};
    if (type === "basic_auth" || type === "database") {
      fields.username = username.trim();
    }
    if (type === "database") fields.host = host.trim();
    if (type === "custom_header") fields.headerName = headerName.trim();

    const id = `local_${Date.now().toString(36)}_${trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24)}`;
    const now = new Date(currentTimestamp()).toISOString();

    addLocalCredential({
      id,
      name: trimmedName,
      type,
      integrationSlug: integrationSlug || null,
      description: description.trim(),
      fields,
      createdAt: now,
      updatedAt: now,
    });

    // Clear every secret-bearing value from component state immediately.
    resetSecretFields();
    setSubmitting(false);
    setCreated({ id, name: trimmedName });
  };

  if (created) {
    return (
      <div className="space-y-4 lg:space-y-5">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            Secrets store
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            Credential created
          </h1>
        </div>
        <Panel title="What was saved" headingId="credential-created-heading">
          <p
            role="status"
            className="rounded-md border border-ok/30 bg-ok/[0.06] px-4 py-3 text-[13px] leading-relaxed text-muted"
          >
            “{created.name}” was saved as metadata in this browser. The secret
            you entered was <strong className="font-medium text-fg">not
            stored</strong> — encrypted credential storage requires the Runbolt
            API, and Runbolt will not persist secrets in localStorage.
          </p>
          <p className="mt-3 text-[12.5px] leading-relaxed text-faint">
            Once the API is connected, this record will reference the secret
            stored server-side. Workflows will reference it by ID, never by
            value.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link href={`/credentials/${created.id}`} className={primaryActionCls}>
              View credential
            </Link>
            <button
              type="button"
              onClick={() => {
                setCreated(null);
                setName("");
                setDescription("");
                setIntegrationSlug("");
                setErrors({});
              }}
              className={secondaryActionCls}
            >
              Add another
            </button>
            <Link href="/credentials" className={secondaryActionCls}>
              Back to credentials
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <form
      ref={rootRef}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 lg:space-y-5"
    >
      <Link
        href="/credentials"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
      >
        <ArrowLeftIcon width={13} height={13} aria-hidden />
        Back to credentials
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            Secrets store
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            Add credential
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Name the credential, pick its type, and enter the secret — it is
            validated in memory and never written to this browser.
          </p>
        </div>
      </div>

      <Panel title="Basics" subtitle="Name and integration" headingId="credential-basics-heading">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="credential-name" className="mb-1.5 block text-[13px] font-medium text-fg">
              Name
            </label>
            <input
              id="credential-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. Production API key"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              className={`${inputCls} ${errors.name ? inputErrorCls : ""}`}
            />
            {errors.name && (
              <p role="alert" className="mt-1.5 text-[12.5px] text-bad">
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="credential-integration" className="mb-1.5 block text-[13px] font-medium text-fg">
              Integration <span className="text-faint">(optional)</span>
            </label>
            <div className="relative">
              <select
                id="credential-integration"
                value={integrationSlug}
                onChange={(event) => setIntegrationSlug(event.target.value)}
                className={`${inputCls} appearance-none pr-8`}
              >
                <option value="">Not linked</option>
                {integrationOptions.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name}
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
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="credential-description" className="mb-1.5 block text-[13px] font-medium text-fg">
            Description <span className="text-faint">(optional)</span>
          </label>
          <input
            id="credential-description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What this credential is used for"
            autoComplete="off"
            className={inputCls}
          />
        </div>
      </Panel>

      <Panel title="Type" subtitle="How the secret is supplied" headingId="credential-type-heading">
        <fieldset>
          <legend className="sr-only">Credential type</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TYPE_ORDER.map((option) => {
              const checked = type === option;
              return (
                <label
                  key={option}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-md border px-3.5 py-3 transition-colors ${
                    checked
                      ? "border-primary bg-primary/[0.06]"
                      : "border-line bg-ink hover:border-line-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="credential-type"
                    value={option}
                    checked={checked}
                    onChange={() => {
                      setType(option);
                      resetSecretFields();
                      setErrors({});
                    }}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${
                      checked ? "border-primary" : "border-line-strong"
                    }`}
                  >
                    {checked && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium text-fg">
                      {CREDENTIAL_TYPE_LABELS[option]}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-muted">
                      {CREDENTIAL_TYPE_DESCRIPTIONS[option]}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </Panel>

      {isOAuth ? (
        <Panel title="OAuth connection" subtitle="Requires the Runbolt API" headingId="credential-oauth-heading">
          <p className="rounded-md border border-warn/30 bg-warn/[0.07] px-4 py-3 text-[12.5px] leading-relaxed text-warn">
            OAuth connections are authorized through the provider&apos;s redirect
            flow, which the Runbolt API must host. Runbolt will not ask you to
            paste access tokens or simulate a successful authorization.
          </p>
          <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
            Once the OAuth flow ships, selecting this type will start the
            provider consent screen after you name the credential.
          </p>
          <div className="mt-4">
            <Link href="/credentials" className={secondaryActionCls}>
              Back to credentials
            </Link>
          </div>
        </Panel>
      ) : (
        <Panel
          title="Secret"
          subtitle="Never stored in this browser"
          headingId="credential-secret-heading"
        >
          <div className="space-y-4">
            {(type === "basic_auth" || type === "database") && (
              <div>
                <label htmlFor="credential-username" className="mb-1.5 block text-[13px] font-medium text-fg">
                  {type === "database" ? "Database user" : "Username"}
                </label>
                <input
                  id="credential-username"
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    if (errors.username)
                      setErrors((prev) => ({ ...prev, username: undefined }));
                  }}
                  placeholder={type === "database" ? "report_reader" : "username"}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(errors.username)}
                  className={`${inputCls} ${errors.username ? inputErrorCls : ""}`}
                />
                {errors.username && (
                  <p role="alert" className="mt-1.5 text-[12.5px] text-bad">
                    {errors.username}
                  </p>
                )}
              </div>
            )}

            {type === "database" && (
              <div>
                <label htmlFor="credential-host" className="mb-1.5 block text-[13px] font-medium text-fg">
                  Host
                </label>
                <input
                  id="credential-host"
                  type="text"
                  value={host}
                  onChange={(event) => {
                    setHost(event.target.value);
                    if (errors.host)
                      setErrors((prev) => ({ ...prev, host: undefined }));
                  }}
                  placeholder="db.example.internal"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(errors.host)}
                  className={`${inputCls} font-mono ${errors.host ? inputErrorCls : ""}`}
                />
                {errors.host && (
                  <p role="alert" className="mt-1.5 text-[12.5px] text-bad">
                    {errors.host}
                  </p>
                )}
              </div>
            )}

            {type === "custom_header" && (
              <div>
                <label htmlFor="credential-header-name" className="mb-1.5 block text-[13px] font-medium text-fg">
                  Header name
                </label>
                <input
                  id="credential-header-name"
                  type="text"
                  value={headerName}
                  onChange={(event) => {
                    setHeaderName(event.target.value);
                    if (errors.headerName)
                      setErrors((prev) => ({ ...prev, headerName: undefined }));
                  }}
                  placeholder="X-Api-Key"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(errors.headerName)}
                  className={`${inputCls} font-mono ${errors.headerName ? inputErrorCls : ""}`}
                />
                {errors.headerName && (
                  <p role="alert" className="mt-1.5 text-[12.5px] text-bad">
                    {errors.headerName}
                  </p>
                )}
              </div>
            )}

            {supportsSecret && (
              <div>
                <label htmlFor="credential-secret" className="mb-1.5 block text-[13px] font-medium text-fg">
                  {type === "api_key"
                    ? "API key"
                    : type === "bearer_token"
                      ? "Token"
                      : type === "database"
                        ? "Password"
                        : type === "custom_header"
                          ? "Header value"
                          : "Password"}
                </label>
                <div className="relative">
                  <input
                    id="credential-secret"
                    type={revealSecret ? "text" : "password"}
                    value={secret}
                    onChange={(event) => {
                      setSecret(event.target.value);
                      if (errors.secret)
                        setErrors((prev) => ({ ...prev, secret: undefined }));
                    }}
                    placeholder="Paste secret value"
                    autoComplete="new-password"
                    spellCheck={false}
                    aria-invalid={Boolean(errors.secret)}
                    className={`${inputCls} pr-10 font-mono ${errors.secret ? inputErrorCls : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setRevealSecret((prev) => !prev)}
                    aria-label={revealSecret ? "Hide secret" : "Show secret"}
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
            )}

            <p className="rounded-md border border-line/70 bg-ink px-3.5 py-2.5 text-[12px] leading-relaxed text-faint">
              This secret is validated in memory and discarded — it is never
              written to localStorage, URLs, or logs. Encrypted storage needs
              the Runbolt API.
            </p>
          </div>
        </Panel>
      )}

      {!isOAuth && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={`${primaryActionCls} disabled:opacity-60`}
          >
            {submitting ? "Saving…" : "Create credential"}
          </button>
          <Link href="/credentials" className={secondaryActionCls}>
            Cancel
          </Link>
        </div>
      )}
    </form>
  );
}
