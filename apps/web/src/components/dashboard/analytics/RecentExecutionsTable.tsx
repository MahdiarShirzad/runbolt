"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { ChevronDownIcon, SearchIcon } from "@/components/landing/icons";
import { formatCount } from "@/lib/dashboard/format";
import type { ExecutionStatus, TimeRange } from "@/lib/dashboard/types";
import { ChevronRightIcon } from "../icons";
import { EmptyState } from "../EmptyState";
import { Panel } from "../Panel";
import { StatusBadge, TriggerBadge } from "../StatusBadge";
import { ExecutionDrawer } from "../ExecutionDrawer";
import {
  EXECUTION_RANGE_MS,
  type ExecutionRow,
} from "../executions-view";

const PAGE_SIZE = 8;

const STATUS_OPTIONS: { value: ExecutionStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "success", label: "Succeeded" },
  { value: "failed", label: "Failed" },
  { value: "running", label: "Running" },
  { value: "queued", label: "Queued" },
  { value: "cancelled", label: "Cancelled" },
];

const selectCls =
  "h-9 appearance-none rounded-md border border-line bg-ink pl-3 pr-8 text-[12.5px] text-fg outline-none transition-colors focus:border-primary";

type SortKey = "started" | "duration";

function SortHeader({
  label,
  column,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  column: SortKey;
  sort: SortKey;
  onSort: (column: SortKey) => void;
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

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function buildCsv(rows: ExecutionRow[]): string {
  const header = ["Workflow", "Run ID", "Status", "Trigger", "Started", "Duration (ms)", "Error"];
  const lines = rows.map((row) =>
    [
      row.workflowName,
      row.id,
      row.status,
      row.trigger,
      row.startedAbsolute,
      row.durationMs == null ? "" : String(row.durationMs),
      row.errorMessage ?? "",
    ]
      .map((value) => csvCell(String(value)))
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function RecentExecutionsTable({
  rows,
  range,
  nowIso,
}: {
  rows: ExecutionRow[];
  range: TimeRange;
  nowIso: string;
}) {
  const nowMs = useMemo(() => new Date(nowIso).getTime(), [nowIso]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ExecutionStatus | "all">("all");
  const [workflowId, setWorkflowId] = useState("all");
  const [sort, setSort] = useState<SortKey>("started");
  const [page, setPage] = useState(1);
  const [inspected, setInspected] = useState<ExecutionRow | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lastTriggerId = useRef<string | null>(null);

  const closeDrawer = useCallback(() => {
    setInspected(null);
    const trigger = lastTriggerId.current ? triggerRefs.current[lastTriggerId.current] : null;
    trigger?.focus();
  }, []);

  const workflowOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows) map.set(row.workflowId, row.workflowName);
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const inPeriod = useMemo(() => {
    const cutoff = nowMs - EXECUTION_RANGE_MS[range];
    return rows.filter((row) => new Date(row.startedAt).getTime() >= cutoff);
  }, [rows, nowMs, range]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = inPeriod.filter(
      (row) =>
        (status === "all" || row.status === status) &&
        (workflowId === "all" || row.workflowId === workflowId) &&
        (needle === "" ||
          row.workflowName.toLowerCase().includes(needle) ||
          row.id.toLowerCase().includes(needle) ||
          (row.errorMessage ?? "").toLowerCase().includes(needle)),
    );
    return [...result].sort((a, b) => {
      if (sort === "duration") {
        if (a.durationMs == null && b.durationMs == null) return 0;
        if (a.durationMs == null) return 1;
        if (b.durationMs == null) return -1;
        return b.durationMs - a.durationMs || b.startedAt.localeCompare(a.startedAt);
      }
      return b.startedAt.localeCompare(a.startedAt);
    });
  }, [inPeriod, query, status, workflowId, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

  const failedCount = inPeriod.filter((row) => row.status === "failed").length;
  const hasFilters = query.trim() !== "" || status !== "all" || workflowId !== "all";

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  function exportFiltered() {
    const csv = buildCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `runbolt-executions-${range}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Panel
      title="Recent executions"
      subtitle={`Latest ${formatCount(rows.length)} runs · ${formatCount(failedCount)} failed`}
      headingId="recent-executions-heading"
      action={
        <Link
          href="/executions"
          className="inline-flex items-center gap-1 text-[12.5px] text-muted transition-colors hover:text-fg"
        >
          View all
          <ChevronRightIcon width={13} height={13} aria-hidden />
        </Link>
      }
      bodyClassName="p-0"
    >
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line/70 px-4 py-3 sm:px-5">
        <div className="relative w-full sm:w-60">
          <label htmlFor="recent-exec-search" className="sr-only">
            Search recent executions
          </label>
          <SearchIcon
            width={14}
            height={14}
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            ref={searchRef}
            id="recent-exec-search"
            type="search"
            value={query}
            onChange={(event) => resetPage(setQuery)(event.target.value)}
            placeholder="Search workflow, run ID, error"
            className="h-9 w-full rounded-md border border-line bg-ink pl-8 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary"
          />
        </div>

        <div className="relative">
          <label htmlFor="recent-exec-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="recent-exec-status"
            value={status}
            onChange={(event) =>
              resetPage(setStatus)(event.target.value as ExecutionStatus | "all")
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
          <label htmlFor="recent-exec-workflow" className="sr-only">
            Filter by workflow
          </label>
          <select
            id="recent-exec-workflow"
            value={workflowId}
            onChange={(event) => resetPage(setWorkflowId)(event.target.value)}
            className={`${selectCls} max-w-[190px]`}
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

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("all");
              setWorkflowId("all");
              setPage(1);
              searchRef.current?.focus();
            }}
            className="h-9 rounded-md px-2.5 text-[12.5px] text-muted transition-colors hover:text-fg"
          >
            Clear
          </button>
        )}

        <button
          type="button"
          onClick={exportFiltered}
          disabled={filtered.length === 0}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12.5px] text-fg transition-colors hover:border-line-strong hover:bg-hover disabled:opacity-40"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
          Export
        </button>
      </div>

      {filtered.length === 0 ? (
        inPeriod.length === 0 ? (
          <EmptyState
            title="No executions in this range"
            description="Pick a wider range or clear filters to see recent runs."
          />
        ) : (
          <EmptyState
            title="No executions match your filters"
            description="Try a different search term, status, or workflow."
          />
        )
      ) : (
        <>
          <ScrollArea fadeFrom="surface" label="Recent executions table">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line/70">
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint sm:px-5">
                    Workflow
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Run
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Status
                  </th>
                  <SortHeader label="Started" column="started" sort={sort} onSort={setSort} />
                  <SortHeader
                    label="Duration"
                    column="duration"
                    sort={sort}
                    onSort={setSort}
                    align="right"
                  />
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Trigger
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                    Error
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint sm:px-5">
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
                    <td className="px-4 py-3 sm:px-5">
                      <Link
                        href={`/workflows/${row.workflowId}`}
                        className="block max-w-[200px] truncate text-[13.5px] font-medium text-fg transition-colors hover:text-primary-strong"
                      >
                        {row.workflowName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/executions/${row.id}`}
                        className="block max-w-[130px] truncate font-mono text-[11px] text-faint transition-colors hover:text-fg"
                        title={row.id}
                      >
                        {row.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
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
                    <td className="px-4 py-3">
                      <TriggerBadge trigger={row.trigger} />
                    </td>
                    <td className="px-4 py-3">
                      {row.errorMessage ? (
                        <span
                          className="block max-w-[200px] truncate text-[12px] text-bad/90"
                          title={row.errorMessage}
                        >
                          {row.errorMessage}
                        </span>
                      ) : (
                        <span className="text-[12px] text-faint">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right sm:px-5">
                      <button
                        ref={(node) => {
                          triggerRefs.current[row.id] = node;
                        }}
                        type="button"
                        onClick={() => {
                          lastTriggerId.current = row.id;
                          setInspected(row);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
                        aria-label={`Inspect execution ${row.id}`}
                      >
                        Inspect
                        <ChevronRightIcon width={12} height={12} aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/70 px-4 py-3 sm:px-5">
            <p className="font-mono text-[11px] text-faint">
              Showing {rangeStart}–{rangeEnd} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="inline-flex h-8 items-center rounded-md border border-line px-3 text-[12.5px] text-fg transition-colors hover:border-line-strong hover:bg-hover disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-mono text-[11.5px] tabular-nums text-muted">
                {safePage} / {pageCount}
              </span>
              <button
                type="button"
                disabled={safePage >= pageCount}
                onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                className="inline-flex h-8 items-center rounded-md border border-line px-3 text-[12.5px] text-fg transition-colors hover:border-line-strong hover:bg-hover disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
      <ExecutionDrawer execution={inspected} onClose={closeDrawer} />
    </Panel>
  );
}
