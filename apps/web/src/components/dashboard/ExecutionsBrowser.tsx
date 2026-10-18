"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  ChevronDownIcon,
  RetryIcon,
  SearchIcon,
} from "@/components/landing/icons";
import { ChevronRightIcon } from "./icons";
import { formatCount, formatDuration, formatPercent } from "@/lib/dashboard/format";
import type { ExecutionStatus, TriggerType } from "@/lib/dashboard/types";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";
import { StatusBadge, TriggerBadge } from "./StatusBadge";
import { secondaryActionCls } from "./actions";
import {
  EXECUTION_RANGE_MS,
  EXECUTIONS_LIST_QUERY_KEY,
} from "./executions-view";
import type {
  ExecutionListState,
  ExecutionRow,
  ExecutionTriggerOption,
  ExecutionWorkflowOption,
} from "./executions-view";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: ExecutionStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "running", label: "Running" },
  { value: "queued", label: "Queued" },
  { value: "cancelled", label: "Cancelled" },
];

const RANGE_OPTIONS: { value: "24h" | "7d" | "30d"; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

const selectCls =
  "h-9 appearance-none rounded-md border border-line bg-ink pl-3 pr-8 text-[12.5px] text-fg outline-none transition-colors focus:border-primary";

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
      <p className={`mt-2 font-display text-[26px] font-semibold leading-none tracking-[-0.01em] tabular-nums ${valueCls}`}>
        {value}
      </p>
      <p className="mt-2 text-[12px] leading-snug text-muted">{context}</p>
    </div>
  );
}

function SortHeader({
  label,
  column,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  column: "started" | "duration";
  sort: ExecutionListState["sort"];
  onSort: (column: "started" | "duration") => void;
  align?: "left" | "right";
}) {
  const active = sort === column;
  return (
    <th
      scope="col"
      aria-sort={active ? "descending" : "none"}
      className={`px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint ${
        align === "right" ? "text-right" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 uppercase tracking-[0.12em] transition-colors hover:text-fg ${
          active ? "text-fg" : ""
        }`}
      >
        {label}
        <ChevronDownIcon
          width={11}
          height={11}
          aria-hidden
          className={active ? "rotate-180" : "opacity-0"}
        />
      </button>
    </th>
  );
}

export function ExecutionsBrowser({
  rows,
  workflowOptions,
  triggerOptions,
  initial,
  nowIso,
}: {
  rows: ExecutionRow[];
  workflowOptions: ExecutionWorkflowOption[];
  triggerOptions: ExecutionTriggerOption[];
  initial: ExecutionListState;
  nowIso: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<ExecutionListState>(initial);
  const searchRef = useRef<HTMLInputElement>(null);
  const nowMs = useMemo(() => new Date(nowIso).getTime(), [nowIso]);

  // Keep filters in the URL (shallow) so refresh/deep links work and the
  // session record can restore them when returning from an execution.
  useEffect(() => {
    const params = new URLSearchParams();
    if (state.range !== "7d") params.set("range", state.range);
    if (state.status !== "all") params.set("status", state.status);
    if (state.workflowId !== "all") params.set("workflow", state.workflowId);
    if (state.trigger !== "all") params.set("trigger", state.trigger);
    if (state.q.trim() !== "") params.set("q", state.q.trim());
    if (state.sort !== "started") params.set("sort", state.sort);
    if (state.page > 1) params.set("page", String(state.page));
    const search = params.toString();
    window.history.replaceState(
      null,
      "",
      search ? `${pathname}?${search}` : pathname,
    );
    window.sessionStorage.setItem(
      EXECUTIONS_LIST_QUERY_KEY,
      search ? `?${search}` : "",
    );
  }, [state, pathname]);

  const patch = (partial: Partial<ExecutionListState>, resetPage = true) =>
    setState((prev) => ({
      ...prev,
      ...partial,
      ...(resetPage ? { page: 1 } : {}),
    }));

  const hasActiveFilters =
    state.range !== "7d" ||
    state.status !== "all" ||
    state.workflowId !== "all" ||
    state.trigger !== "all" ||
    state.q.trim() !== "";

  const clearFilters = () => {
    setState({
      range: "7d",
      status: "all",
      workflowId: "all",
      trigger: "all",
      q: "",
      sort: "started",
      page: 1,
    });
    searchRef.current?.focus();
  };

  const inPeriod = useMemo(() => {
    const cutoff = nowMs - EXECUTION_RANGE_MS[state.range];
    return rows.filter((row) => {
      const startedMs = new Date(row.startedAt).getTime();
      return (
        startedMs >= cutoff &&
        (state.workflowId === "all" || row.workflowId === state.workflowId) &&
        (state.trigger === "all" || row.trigger === state.trigger)
      );
    });
  }, [rows, nowMs, state.range, state.workflowId, state.trigger]);

  const stats = useMemo(() => {
    let success = 0;
    let failed = 0;
    let running = 0;
    let durationSum = 0;
    let durationCount = 0;
    for (const row of inPeriod) {
      if (row.status === "success") success += 1;
      else if (row.status === "failed") failed += 1;
      else if (row.status === "running") running += 1;
      if (row.durationMs != null) {
        durationSum += row.durationMs;
        durationCount += 1;
      }
    }
    const finished = success + failed;
    return {
      total: inPeriod.length,
      success,
      failed,
      running,
      successRate: finished === 0 ? null : success / finished,
      avgDurationMs: durationCount === 0 ? null : durationSum / durationCount,
    };
  }, [inPeriod]);

  const filtered = useMemo(() => {
    const needle = state.q.trim().toLowerCase();
    const result = inPeriod.filter(
      (row) =>
        (state.status === "all" || row.status === state.status) &&
        (needle === "" ||
          row.workflowName.toLowerCase().includes(needle) ||
          row.id.toLowerCase().includes(needle)),
    );
    const sorted = [...result].sort((a, b) => {
      if (state.sort === "duration") {
        if (a.durationMs == null && b.durationMs == null) return 0;
        if (a.durationMs == null) return 1;
        if (b.durationMs == null) return -1;
        return b.durationMs - a.durationMs || b.startedAt.localeCompare(a.startedAt);
      }
      return b.startedAt.localeCompare(a.startedAt);
    });
    return sorted;
  }, [inPeriod, state.q, state.status, state.sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(state.page, pageCount);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label="Total executions"
          value={formatCount(stats.total)}
          context={
            state.range === "24h"
              ? "in the last 24 hours"
              : state.range === "7d"
                ? "in the last 7 days"
                : "in the last 30 days"
          }
        />
        <MetricCard
          label="Successful"
          value={formatCount(stats.success)}
          context="finished without errors"
          valueCls="text-ok"
        />
        <MetricCard
          label="Failed"
          value={formatCount(stats.failed)}
          context="finished with an error"
          valueCls="text-bad"
        />
        <MetricCard
          label="Running"
          value={formatCount(stats.running)}
          context="in progress right now"
          valueCls="text-volt"
        />
        <MetricCard
          label="Success rate"
          value={stats.successRate == null ? "—" : formatPercent(stats.successRate)}
          context="of finished runs in view"
          valueCls={
            stats.successRate == null
              ? "text-fg"
              : stats.successRate >= 0.9
                ? "text-ok"
                : stats.successRate >= 0.7
                  ? "text-warn"
                  : "text-bad"
          }
        />
        <MetricCard
          label="Avg duration"
          value={stats.avgDurationMs == null ? "—" : formatDuration(stats.avgDurationMs)}
          context="mean run time in view"
        />
      </div>

      <Panel
        title="Execution history"
        subtitle={`Workspace · ${formatCount(rows.length)} runs sampled`}
        headingId="executions-list-heading"
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line/70 px-5 py-3">
          <div className="relative w-full sm:w-60">
            <label htmlFor="executions-search" className="sr-only">
              Search executions
            </label>
            <SearchIcon
              width={14}
              height={14}
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              ref={searchRef}
              id="executions-search"
              type="search"
              value={state.q}
              onChange={(event) => patch({ q: event.target.value })}
              placeholder="Search workflow or run ID"
              className="h-9 w-full rounded-md border border-line bg-ink pl-8 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary"
            />
          </div>

          <div className="relative">
            <label htmlFor="executions-status" className="sr-only">
              Filter by status
            </label>
            <select
              id="executions-status"
              value={state.status}
              onChange={(event) =>
                patch({ status: event.target.value as ExecutionStatus | "all" })
              }
              className={selectCls}
            >
              {STATUS_OPTIONS.map((option) => (
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

          <div className="relative">
            <label htmlFor="executions-workflow" className="sr-only">
              Filter by workflow
            </label>
            <select
              id="executions-workflow"
              value={state.workflowId}
              onChange={(event) => patch({ workflowId: event.target.value })}
              className={`${selectCls} max-w-[200px]`}
            >
              <option value="all">All workflows</option>
              {workflowOptions.map((option) => (
                <option key={option.id} value={option.id}>
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

          {triggerOptions.length > 0 && (
            <div className="relative">
              <label htmlFor="executions-trigger" className="sr-only">
                Filter by trigger
              </label>
              <select
                id="executions-trigger"
                value={state.trigger}
                onChange={(event) =>
                  patch({ trigger: event.target.value as TriggerType | "all" })
                }
                className={selectCls}
              >
                <option value="all">All triggers</option>
                {triggerOptions.map((option) => (
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
          )}

          <div
            role="group"
            aria-label="Time range"
            className="flex rounded-md border border-line bg-ink p-0.5"
          >
            {RANGE_OPTIONS.map((option) => {
              const active = state.range === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => patch({ range: option.value })}
                  className={`h-8 rounded-[4px] px-2.5 font-mono text-[11px] transition-colors duration-150 ${
                    active ? "bg-hover font-medium text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
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
            <RetryIcon width={13} height={13} aria-hidden />
            Refresh
          </button>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No executions yet"
            description="When a workflow runs, its status, timing, and trigger show up here."
            action={
              <Link href="/workflows" className={secondaryActionCls}>
                Go to workflows
              </Link>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No executions match your filters"
            description="Try a different search term, status, workflow, or time range."
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
          <>
            <ScrollArea fadeFrom="surface" label="Executions table">
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line/70">
                    <th scope="col" className="px-5 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                      Execution
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                      Trigger
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                      Nodes
                    </th>
                    <SortHeader
                      label="Started"
                      column="started"
                      sort={state.sort}
                      onSort={(column) => patch({ sort: column }, false)}
                    />
                    <SortHeader
                      label="Duration"
                      column="duration"
                      sort={state.sort}
                      onSort={(column) => patch({ sort: column }, false)}
                      align="right"
                    />
                    <th scope="col" className="px-5 py-2.5 text-right font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-line/40 transition-colors last:border-b-0 hover:bg-hover/40"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/workflows/${row.workflowId}`}
                          className="block truncate text-[13.5px] font-medium text-fg transition-colors hover:text-primary-strong"
                        >
                          {row.workflowName}
                        </Link>
                        <Link
                          href={`/executions/${row.id}`}
                          className="mt-0.5 block truncate font-mono text-[11px] text-faint transition-colors hover:text-fg"
                          title={row.id}
                        >
                          {row.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3">
                        <TriggerBadge trigger={row.trigger} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[12px] tabular-nums text-muted">
                          <span className="text-ok">{row.successCount}</span>
                          {row.failedCount > 0 && (
                            <>
                              {" / "}
                              <span className="text-bad">{row.failedCount}</span>
                            </>
                          )}
                          {" of "}
                          {row.nodeCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <time
                          dateTime={row.startedAt}
                          title={row.startedAbsolute}
                          className="text-[13px] text-muted"
                        >
                          {row.startedLabel}
                        </time>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[12.5px] tabular-nums text-muted">
                        {row.durationLabel}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/executions/${row.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
                          aria-label={`Inspect execution ${row.id}`}
                        >
                          Inspect
                          <ChevronRightIcon width={12} height={12} aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/70 px-5 py-3">
              <p className="font-mono text-[11px] text-faint">
                Showing {rangeStart}–{rangeEnd} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setState((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="inline-flex h-8 items-center rounded-md border border-line px-3 text-[12.5px] text-fg transition-colors hover:border-line-strong hover:bg-hover disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-mono text-[11.5px] tabular-nums text-muted">
                  {page} / {pageCount}
                </span>
                <button
                  type="button"
                  disabled={page >= pageCount}
                  onClick={() => setState((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="inline-flex h-8 items-center rounded-md border border-line px-3 text-[12.5px] text-fg transition-colors hover:border-line-strong hover:bg-hover disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
