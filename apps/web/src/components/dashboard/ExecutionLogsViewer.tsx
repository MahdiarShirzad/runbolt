"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { ChevronDownIcon, SearchIcon } from "@/components/landing/icons";
import type { LogLevel } from "@/lib/dashboard/types";
import { EmptyState } from "./EmptyState";
import type { ExecutionLogRow } from "./executions-view";

const LEVEL_OPTIONS: { value: LogLevel | "all"; label: string }[] = [
  { value: "all", label: "All levels" },
  { value: "info", label: "Info" },
  { value: "warn", label: "Warn" },
  { value: "error", label: "Error" },
];

const LEVEL_CLS: Record<LogLevel, { dot: string; text: string }> = {
  info: { dot: "bg-muted", text: "text-muted" },
  warn: { dot: "bg-warn", text: "text-warn" },
  error: { dot: "bg-bad", text: "text-bad" },
};

const selectCls =
  "h-9 appearance-none rounded-md border border-line bg-ink pl-3 pr-8 text-[12.5px] text-fg outline-none transition-colors focus:border-primary";

function formatLogLine(row: ExecutionLogRow): string {
  return `${row.clockLabel} [${row.level}] ${row.source}: ${row.message}`;
}

export function ExecutionLogsViewer({
  logs,
  nodeOptions,
}: {
  logs: ExecutionLogRow[];
  /** Nodes available to filter by (hidden when omitted). */
  nodeOptions?: { value: string; label: string }[];
}) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LogLevel | "all">("all");
  const [nodeId, setNodeId] = useState<string>("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return logs.filter(
      (row) =>
        (level === "all" || row.level === level) &&
        (nodeId === "all" || row.nodeId === nodeId) &&
        (needle === "" ||
          row.message.toLowerCase().includes(needle) ||
          row.source.toLowerCase().includes(needle)),
    );
  }, [logs, query, level, nodeId]);

  const copyAllText = filtered.map(formatLogLine).join("\n");

  if (logs.length === 0) {
    return (
      <EmptyState
        title="No logs yet"
        description="Logs appear here once this execution records output. Older executions may not have logs retained."
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line/70 px-5 py-3">
        <div className="relative w-full sm:w-64">
          <label htmlFor="logs-search" className="sr-only">
            Search logs
          </label>
          <SearchIcon
            width={14}
            height={14}
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            id="logs-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search messages or sources"
            className="h-9 w-full rounded-md border border-line bg-ink pl-8 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary"
          />
        </div>

        <div className="relative">
          <label htmlFor="logs-level" className="sr-only">
            Filter by log level
          </label>
          <select
            id="logs-level"
            value={level}
            onChange={(event) => setLevel(event.target.value as LogLevel | "all")}
            className={selectCls}
          >
            {LEVEL_OPTIONS.map((option) => (
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

        {nodeOptions && nodeOptions.length > 0 && (
          <div className="relative">
            <label htmlFor="logs-node" className="sr-only">
              Filter by node
            </label>
            <select
              id="logs-node"
              value={nodeId}
              onChange={(event) => setNodeId(event.target.value)}
              className={`${selectCls} max-w-[220px]`}
            >
              <option value="all">All nodes</option>
              {nodeOptions.map((option) => (
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

        <div className="ml-auto flex items-center gap-2.5">
          <p className="font-mono text-[11px] text-faint">
            {filtered.length} of {logs.length} lines
          </p>
          <CopyButton
            text={copyAllText}
            label="Copy all visible logs"
            className="rounded-md border border-line"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching log lines"
          description="Try a different search term or log level."
          action={
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setLevel("all");
                setNodeId("all");
              }}
              className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <ol className="divide-y divide-line/40">
          {filtered.map((row) => {
            const levelCls = LEVEL_CLS[row.level];
            return (
              <li
                key={row.id}
                className="flex items-start gap-3 px-5 py-2.5 transition-colors hover:bg-hover/30"
              >
                <time
                  dateTime={row.at}
                  title={row.absoluteLabel}
                  className="shrink-0 pt-0.5 font-mono text-[11px] tabular-nums text-faint"
                >
                  {row.clockLabel}
                </time>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 pt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] ${levelCls.text}`}
                >
                  <span className={`h-[6px] w-[6px] rounded-full ${levelCls.dot}`} aria-hidden />
                  {row.level}
                </span>
                <span className="shrink-0 pt-0.5 font-mono text-[11.5px] text-primary-strong">
                  {row.source}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-[12.5px] leading-relaxed text-muted">
                    {row.message}
                  </p>
                  {row.metadata && Object.keys(row.metadata).length > 0 && (
                    <p className="mt-0.5 break-all font-mono text-[10.5px] leading-relaxed text-faint">
                      {JSON.stringify(row.metadata)}
                    </p>
                  )}
                </div>
                <CopyButton
                  text={formatLogLine(row)}
                  label={`Copy log line from ${row.source}`}
                />
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
