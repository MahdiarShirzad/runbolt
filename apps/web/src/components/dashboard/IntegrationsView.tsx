"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  ChevronDownIcon,
  SearchIcon,
} from "@/components/landing/icons";
import { ChevronRightIcon } from "./icons";
import {
  INTEGRATIONS,
  INTEGRATION_AUTH_LABELS,
  INTEGRATION_CATEGORY_LABELS,
  disconnectIntegration,
  findConnection,
  getStoredConnections,
  subscribeIntegrations,
} from "@/lib/dashboard/integrations";
import type {
  Integration,
  IntegrationCategory,
  IntegrationConnection,
} from "@/lib/dashboard/integrations";
import { currentTimestamp, formatRelativeTime } from "@/lib/dashboard/format";
import { EmptyState } from "./EmptyState";
import { IntegrationIcon } from "./IntegrationIcon";
import { Panel } from "./Panel";
import { secondaryActionCls } from "./actions";

type TabId = "catalog" | "connected";
type StatusFilter = "all" | "connected" | "available";
type SortKey = "name" | "category";

/** Connection rows carry pre-formatted time labels — no clock reads in render. */
interface ConnectionRow {
  connection: IntegrationConnection;
  connectedLabel: string;
}

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "connected", label: "Connected" },
  { value: "available", label: "Not connected" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name", label: "Name A–Z" },
  { value: "category", label: "Category" },
];

const selectCls =
  "h-9 appearance-none rounded-md border border-line bg-ink pl-3 pr-8 text-[12.5px] text-fg outline-none transition-colors focus:border-primary";

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

function IntegrationCard({
  integration,
  connection,
}: {
  integration: Integration;
  connection: IntegrationConnection | null;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-line bg-surface/60 p-4 transition-colors hover:border-line-strong">
      <div className="flex items-start gap-3">
        <IntegrationIcon slug={integration.slug} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-[14px] font-semibold tracking-tight text-fg">
              {integration.name}
            </p>
            <StatusPill connected={Boolean(connection)} />
          </div>
          <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-faint">
            {INTEGRATION_CATEGORY_LABELS[integration.category]}
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 flex-1 text-[12.5px] leading-relaxed text-muted">
        {integration.description}
      </p>
      <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-line/50 pt-3">
        <p className="font-mono text-[10.5px] text-faint">
          {INTEGRATION_AUTH_LABELS[integration.auth]}
        </p>
        <Link
          href={`/integrations/${integration.slug}`}
          className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          {connection ? "Manage" : "View details"}
          <ChevronRightIcon width={12} height={12} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

export function IntegrationsView({
  initialTab,
}: {
  initialTab: TabId;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<TabId>(initialTab);
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [connectionRows, setConnectionRows] = useState<ConnectionRow[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IntegrationCategory | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [connectedQuery, setConnectedQuery] = useState("");
  const [pendingDisconnect, setPendingDisconnect] = useState<IntegrationConnection | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeSeq = useRef(0);

  // Browser-local connections hydrate after mount; subscribe for updates.
  useEffect(() => {
    function refresh() {
      const stored = getStoredConnections();
      const now = currentTimestamp();
      setConnections(stored);
      setConnectionRows(
        stored.map((connection) => ({
          connection,
          connectedLabel: formatRelativeTime(connection.connectedAt, now),
        })),
      );
    }
    refresh();
    return subscribeIntegrations(refresh);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const search = tab === "connected" ? "?tab=connected" : "";
    window.history.replaceState(null, "", search ? `${pathname}${search}` : pathname);
  }, [tab, pathname]);

  const notify = useCallback((text: string) => {
    noticeSeq.current += 1;
    setNotice(text);
  }, []);

  const selectTab = (next: TabId) => {
    setTab(next);
    setQuery("");
    setCategory("all");
    setStatus("all");
    setConnectedQuery("");
  };

  const categoriesPresent = useMemo(() => {
    const present = new Set(INTEGRATIONS.map((i) => i.category));
    return (Object.keys(INTEGRATION_CATEGORY_LABELS) as IntegrationCategory[]).filter(
      (key) => present.has(key),
    );
  }, []);

  const catalog = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = INTEGRATIONS.filter((integration) => {
      const connected = findConnection(connections, integration.slug) != null;
      return (
        (category === "all" || integration.category === category) &&
        (status === "all" ||
          (status === "connected" && connected) ||
          (status === "available" && !connected)) &&
        (needle === "" ||
          integration.name.toLowerCase().includes(needle) ||
          integration.description.toLowerCase().includes(needle))
      );
    });
    return [...result].sort((a, b) =>
      sort === "category"
        ? a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
        : a.name.localeCompare(b.name),
    );
  }, [connections, query, category, status, sort]);

  const connectedRows = useMemo(() => {
    const needle = connectedQuery.trim().toLowerCase();
    return connectionRows
      .map((row) => ({
        ...row,
        integration: INTEGRATIONS.find((i) => i.slug === row.connection.slug) ?? null,
      }))
      .filter(
        ({ connection, integration }) =>
          needle === "" ||
          (integration?.name.toLowerCase().includes(needle) ?? false) ||
          connection.label.toLowerCase().includes(needle) ||
          connection.slug.includes(needle),
      );
  }, [connectionRows, connectedQuery]);

  const hasActiveFilters =
    query.trim() !== "" || category !== "all" || status !== "all" || sort !== "name";

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setStatus("all");
    setSort("name");
  };

  const confirmDisconnect = () => {
    if (!pendingDisconnect) return;
    const integration = INTEGRATIONS.find((i) => i.slug === pendingDisconnect.slug);
    disconnectIntegration(pendingDisconnect.slug);
    setPendingDisconnect(null);
    notify(`“${integration?.name ?? pendingDisconnect.slug}” disconnected.`);
  };

  const closeDisconnect = useCallback(() => setPendingDisconnect(null), []);

  useEffect(() => {
    if (!pendingDisconnect) return;
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
  }, [pendingDisconnect, closeDisconnect]);

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
              Connect your stack
            </p>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-warn"
              title="The Runbolt API is not connected yet — the catalog is a sample set and connections are stored in this browser."
            >
              <span className="h-1.5 w-1.5 rounded-full bg-warn" aria-hidden />
              Sample catalog
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            Integrations
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Connect the tools your workflows call — then reference them as
            triggers and actions from any workflow.
          </p>
        </div>
      </div>

      <div role="tablist" aria-label="Integrations sections" className="flex gap-1 border-b border-line/70">
        {(
          [
            { id: "catalog" as TabId, label: "Catalog" },
            { id: "connected" as TabId, label: `Connected (${connections.length})` },
          ]
        ).map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`integrations-tab-${item.id}`}
              aria-selected={active}
              aria-controls={`integrations-panel-${item.id}`}
              onClick={() => selectTab(item.id)}
              className={`-mb-px border-b-2 px-3.5 py-2.5 text-[13px] transition-colors ${
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

      {tab === "catalog" ? (
        <div
          role="tabpanel"
          id="integrations-panel-catalog"
          aria-labelledby="integrations-tab-catalog"
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <label htmlFor="integrations-search" className="sr-only">
                Search integrations
              </label>
              <SearchIcon
                width={14}
                height={14}
                aria-hidden
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
              />
              <input
                id="integrations-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search integrations"
                className="h-9 w-full rounded-md border border-line bg-ink pl-8 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary"
              />
            </div>

            <div
              role="group"
              aria-label="Filter by connection status"
              className="flex rounded-md border border-line bg-ink p-0.5"
            >
              {STATUS_FILTERS.map((option) => {
                const active = status === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStatus(option.value)}
                    className={`h-8 rounded-[4px] px-2.5 text-[12px] transition-colors duration-150 ${
                      active ? "bg-hover font-medium text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <label htmlFor="integrations-sort" className="sr-only">
                Sort integrations
              </label>
              <select
                id="integrations-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className={selectCls}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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

          <div
            role="group"
            aria-label="Filter by category"
            className="flex flex-wrap gap-1.5"
          >
            {[{ value: "all" as const, label: "All categories" }, ...categoriesPresent.map((key) => ({
              value: key,
              label: INTEGRATION_CATEGORY_LABELS[key],
            }))].map((option) => {
              const active = category === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(option.value)}
                  className={`h-7 rounded-full border px-2.5 text-[11.5px] transition-colors ${
                    active
                      ? "border-primary bg-primary/[0.08] font-medium text-fg"
                      : "border-line bg-ink text-muted hover:text-fg"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {catalog.length === 0 ? (
            <EmptyState
              title="No integrations match"
              description="Try a different search term, category, or connection filter."
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {catalog.map((integration) => (
                <IntegrationCard
                  key={integration.slug}
                  integration={integration}
                  connection={findConnection(connections, integration.slug)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          role="tabpanel"
          id="integrations-panel-connected"
          aria-labelledby="integrations-tab-connected"
        >
          <Panel
            title="Connected integrations"
            subtitle={`${connections.length} connection${connections.length === 1 ? "" : "s"} · stored in this browser`}
            headingId="connected-integrations-heading"
            bodyClassName="p-0"
          >
            <div className="border-b border-line/70 px-5 py-3">
              <div className="relative w-full sm:w-64">
                <label htmlFor="connected-search" className="sr-only">
                  Search connections
                </label>
                <SearchIcon
                  width={14}
                  height={14}
                  aria-hidden
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
                />
                <input
                  id="connected-search"
                  type="search"
                  value={connectedQuery}
                  onChange={(event) => setConnectedQuery(event.target.value)}
                  placeholder="Search connections"
                  className="h-9 w-full rounded-md border border-line bg-ink pl-8 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary"
                />
              </div>
            </div>

            {connections.length === 0 ? (
              <EmptyState
                title="No connections yet"
                description="Connect an integration from the catalog to see it here."
                action={
                  <button
                    type="button"
                    onClick={() => selectTab("catalog")}
                    className={secondaryActionCls}
                  >
                    Browse catalog
                  </button>
                }
              />
            ) : connectedRows.length === 0 ? (
              <EmptyState
                title="No matching connections"
                description="Try a different search term."
                action={
                  <button
                    type="button"
                    onClick={() => setConnectedQuery("")}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
                  >
                    Clear search
                  </button>
                }
              />
            ) : (
              <ScrollArea fadeFrom="surface" label="Connected integrations">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line/70">
                      <th scope="col" className="px-5 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                        Integration
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                        Account
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                        Connected
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                        Last check
                      </th>
                      <th scope="col" className="px-5 py-2.5 text-right font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {connectedRows.map(({ connection, integration, connectedLabel }) => (
                      <tr
                        key={connection.slug}
                        className="border-b border-line/40 transition-colors last:border-b-0 hover:bg-hover/40"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <IntegrationIcon slug={connection.slug} size={16} />
                            <div className="min-w-0">
                              <p className="truncate text-[13.5px] font-medium text-fg">
                                {integration?.name ?? connection.slug}
                              </p>
                              <p className="mt-0.5 font-mono text-[11px] text-faint">
                                {connection.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-muted">
                          {connection.label}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-muted">
                          {connectedLabel}
                        </td>
                        <td
                          className="px-4 py-3 text-[12.5px] text-faint"
                          title="Connection checks require the Runbolt API."
                        >
                          Not available
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/integrations/${connection.slug}`}
                              className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
                            >
                              Manage
                              <ChevronRightIcon width={12} height={12} aria-hidden />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setPendingDisconnect(connection)}
                              className="rounded-md border border-line px-2 py-1 text-[11.5px] text-bad transition-colors hover:border-bad/50 hover:bg-bad/10"
                            >
                              Disconnect…
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </Panel>
        </div>
      )}

      {pendingDisconnect && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disconnect-integration-title"
          aria-describedby="disconnect-integration-description"
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
                id="disconnect-integration-title"
                className="mt-2 font-display text-lg font-semibold tracking-[-0.01em] text-fg"
              >
                {INTEGRATIONS.find((i) => i.slug === pendingDisconnect.slug)?.name ??
                  pendingDisconnect.slug}
              </h2>
              <p className="mt-1 text-[12.5px] text-muted">
                Account: {pendingDisconnect.label}
              </p>
              <p
                id="disconnect-integration-description"
                className="mt-2.5 text-[13px] leading-relaxed text-muted"
              >
                Workflows using this connection will fail to authenticate until
                it is connected again. This removes the browser-local connection
                record.
              </p>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-line/70 px-5 py-3.5">
              <button
                type="button"
                onClick={closeDisconnect}
                className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDisconnect}
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
