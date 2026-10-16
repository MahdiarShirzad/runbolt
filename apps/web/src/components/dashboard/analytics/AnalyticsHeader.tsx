import {
  currentTimestamp,
  firstName,
  formatCount,
  greetingForHour,
} from "@/lib/dashboard/format";
import type { SessionUser, TimeRange, WorkspaceSummary } from "@/lib/dashboard/types";
import { SampleDataBadge } from "../SampleDataBadge";
import { AnalyticsControls } from "./AnalyticsControls";

/**
 * Dashboard header: workspace context, the shared time-range control, refresh
 * and export. Kept compact so controls never crowd the analytics content.
 */
export function AnalyticsHeader({
  user,
  workspace,
  range,
  rangeLabel,
  previousLabel,
  exportCsv,
  exportFilename,
}: {
  user: SessionUser | null;
  workspace: WorkspaceSummary;
  range: TimeRange;
  rangeLabel: string;
  previousLabel: string;
  exportCsv: string;
  exportFilename: string;
}) {
  const greeting = greetingForHour(new Date(currentTimestamp()).getHours());
  const summary = [
    user ? `${greeting}, ${firstName(user.name)}` : greeting,
    workspace.name,
    `${workspace.workflowCount} workflows`,
    `${workspace.activeWorkflowCount} active`,
    `${formatCount(workspace.runsLast30d)} runs / 30d`,
  ];

  return (
    <header className="flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            Execution analytics
          </p>
          <SampleDataBadge />
        </div>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[27px]">
          Operational overview
        </h1>
        <p className="mt-1.5 text-[13px] text-muted">
          {summary.join(" · ")}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-faint">
          <span>
            Showing <span className="text-muted">{rangeLabel.toLowerCase()}</span>
          </span>
          <span aria-hidden className="h-2.5 w-px bg-line" />
          <span>
            compared with the <span className="text-muted">{previousLabel}</span>
          </span>
        </p>
      </div>
      <div className="shrink-0">
        <AnalyticsControls
          current={range}
          exportCsv={exportCsv}
          exportFilename={exportFilename}
        />
      </div>
    </header>
  );
}
