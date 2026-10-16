"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon } from "@/components/landing/icons";
import {
  currentTimestamp,
  formatAbsoluteTime,
  formatRelativeTime,
} from "@/lib/dashboard/format";
import {
  CREDENTIAL_TYPE_DESCRIPTIONS,
  CREDENTIAL_TYPE_LABELS,
  loadLocalCredentials,
  removeLocalCredential,
  subscribeCredentials,
  updateLocalCredential,
} from "@/lib/dashboard/credentials";
import type {
  CredentialMetadata,
  LocalCredentialRecord,
} from "@/lib/dashboard/credentials";
import { INTEGRATIONS } from "@/lib/dashboard/integrations";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";
import { SampleDataBadge } from "./SampleDataBadge";
import { primaryActionCls, secondaryActionCls } from "./actions";

type ResolvedView =
  | { kind: "pending" }
  | { kind: "missing" }
  | {
      kind: "sample";
      credential: CredentialMetadata;
      createdLabel: string;
      createdAbsolute: string;
      updatedLabel: string;
      updatedAbsolute: string;
    }
  | {
      kind: "local";
      credential: LocalCredentialRecord;
      createdLabel: string;
      createdAbsolute: string;
      updatedLabel: string;
      updatedAbsolute: string;
    };

const dangerActionCls =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-bad/40 px-3.5 text-[13px] text-bad transition-colors hover:bg-bad/10 active:translate-y-px";

const inputCls =
  "h-9 w-full rounded-md border border-line bg-ink px-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary";

const FIELD_LABELS: Record<string, string> = {
  username: "Username",
  host: "Host",
  headerName: "Header name",
};

export function CredentialDetailView({
  sample,
  paramId,
}: {
  sample: CredentialMetadata | null;
  paramId: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<ResolvedView>({ kind: "pending" });
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function resolve() {
      const now = currentTimestamp();
      const locals = loadLocalCredentials();
      const local = locals.find(
        (record) => record.id === paramId || record.name === paramId,
      );
      if (local) {
        setView({
          kind: "local",
          credential: local,
          createdLabel: formatRelativeTime(local.createdAt, now),
          createdAbsolute: formatAbsoluteTime(local.createdAt),
          updatedLabel: formatRelativeTime(local.updatedAt, now),
          updatedAbsolute: formatAbsoluteTime(local.updatedAt),
        });
        setEditName(local.name);
        setEditDescription(local.description);
        return;
      }
      if (sample) {
        setView({
          kind: "sample",
          credential: sample,
          createdLabel: formatRelativeTime(sample.createdAt, now),
          createdAbsolute: formatAbsoluteTime(sample.createdAt),
          updatedLabel: formatRelativeTime(sample.updatedAt, now),
          updatedAbsolute: formatAbsoluteTime(sample.updatedAt),
        });
        return;
      }
      setView({ kind: "missing" });
    }
    resolve();
    return subscribeCredentials(resolve);
  }, [sample, paramId]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const closeDelete = useCallback(() => setConfirmDelete(false), []);

  useEffect(() => {
    if (!confirmDelete) return;
    cancelDeleteRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDelete();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [confirmDelete, closeDelete]);

  const closeTest = useCallback(() => setTestOpen(false), []);

  useEffect(() => {
    if (!testOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTest();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [testOpen, closeTest]);

  if (view.kind === "pending") {
    return (
      <Panel title="Loading credential" headingId="credential-detail-heading">
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          <div className="h-4 w-48 animate-pulse rounded bg-hover" />
          <div className="h-3 w-72 animate-pulse rounded bg-hover" />
          <div className="h-3 w-56 animate-pulse rounded bg-hover" />
        </div>
      </Panel>
    );
  }

  if (view.kind === "missing") {
    return (
      <div className="space-y-4">
        <BackLink />
        <Panel title="Credential" headingId="credential-detail-heading">
          <EmptyState
            title="Credential not found"
            description="It may have been deleted in this browser, or the link is out of date."
            action={
              <Link href="/credentials" className={primaryActionCls}>
                Back to credentials
              </Link>
            }
          />
        </Panel>
      </div>
    );
  }

  const isLocal = view.kind === "local";
  const credentialId = view.credential.id;
  const name = view.credential.name;
  const type = view.credential.type;
  const integrationSlug = view.credential.integrationSlug;
  const integrationName =
    view.kind === "sample"
      ? view.credential.integrationName
      : (INTEGRATIONS.find((i) => i.slug === view.credential.integrationSlug)
          ?.name ?? null);
  const description = view.credential.description;
  const fields = view.credential.fields;

  const handleDelete = () => {
    removeLocalCredential(view.credential.id);
    setConfirmDelete(false);
    router.push("/credentials");
  };

  const handleSaveMetadata = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = editName.trim();
    if (!trimmedName || view.kind !== "local") return;
    updateLocalCredential(view.credential.id, {
      name: trimmedName,
      description: editDescription.trim(),
    });
    setNotice("Metadata updated — saved in this browser.");
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <BackLink />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
              Credential
            </p>
            {view.kind === "sample" && <SampleDataBadge />}
            {isLocal && (
              <span
                className="rounded border border-line bg-ink px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint"
                title="Created in this browser — metadata only."
              >
                Local
              </span>
            )}
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            {name}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center rounded border border-line bg-ink px-1.5 py-0.5 font-mono text-[10.5px] text-muted">
              {CREDENTIAL_TYPE_LABELS[type]}
            </span>
            <span className="text-[12.5px] text-muted">
              {integrationName ?? "Not linked"}
            </span>
            <span className="font-mono text-[11px] text-faint">
              {credentialId}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setTestOpen(true)}
            className={secondaryActionCls}
          >
            Test connection
          </button>
          {isLocal && (
            <>
              <button
                type="button"
                onClick={() => setShowReplace((prev) => !prev)}
                className={secondaryActionCls}
              >
                Replace secret…
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className={dangerActionCls}
              >
                Delete…
              </button>
            </>
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

      <Panel title="Overview" headingId="credential-overview-heading">
        <dl className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
          <MetaRow label="Type">
            <span className="text-fg">{CREDENTIAL_TYPE_LABELS[type]}</span>
            <p className="mt-0.5 text-[12px] text-muted">
              {CREDENTIAL_TYPE_DESCRIPTIONS[type]}
            </p>
          </MetaRow>
          <MetaRow label="Integration">
            {integrationName ? (
              <Link
                href={`/integrations/${integrationSlug}`}
                className="transition-colors hover:text-primary-strong"
              >
                {integrationName}
              </Link>
            ) : (
              <span className="text-faint">Not linked</span>
            )}
          </MetaRow>
          <MetaRow label="Created">
            <time
              dateTime={view.credential.createdAt}
              title={view.createdAbsolute}
            >
              {view.createdLabel}
            </time>
          </MetaRow>
          <MetaRow label="Updated">
            <time
              dateTime={view.credential.updatedAt}
              title={view.updatedAbsolute}
            >
              {view.updatedLabel}
            </time>
          </MetaRow>
          <MetaRow label="Last checked">
            <span
              className="text-faint"
              title="Connection testing requires the Runbolt API."
            >
              Not checked
            </span>
          </MetaRow>
          <MetaRow label="Description">
            {description ? (
              <span className="text-fg">{description}</span>
            ) : (
              <span className="text-faint">None</span>
            )}
          </MetaRow>
        </dl>
      </Panel>

      <Panel
        title="Security"
        subtitle="How secrets are handled"
        headingId="credential-security-heading"
      >
        <p className="rounded-md border border-line/70 bg-ink px-4 py-3 text-[12.5px] leading-relaxed text-muted">
          <strong className="font-medium text-fg">Secret values are not shown
          here and cannot be retrieved.</strong> This browser only stores
          non-secret metadata (name, type, integration, and setup fields). The
          secret you typed at creation was validated in memory and discarded —
          Runbolt will not persist secrets in localStorage. Encrypted
          credential storage requires the Runbolt API.
        </p>
        {Object.keys(fields).length > 0 && (
          <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {Object.entries(fields).map(([key, value]) => (
              <MetaRow key={key} label={FIELD_LABELS[key] ?? key}>
                <span className="font-mono text-[12.5px] text-fg">{value}</span>
              </MetaRow>
            ))}
          </dl>
        )}
      </Panel>

      {showReplace && isLocal && (
        <Panel
          title="Replace secret"
          subtitle="Requires the Runbolt API"
          headingId="credential-replace-heading"
        >
          <p className="rounded-md border border-warn/30 bg-warn/[0.07] px-4 py-3 text-[12.5px] leading-relaxed text-warn">
            Replacing a stored secret requires the encrypted credential API —
            Runbolt will not accept secret values in the browser. Once the API
            ships, this panel will open a write-only form that updates the
            server-side secret without ever reading the old one back.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowReplace(false)}
              className={secondaryActionCls}
            >
              Close
            </button>
          </div>
        </Panel>
      )}

      <Panel title="Usage" subtitle="Workflows referencing this credential" headingId="credential-usage-heading">
        <EmptyState
          title="Usage not available yet"
          description="Which workflows reference this credential is computed by the Runbolt API. Showing usage would require inventing data, so it is left empty until the API exists."
        />
      </Panel>

      {isLocal ? (
        <Panel title="Edit metadata" subtitle="Name and description only — secrets are not editable here" headingId="credential-edit-heading">
          <form onSubmit={handleSaveMetadata} className="space-y-4">
            <div>
              <label htmlFor="credential-edit-name" className="mb-1.5 block text-[13px] font-medium text-fg">
                Name
              </label>
              <input
                id="credential-edit-name"
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                autoComplete="off"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="credential-edit-description" className="mb-1.5 block text-[13px] font-medium text-fg">
                Description <span className="text-faint">(optional)</span>
              </label>
              <input
                id="credential-edit-description"
                type="text"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                autoComplete="off"
                className={inputCls}
              />
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button type="submit" className={primaryActionCls}>
                Save metadata
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditName(view.kind === "local" ? view.credential.name : "");
                  setEditDescription(
                    view.kind === "local" ? view.credential.description : "",
                  );
                }}
                className={secondaryActionCls}
              >
                Reset
              </button>
            </div>
          </form>
        </Panel>
      ) : (
        <Panel title="Edit metadata" subtitle="Sample credentials are read-only" headingId="credential-edit-heading">
          <p className="text-[12.5px] leading-relaxed text-muted">
            This is a deterministic sample record for the UI baseline. It cannot
            be renamed, re-typed, or deleted. Create a local credential to try
            the editable workflow.
          </p>
          <div className="mt-4">
            <Link href="/credentials/new" className={secondaryActionCls}>
              Add credential
            </Link>
          </div>
        </Panel>
      )}

      {confirmDelete && isLocal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-credential-title"
          aria-describedby="delete-credential-description"
        >
          <div
            className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
            onClick={closeDelete}
            aria-hidden
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface shadow-2xl shadow-overlay/40">
            <div className="px-5 py-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
                Delete credential
              </p>
              <h2
                id="delete-credential-title"
                className="mt-2 font-display text-lg font-semibold tracking-[-0.01em] text-fg"
              >
                {view.credential.name}
              </h2>
              <p className="mt-1 font-mono text-[11px] text-faint">
                {CREDENTIAL_TYPE_LABELS[view.credential.type]}
              </p>
              <p
                id="delete-credential-description"
                className="mt-2.5 text-[13px] leading-relaxed text-muted"
              >
                This removes the credential metadata from this browser. No
                secret value is stored, so none can be recovered. Workflows that
                will eventually reference it by ID would need the API to
                re-resolve.
              </p>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-line/70 px-5 py-3.5">
              <button
                ref={cancelDeleteRef}
                type="button"
                onClick={closeDelete}
                className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex h-9 items-center justify-center rounded-md bg-bad px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-bad/90 active:translate-y-px"
              >
                Delete credential
              </button>
            </div>
          </div>
        </div>
      )}

      {testOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="test-credential-title"
        >
          <div
            className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
            onClick={closeTest}
            aria-hidden
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface shadow-2xl shadow-overlay/40">
            <div className="px-5 py-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
                Test connection
              </p>
              <h2
                id="test-credential-title"
                className="mt-2 font-display text-lg font-semibold tracking-[-0.01em] text-fg"
              >
                {name}
              </h2>
              <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
                <strong className="font-medium text-fg">Connection testing is
                not available.</strong> It requires the Runbolt API to attempt a
                server-side call with the stored secret. Runbolt will not fake a
                success or failure result here — the status stays “Not checked”
                until a real validation endpoint exists.
              </p>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-line/70 px-5 py-3.5">
              <button
                type="button"
                onClick={closeTest}
                className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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

function BackLink() {
  return (
    <Link
      href="/credentials"
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
    >
      <ArrowLeftIcon width={13} height={13} aria-hidden />
      Back to credentials
    </Link>
  );
}
