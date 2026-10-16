"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { SearchIcon } from "@/components/landing/icons";
import {
  currentTimestamp,
  formatCount,
  formatRelativeTime,
} from "@/lib/dashboard/format";
import {
  CREDENTIAL_TYPE_LABELS,
  loadLocalCredentials,
  mergeCredentialLists,
  subscribeCredentials,
} from "@/lib/dashboard/credentials";
import type {
  CredentialMetadata,
  CredentialType,
  LocalCredentialRecord,
} from "@/lib/dashboard/credentials";
import { INTEGRATIONS } from "@/lib/dashboard/integrations";
import { ChevronRightIcon } from "./icons";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";
import { primaryActionCls, secondaryActionCls } from "./actions";

export interface CredentialsListState {
  type: CredentialType | "all";
  integration: string;
  q: string;
  sort: "updated" | "name";
}

const TYPE_OPTIONS: { value: CredentialType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "api_key", label: "API key" },
  { value: "bearer_token", label: "Bearer token" },
  { value: "basic_auth", label: "Basic auth" },
  { value: "database", label: "Database" },
  { value: "custom_header", label: "Custom header" },
  { value: "oauth", label: "OAuth connection" },
];

const SORT_OPTIONS: { value: CredentialsListState["sort"]; label: string }[] = [
  { value: "updated", label: "Recently updated" },
  { value: "name", label: "Name A–Z" },
];

const selectCls =
  "h-9 appearance-none rounded-md border border-line bg-ink pl-3 pr-8 text-[12.5px] text-fg outline-none transition-colors focus:border-primary";

export function CredentialsView({
  samples,
  initial,
}: {
  samples: CredentialMetadata[];
  initial: CredentialsListState;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<CredentialsListState>(initial);
  const [locals, setLocals] = useState<LocalCredentialRecord[]>([]);

  useEffect(() => {
    function refresh() {
      setLocals(loadLocalCredentials());
    }
    refresh();
    return subscribeCredentials(refresh);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (state.type !== "all") params.set("type", state.type);
    if (state.integration !== "") params.set("integration", state.integration);
    if (state.q.trim() !== "") params.set("q", state.q.trim());
    if (state.sort !== "updated") params.set("sort", state.sort);
    const search = params.toString();
    window.history.replaceState(
      null,
      "",
      search ? `${pathname}?${search}` : pathname,
    );
  }, [state, pathname]);

  const all = useMemo(
    () => mergeCredentialLists(samples, locals),
    [samples, locals],
  );

  const integrationsPresent = useMemo(() => {
    const slugs = new Set(
      all.map((credential) => credential.integrationSlug).filter(Boolean),
    );
    return INTEGRATIONS.filter((integration) => slugs.has(integration.slug));
  }, [all]);

  const filtered = useMemo(() => {
    const needle = state.q.trim().toLowerCase();
    return all
      .filter(
        (credential) =>
          (state.type === "all" || credential.type === state.type) &&
          (state.integration === "" ||
            credential.integrationSlug === state.integration) &&
          (needle === "" ||
            credential.name.toLowerCase().includes(needle) ||
            credential.description.toLowerCase().includes(needle)),
      )
      .sort((a, b) =>
        state.sort === "name"
          ? a.name.localeCompare(b.name)
          : b.updatedAt.localeCompare(a.updatedAt),
      );
  }, [all, state]);

  const hasActiveFilters =
    state.type !== "all" || state.integration !== "" || state.q.trim() !== "";

  const clearFilters = () =>
    setState({ type: "all", integration: "", q: "", sort: "updated" });

  const now = currentTimestamp();

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
              Secrets store
            </p>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-warn"
              title="The encrypted credential API is not connected yet — records are metadata only; secrets are never stored in this browser."
            >
              <span className="h-1.5 w-1.5 rounded-full bg-warn" aria-hidden />
              Metadata only
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            Credentials
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Named credentials workflows reference instead of inlining secrets —
            encrypted storage requires the Runbolt API.
          </p>
        </div>
        <Link href="/credentials/new" className={`${primaryActionCls} shrink-0`}>
          Add credential
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative w-full sm:w-64">
          <label htmlFor="credentials-search" className="sr-only">
            Search credentials
          </label>
          <SearchIcon
            width={14}
            height={14}
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            id="credentials-search"
            type="search"
            value={state.q}
            onChange={(event) =>
              setState((prev) => ({ ...prev, q: event.target.value }))
            }
            placeholder="Search credentials"
            className="h-9 w-full rounded-md border border-line bg-ink pl-8 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary"
          />
        </div>

        <div className="relative">
          <label htmlFor="credentials-type" className="sr-only">
            Filter by type
          </label>
          <select
            id="credentials-type"
            value={state.type}
            onChange={(event) =>
              setState((prev) => ({
                ...prev,
                type: event.target.value as CredentialType | "all",
              }))
            }
            className={selectCls}
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label htmlFor="credentials-integration" className="sr-only">
            Filter by integration
          </label>
          <select
            id="credentials-integration"
            value={state.integration}
            onChange={(event) =>
              setState((prev) => ({ ...prev, integration: event.target.value }))
            }
            className={selectCls}
          >
            <option value="">All integrations</option>
            {integrationsPresent.map((integration) => (
              <option key={integration.slug} value={integration.slug}>
                {integration.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label htmlFor="credentials-sort" className="sr-only">
            Sort credentials
          </label>
          <select
            id="credentials-sort"
            value={state.sort}
            onChange={(event) =>
              setState((prev) => ({
                ...prev,
                sort: event.target.value as CredentialsListState["sort"],
              }))
            }
            className={selectCls}
          >
            {SORT_OPTIONS.map((option) => (
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

        <button
          type="button"
          onClick={() => router.refresh()}
          className={`${secondaryActionCls} ml-auto`}
        >
          Refresh
        </button>
      </div>

      <Panel
        title="Stored credentials"
        subtitle={`${formatCount(filtered.length)} of ${formatCount(all.length)} shown · secrets are never listed`}
        headingId="credentials-list-heading"
        bodyClassName="p-0"
      >
        {filtered.length === 0 ? (
          <EmptyState
            title={all.length === 0 ? "No credentials yet" : "No credentials match"}
            description={
              all.length === 0
                ? "Credentials let workflows call external services without embedding secrets in workflow logic. Add one to reference from future steps."
                : "Try a different search term, type, or integration filter."
            }
            action={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
                >
                  Clear filters
                </button>
              ) : (
                <Link href="/credentials/new" className={primaryActionCls}>
                  Add credential
                </Link>
              )
            }
          />
        ) : (
          <ScrollArea fadeFrom="surface" label="Credentials">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line/70">
                  <th scope="col" className="px-5 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Integration
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Updated
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-2.5 text-right font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((credential) => (
                  <tr
                    key={credential.id}
                    className="border-b border-line/40 transition-colors last:border-b-0 hover:bg-hover/40"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13.5px] font-medium text-fg">
                          {credential.name}
                        </p>
                        {credential.origin === "local" && (
                          <span
                            className="shrink-0 rounded border border-line bg-ink px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint"
                            title="Created in this browser — metadata only."
                          >
                            Local
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 max-w-[260px] truncate text-[12px] text-faint">
                        {credential.description}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded border border-line bg-ink px-1.5 py-0.5 font-mono text-[10.5px] text-muted">
                        {CREDENTIAL_TYPE_LABELS[credential.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted">
                      {credential.integrationName ?? (
                        <span className="text-faint">Not linked</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-[12.5px] text-muted"
                      title={credential.updatedAt}
                    >
                      {formatRelativeTime(credential.updatedAt, now)}
                    </td>
                    <td
                      className="px-4 py-3 text-[12.5px] text-faint"
                      title="Connection testing requires the Runbolt API."
                    >
                      Not checked
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/credentials/${credential.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
                      >
                        Details
                        <ChevronRightIcon width={12} height={12} aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        )}
      </Panel>
    </div>
  );
}
