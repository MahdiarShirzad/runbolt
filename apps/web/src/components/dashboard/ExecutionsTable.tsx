"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { ChevronRightIcon } from "./icons";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";
import { StatusBadge, TriggerBadge } from "./StatusBadge";
import { ExecutionDrawer } from "./ExecutionDrawer";
import type { ExecutionRow } from "./executions-view";

export function ExecutionsTable({ rows }: { rows: ExecutionRow[] }) {
  const [inspected, setInspected] = useState<ExecutionRow | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lastTriggerId = useRef<string | null>(null);

  const closeDrawer = useCallback(() => {
    setInspected(null);
    const trigger = lastTriggerId.current
      ? triggerRefs.current[lastTriggerId.current]
      : null;
    trigger?.focus();
  }, []);

  return (
    <Panel
      title="Recent executions"
      subtitle={`Last ${rows.length} runs`}
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
      {rows.length === 0 ? (
        <EmptyState
          title="No executions yet"
          description="When a workflow runs, its status, timing, and trigger will show up here."
          action={
            <Link
              href="/templates"
              className="inline-flex h-9 items-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
            >
              Explore templates
            </Link>
          }
        />
      ) : (
        <ScrollArea fadeFrom="surface" label="Recent executions table">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line/70">
                <th scope="col" className="px-5 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                  Workflow
                </th>
                <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                  Status
                </th>
                <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                  Started
                </th>
                <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                  Duration
                </th>
                <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                  Trigger
                </th>
                <th scope="col" className="px-5 py-2.5 text-right font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line/40 transition-colors last:border-b-0 hover:bg-hover/40"
                >
                  <td className="px-5 py-3">
                    <p className="truncate text-[13.5px] font-medium text-fg">{row.workflowName}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-faint">{row.id}</p>
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
                  <td className="px-4 py-3 font-mono text-[12.5px] tabular-nums text-muted">
                    {row.durationLabel}
                  </td>
                  <td className="px-4 py-3">
                    <TriggerBadge trigger={row.trigger} />
                  </td>
                  <td className="px-5 py-3 text-right">
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
      )}
      <ExecutionDrawer execution={inspected} onClose={closeDrawer} />
    </Panel>
  );
}
