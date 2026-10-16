import Link from "next/link";
import { currentTimestamp, formatAbsoluteTime, formatRelativeTime } from "@/lib/dashboard/format";
import { getWorkflows } from "@/lib/dashboard/data";
import type { WorkflowSummary } from "@/lib/dashboard/types";
import { ChevronRightIcon } from "./icons";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";
import { WorkflowStatusBadge } from "./StatusBadge";

function WorkflowRow({ workflow, now }: { workflow: WorkflowSummary; now: number }) {
  const lastRunDot: Record<string, string> = {
    success: "bg-ok",
    failed: "bg-bad",
    running: "bg-volt blink",
    queued: "bg-state-queued",
    cancelled: "bg-state-cancelled",
  };

  return (
    <li className="flex items-center gap-3 border-t border-line/50 px-5 py-3 transition-colors first:border-t-0 hover:bg-hover/40">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-fg">{workflow.name}</p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-faint">{workflow.slug}</p>
      </div>
      <div className="hidden shrink-0 sm:block">
        <WorkflowStatusBadge status={workflow.status} />
      </div>
      <div className="hidden w-[132px] shrink-0 md:block">
        {workflow.lastRun ? (
          <p className="flex items-center justify-end gap-1.5 text-[12.5px] text-muted">
            <span
              className={`h-[7px] w-[7px] shrink-0 rounded-full ${lastRunDot[workflow.lastRun.status] ?? "bg-muted"}`}
              aria-hidden
            />
            <time dateTime={workflow.lastRun.at} title={formatAbsoluteTime(workflow.lastRun.at)}>
              {formatRelativeTime(workflow.lastRun.at, now)}
            </time>
          </p>
        ) : (
          <p className="text-right text-[12.5px] text-faint">Never run</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Link
          href="/workflows"
          className="inline-flex items-center gap-1 rounded px-2 py-1.5 text-[12.5px] text-muted transition-colors hover:text-fg"
          aria-label={`Open ${workflow.name}`}
        >
          Open
          <ChevronRightIcon width={12} height={12} aria-hidden />
        </Link>
      </div>
    </li>
  );
}

export async function WorkflowOverview({ limit = 6 }: { limit?: number }) {
  const workflows = await getWorkflows(limit);
  const now = currentTimestamp();

  return (
    <Panel
      title="Workflows"
      subtitle="Recently updated"
      headingId="workflows-heading"
      action={
        <Link
          href="/workflows"
          className="inline-flex items-center gap-1 text-[12.5px] text-muted transition-colors hover:text-fg"
        >
          View all
          <ChevronRightIcon width={13} height={13} aria-hidden />
        </Link>
      }
      bodyClassName="p-0"
    >
      {workflows.length === 0 ? (
        <EmptyState
          title="No workflows yet"
          description="Create your first workflow to start automating tasks."
        />
      ) : (
        <ul>
          {workflows.map((workflow) => (
            <WorkflowRow key={workflow.id} workflow={workflow} now={now} />
          ))}
        </ul>
      )}
    </Panel>
  );
}
