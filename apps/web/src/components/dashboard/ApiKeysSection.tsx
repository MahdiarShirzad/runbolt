"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { SearchIcon } from "@/components/landing/icons";
import { formatCount } from "@/lib/dashboard/format";
import {
  API_KEY_STATUS_LABELS,
  applyLocalRevocations,
  loadLocalRevocations,
  revokeApiKeyLocally,
  subscribeApiKeys,
} from "@/lib/dashboard/api-keys";
import type { ApiKeyDisplayRow, ApiKeyStatus } from "@/lib/dashboard/api-keys";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";
import { SampleDataBadge } from "./SampleDataBadge";
import { primaryActionCls, secondaryActionCls } from "./actions";

const inputCls =
  "h-9 w-full rounded-md border border-line bg-ink px-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary";

const selectCls =
  "h-9 appearance-none rounded-md border border-line bg-ink pl-3 pr-8 text-[12.5px] text-fg outline-none transition-colors focus:border-primary";

const revokeConfirmCls =
  "inline-flex h-9 items-center justify-center rounded-md bg-bad px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-bad/90 active:translate-y-px";

const thCls =
  "px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint";

const STATUS_OPTIONS: { value: ApiKeyStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "revoked", label: "Revoked" },
];

const STATUS_STYLES: Record<ApiKeyStatus, { dot: string; text: string }> = {
  active: { dot: "bg-ok", text: "text-ok" },
  expired: { dot: "bg-warn", text: "text-warn" },
  revoked: { dot: "bg-faint", text: "text-faint" },
};

function ApiKeyStatusBadge({ status }: { status: ApiKeyStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium ${style.text}`}
    >
      <span className={`h-[7px] w-[7px] rounded-full ${style.dot}`} aria-hidden />
      {API_KEY_STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Settings → API keys. Honest surface: rows are labeled sample data, key
 * values are masked hints only, creation reports the missing endpoint
 * instead of minting a fake key, and revoke marks the row revoked in this
 * browser with an explicit notice (no server endpoint exists yet).
 */
export function ApiKeysSection({ rows }: { rows: ApiKeyDisplayRow[] }) {
  const [revokedIds, setRevokedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApiKeyStatus | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [createNotice, setCreateNotice] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyDisplayRow | null>(null);
  const cancelCreateRef = useRef<HTMLButtonElement>(null);
  const cancelRevokeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function sync() {
      setRevokedIds(loadLocalRevocations());
    }
    sync();
    return subscribeApiKeys(sync);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const closeCreate = useCallback(() => setCreateOpen(false), []);
  const closeRevoke = useCallback(() => setRevokeTarget(null), []);

  useEffect(() => {
    if (!createOpen) return;
    cancelCreateRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeCreate();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [createOpen, closeCreate]);

  useEffect(() => {
    if (!revokeTarget) return;
    cancelRevokeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeRevoke();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revokeTarget, closeRevoke]);

  const all = applyLocalRevocations(rows, revokedIds);
  const q = query.trim().toLowerCase();
  const visible = all.filter((row) => {
    if (statusFilter !== "all" && row.status !== statusFilter) return false;
    if (!q) return true;
    return (
      row.name.toLowerCase().includes(q) || row.keyHint.toLowerCase().includes(q)
    );
  });
  const hasActiveFilters = query.trim() !== "" || statusFilter !== "all";

  const openCreate = () => {
    setKeyName("");
    setNameError(null);
    setCreateNotice(null);
    setCreateOpen(true);
  };

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = keyName.trim();
    if (!trimmed) {
      setNameError("Enter a key name.");
      return;
    }
    setNameError(null);
    // Honest outcome: no endpoint mints keys — never fabricate a secret.
    setCreateNotice(
      "Not created — issuing a key requires POST /v1/api-keys, which isn’t connected yet. No key was generated, so there is nothing to copy.",
    );
  };

  const handleRevoke = () => {
    if (!revokeTarget) return;
    revokeApiKeyLocally(revokeTarget.id);
    setRevokeTarget(null);
    setNotice(
      "Revoked in this browser. Server-side revocation requires DELETE /v1/api-keys/:id, which isn’t connected — no server-side key was invalidated.",
    );
  };

  return (
    <div className="space-y-4">
      <Panel
        title="API keys"
        subtitle="Programmatic access"
        headingId="settings-api-keys-heading"
        action={
          <button type="button" onClick={openCreate} className={primaryActionCls}>
            Create API key
          </button>
        }
      >
        <p className="text-[13px] leading-relaxed text-muted">
          API keys authenticate scripts, CI pipelines, and integrations
          against the Runbolt API. They are a separate credential class from
          integration credentials, webhook signing secrets, and your session —
          only keys belong here, and a full key value is never shown again
          after creation.
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[12.5px] leading-relaxed text-faint">
          <SampleDataBadge />
          <span>
            Rows below are deterministic sample data. Listing, creating, and
            revoking real keys requires the Runbolt API (GET / POST / DELETE
            /v1/api-keys), which isn’t connected yet.
          </span>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <label htmlFor="api-keys-search" className="sr-only">
              Search API keys
            </label>
            <SearchIcon
              width={14}
              height={14}
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              id="api-keys-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search API keys"
              className="h-9 w-full rounded-md border border-line bg-ink pl-8 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary"
            />
          </div>

          <div className="relative">
            <label htmlFor="api-keys-status" className="sr-only">
              Filter by status
            </label>
            <select
              id="api-keys-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ApiKeyStatus | "all")
              }
              className={selectCls}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 rounded-md px-2.5 text-[12.5px] text-muted transition-colors hover:text-fg"
            >
              Clear filters
            </button>
          )}
        </div>
      </Panel>

      {notice && (
        <p
          role="status"
          className="rounded-md border border-line/70 bg-primary/[0.04] px-4 py-2.5 text-[12.5px] leading-relaxed text-muted"
        >
          {notice}
        </p>
      )}

      <Panel
        title="Keys"
        subtitle={`${formatCount(visible.length)} of ${formatCount(all.length)} shown · masked · sample data`}
        headingId="settings-api-keys-list-heading"
        bodyClassName="p-0"
      >
        {visible.length === 0 ? (
          <EmptyState
            title={all.length === 0 ? "No API keys yet" : "No keys match"}
            description={
              all.length === 0
                ? "API keys let scripts and pipelines call the Runbolt API without your session. Keys can be issued once the API key endpoints ship."
                : "Try a different search term or status filter."
            }
            action={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={secondaryActionCls}
                >
                  Clear filters
                </button>
              ) : (
                <button type="button" onClick={openCreate} className={primaryActionCls}>
                  Create API key
                </button>
              )
            }
          />
        ) : (
          <ScrollArea fadeFrom="surface" label="API keys">
            <table className="w-full min-w-[880px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line/70">
                  <th scope="col" className={`px-5 py-2.5 ${thCls}`}>
                    Name
                  </th>
                  <th scope="col" className={thCls}>
                    Key
                  </th>
                  <th scope="col" className={thCls}>
                    Created
                  </th>
                  <th scope="col" className={thCls}>
                    Last used
                  </th>
                  <th scope="col" className={thCls}>
                    Expires
                  </th>
                  <th scope="col" className={thCls}>
                    Status
                  </th>
                  <th scope="col" className={`px-5 py-2.5 text-right ${thCls}`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line/50 transition-colors last:border-0 hover:bg-primary/[0.03]"
                  >
                    <td className="px-5 py-3">
                      <p className="text-[13px] font-medium text-fg">{row.name}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-muted">
                      {row.keyHint}
                    </td>
                    <td
                      className="px-4 py-3 text-[12.5px] text-muted"
                      title={row.createdAbsolute}
                    >
                      {row.createdLabel}
                    </td>
                    <td
                      className="px-4 py-3 text-[12.5px] text-muted"
                      title={row.lastUsedAbsolute ?? undefined}
                    >
                      {row.lastUsedLabel ?? <span className="text-faint">Never</span>}
                    </td>
                    <td
                      className="px-4 py-3 text-[12.5px] text-muted"
                      title={row.expiresAbsolute ?? undefined}
                    >
                      {row.expiresLabel === null ? (
                        <span className="text-faint">Never</span>
                      ) : row.status === "expired" ? (
                        `Expired ${row.expiresLabel}`
                      ) : (
                        row.expiresLabel
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ApiKeyStatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      {row.status === "revoked" ? (
                        <span className="text-[12.5px] text-faint">—</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRevokeTarget(row)}
                          className="text-[12.5px] text-bad transition-colors hover:text-bad/80"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        )}
      </Panel>

      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-api-key-title"
          aria-describedby="create-api-key-description"
        >
          <div
            className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
            onClick={closeCreate}
            aria-hidden
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface shadow-2xl shadow-overlay/40">
            <div className="px-5 py-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
                Create API key
              </p>
              <h2
                id="create-api-key-title"
                className="mt-2 font-display text-lg font-semibold tracking-[-0.01em] text-fg"
              >
                New API key
              </h2>
              <p
                id="create-api-key-description"
                className="mt-2.5 text-[13px] leading-relaxed text-muted"
              >
                <strong className="font-medium text-fg">
                  Key issuance requires the Runbolt API.
                </strong>{" "}
                POST /v1/api-keys isn’t connected yet, so nothing here will
                mint a key. When it lands, the full value will be shown exactly
                once — copy it before closing, because it can never be
                revealed again.
              </p>
              <form onSubmit={handleCreate} className="mt-4 space-y-3">
                <div>
                  <label
                    htmlFor="api-key-create-name"
                    className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint"
                  >
                    Key name
                  </label>
                  <input
                    id="api-key-create-name"
                    value={keyName}
                    onChange={(event) => setKeyName(event.target.value)}
                    placeholder="e.g. Deploy pipeline"
                    className={`${inputCls} mt-1.5`}
                  />
                  {nameError && (
                    <p role="alert" className="mt-1.5 text-[12px] text-bad">
                      {nameError}
                    </p>
                  )}
                </div>
                {createNotice && (
                  <p
                    role="status"
                    className="rounded-md border border-line/70 bg-primary/[0.04] px-3 py-2 text-[12.5px] leading-relaxed text-muted"
                  >
                    {createNotice}
                  </p>
                )}
                <div className="flex justify-end gap-2.5 pt-0.5">
                  <button
                    ref={cancelCreateRef}
                    type="button"
                    onClick={closeCreate}
                    className={secondaryActionCls}
                  >
                    Close
                  </button>
                  <button type="submit" className={primaryActionCls}>
                    Create key
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {revokeTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="revoke-api-key-title"
          aria-describedby="revoke-api-key-description"
        >
          <div
            className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
            onClick={closeRevoke}
            aria-hidden
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface shadow-2xl shadow-overlay/40">
            <div className="px-5 py-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
                Revoke API key
              </p>
              <h2
                id="revoke-api-key-title"
                className="mt-2 font-display text-lg font-semibold tracking-[-0.01em] text-fg"
              >
                {revokeTarget.name}
              </h2>
              <p className="mt-1 font-mono text-[11px] text-faint">
                {revokeTarget.keyHint}
              </p>
              <p
                id="revoke-api-key-description"
                className="mt-2.5 text-[13px] leading-relaxed text-muted"
              >
                This is a sample key row. Confirming marks it revoked in this
                browser only — DELETE /v1/api-keys/:id doesn’t exist yet, so no
                server-side key can be invalidated. The change can’t be undone
                here.
              </p>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-line/70 px-5 py-3.5">
              <button
                ref={cancelRevokeRef}
                type="button"
                onClick={closeRevoke}
                className={secondaryActionCls}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevoke}
                className={revokeConfirmCls}
              >
                Revoke key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
