"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { CheckIcon, CopyIcon, SearchIcon } from "@/components/landing/icons";
import { formatCount } from "@/lib/dashboard/format";
import type {
  WebhookDeliveryStatus,
  WebhookEndpointStatus,
} from "@/lib/dashboard/webhooks";
import { ChevronRightIcon } from "./icons";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";
import { secondaryActionCls } from "./actions";

export interface WebhookEndpointRow {
  id: string;
  name: string;
  description: string;
  workflowId: string;
  workflowSlug: string;
  workflowName: string;
  status: WebhookEndpointStatus;
  urlMasked: string;
  urlFull: string;
  authLabel: string;
  createdLabel: string;
  createdAbsolute: string;
  lastEventLabel: string | null;
  lastEventAbsolute: string | null;
  processedCount: number;
  failedCount: number;
  totalCount: number;
  lastDeliveryStatus: WebhookDeliveryStatus | null;
}

export interface WebhooksListState {
  status: WebhookEndpointStatus | "all";
  workflowId: string;
  q: string;
  sort: "created" | "activity" | "name";
}

export interface WebhookWorkflowOption {
  id: string;
  name: string;
}

const STATUS_FILTERS: { value: WebhookEndpointStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
];

const SORT_OPTIONS: { value: WebhooksListState["sort"]; label: string }[] = [
  { value: "created", label: "Newest first" },
  { value: "activity", label: "Last activity" },
  { value: "name", label: "Name A–Z" },
];

const selectCls =
  "h-9 appearance-none rounded-md border border-line bg-ink pl-3 pr-8 text-[12.5px] text-fg outline-none transition-colors focus:border-primary";

const DELIVERY_STATUS_STYLES: Record<
  WebhookDeliveryStatus,
  { dot: string; text: string; label: string }
> = {
  processed: { dot: "bg-ok", text: "text-ok", label: "Processed" },
  failed: { dot: "bg-bad", text: "text-bad", label: "Failed" },
  rejected: { dot: "bg-warn", text: "text-warn", label: "Rejected" },
  dropped: { dot: "bg-faint", text: "text-muted", label: "Dropped" },
};

export function DeliveryStatusBadge({
  status,
}: {
  status: WebhookDeliveryStatus;
}) {
  const style = DELIVERY_STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12.5px] ${style.text}`}>
      <span className={`h-[7px] w-[7px] rounded-full ${style.dot}`} aria-hidden />
      {style.label}
    </span>
  );
}

function EndpointStatusBadge({ status }: { status: WebhookEndpointStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
        status === "active"
          ? "border-ok/30 bg-ok/10 text-ok"
          : "border-line bg-ink text-faint"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-ok" : "bg-faint"}`}
        aria-hidden
      />
      {status}
    </span>
  );
}

function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy endpoint URL"}
      onClick={() => {
        void navigator.clipboard
          .writeText(url)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          })
          .catch(() => {
            // Clipboard unavailable — URL stays visible in the details page.
          });
      }}
      className="inline-flex h-7 w-7 items-center justify-center rounded border border-line text-muted transition-colors hover:border-line-strong hover:text-fg"
      title="Copy placeholder URL (not live until the events API ships)"
    >
      {copied ? (
        <CheckIcon width={12} height={12} className="text-ok" />
      ) : (
        <CopyIcon width={12} height={12} />
      )}
    </button>
  );
}

function MetricCard({
  label,
  value,
  context,
  valueCls = "text-fg",
}: {
  label: string;
  value: string;
  context: string;
  valueCls?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface/60 px-4 py-3.5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      <p
        className={`mt-2 font-display text-[26px] font-semibold leading-none tracking-[-0.01em] tabular-nums ${valueCls}`}
      >
        {value}
      </p>
      <p className="mt-2 text-[12px] leading-snug text-muted">{context}</p>
    </div>
  );
}

export function WebhooksBrowser({
  rows,
  workflowOptions,
  initial,
}: {
  rows: WebhookEndpointRow[];
  workflowOptions: WebhookWorkflowOption[];
  initial: WebhooksListState;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<WebhooksListState>(initial);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const cancelCreateRef = useRef<HTMLButtonElement>(null);

  // Keep filters in the URL (shallow) so refresh/deep links work.
  useEffect(() => {
    const params = new URLSearchParams();
    if (state.status !== "all") params.set("status", state.status);
    if (state.workflowId !== "all") params.set("workflow", state.workflowId);
    if (state.q.trim() !== "") params.set("q", state.q.trim());
    if (state.sort !== "created") params.set("sort", state.sort);
    const search = params.toString();
    window.history.replaceState(
      null,
      "",
      search ? `${pathname}?${search}` : pathname,
    );
  }, [state, pathname]);

  useEffect(() => {
    if (!createDialogOpen) return;
    cancelCreateRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCreateDialogOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [createDialogOpen]);

  const patch = (partial: Partial<WebhooksListState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  const hasActiveFilters =
    state.status !== "all" || state.workflowId !== "all" || state.q.trim() !== "";

  const clearFilters = () => {
    setState({ status: "all", workflowId: "all", q: "", sort: "created" });
    searchRef.current?.focus();
  };

  const stats = useMemo(() => {
    let active = 0;
    let processed = 0;
    let failed = 0;
    for (const row of rows) {
      if (row.status === "active") active += 1;
      processed += row.processedCount;
      failed += row.failedCount;
    }
    return { total: rows.length, active, processed, failed };
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = state.q.trim().toLowerCase();
    const result = rows.filter(
      (row) =>
        (state.status === "all" || row.status === state.status) &&
        (state.workflowId === "all" || row.workflowId === state.workflowId) &&
        (needle === "" ||
          row.name.toLowerCase().includes(needle) ||
          row.description.toLowerCase().includes(needle) ||
          row.workflowName.toLowerCase().includes(needle)),
    );
    return [...result].sort((a, b) => {
      if (state.sort === "name") return a.name.localeCompare(b.name);
      if (state.sort === "activity") {
        const aTime = a.lastEventAbsolute ?? "";
        const bTime = b.lastEventAbsolute ?? "";
        return bTime.localeCompare(aTime);
      }
      return b.createdAbsolute.localeCompare(a.createdAbsolute);
    });
  }, [rows, state]);

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            Inbound events
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            Webhooks
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Endpoints external systems POST to in order to start workflows —
            each one routes signed events into a single workflow.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateDialogOpen(true)}
          className={`${secondaryActionCls} shrink-0`}
          title="Endpoint creation requires the Runbolt events API."
        >
          Create webhook — unavailable
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total endpoints"
          value={formatCount(stats.total)}
          context="in this workspace"
        />
        <MetricCard
          label="Active endpoints"
          value={formatCount(stats.active)}
          context={`${stats.total - stats.active} disabled`}
        />
        <MetricCard
          label="Processed deliveries"
          value={formatCount(stats.processed)}
          context="requests that ran a workflow"
          valueCls="text-ok"
        />
        <MetricCard
          label="Failed deliveries"
          value={formatCount(stats.failed)}
          context="workflow finished with an error"
          valueCls="text-bad"
        />
      </div>

      <Panel
        title="Endpoints"
        subtitle={`${formatCount(rows.length)} configured`}
        headingId="webhooks-list-heading"
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line/70 px-5 py-3">
          <div className="relative w-full sm:w-60">
            <label htmlFor="webhooks-search" className="sr-only">
              Search endpoints
            </label>
            <SearchIcon
              width={14}
              height={14}
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              ref={searchRef}
              id="webhooks-search"
              type="search"
              value={state.q}
              onChange={(event) => patch({ q: event.target.value })}
              placeholder="Search name or workflow"
              className="h-9 w-full rounded-md border border-line bg-ink pl-8 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary"
            />
          </div>

          <div
            role="group"
            aria-label="Filter by endpoint status"
            className="flex rounded-md border border-line bg-ink p-0.5"
          >
            {STATUS_FILTERS.map((option) => {
              const active = state.status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => patch({ status: option.value })}
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
            <label htmlFor="webhooks-workflow" className="sr-only">
              Filter by workflow
            </label>
            <select
              id="webhooks-workflow"
              value={state.workflowId}
              onChange={(event) => patch({ workflowId: event.target.value })}
              className={selectCls}
            >
              <option value="all">All workflows</option>
              {workflowOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label htmlFor="webhooks-sort" className="sr-only">
              Sort endpoints
            </label>
            <select
              id="webhooks-sort"
              value={state.sort}
              onChange={(event) =>
                patch({ sort: event.target.value as WebhooksListState["sort"] })
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

        {filtered.length === 0 ? (
          <EmptyState
            title={rows.length === 0 ? "No webhook endpoints yet" : "No endpoints match"}
            description={
              rows.length === 0
                ? "Webhook endpoints let external systems start workflows by POSTing signed events. Create one once the events API is connected."
                : "Try a different search term, status, or workflow filter."
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
                <Link
                  href="/workflows"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
                >
                  View webhook-trigger workflows
                </Link>
              )
            }
          />
        ) : (
          <ScrollArea fadeFrom="surface" label="Webhook endpoints">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line/70">
                  <th scope="col" className="px-5 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Endpoint
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    URL
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Workflow
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Last delivery
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Last event
                  </th>
                  <th scope="col" className="px-5 py-2.5 text-right font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line/40 transition-colors last:border-b-0 hover:bg-hover/40"
                  >
                    <td className="px-5 py-3">
                      <p className="truncate text-[13.5px] font-medium text-fg">
                        {row.name}
                      </p>
                      <p className="mt-0.5 max-w-[220px] truncate text-[12px] text-faint">
                        {row.description}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="truncate font-mono text-[11.5px] text-muted">
                          {row.urlMasked}
                        </code>
                        <CopyUrlButton url={row.urlFull} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/workflows/${row.workflowSlug}`}
                        className="text-[13px] text-muted underline-offset-2 hover:text-fg hover:underline"
                      >
                        {row.workflowName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <EndpointStatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      {row.lastDeliveryStatus ? (
                        <DeliveryStatusBadge status={row.lastDeliveryStatus} />
                      ) : (
                        <span className="text-[12.5px] text-faint">—</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-[12.5px] text-muted"
                      title={row.lastEventAbsolute ?? undefined}
                    >
                      {row.lastEventLabel ?? "Never"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/webhooks/${row.id}`}
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

      {createDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-webhook-title"
          aria-describedby="create-webhook-description"
        >
          <div
            className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
            onClick={() => setCreateDialogOpen(false)}
            aria-hidden
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface shadow-2xl shadow-overlay/40">
            <div className="px-5 py-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
                Create webhook
              </p>
              <h2
                id="create-webhook-title"
                className="mt-2 font-display text-lg font-semibold tracking-[-0.01em] text-fg"
              >
                Endpoint creation requires the events API
              </h2>
              <p
                id="create-webhook-description"
                className="mt-2.5 text-[13px] leading-relaxed text-muted"
              >
                Creating an endpoint issues a real URL and signing secret
                server-side — Runbolt will not simulate that flow. Once the
                events API ships, this dialog will collect an endpoint name,
                the workflow to trigger, and the signing method.
              </p>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-faint">
                Until then, workflows with a webhook trigger can be reviewed on
                the workflows page.
              </p>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-line/70 px-5 py-3.5">
              <button
                ref={cancelCreateRef}
                type="button"
                onClick={() => setCreateDialogOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
              >
                Close
              </button>
              <Link
                href="/workflows"
                onClick={() => setCreateDialogOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
              >
                View workflows
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
