import Link from "next/link";
import { currentTimestamp, firstName, formatCount, greetingForHour } from "@/lib/dashboard/format";
import type { SessionUser, WorkspaceSummary } from "@/lib/dashboard/types";
import { primaryActionCls, secondaryActionCls } from "./actions";
import { SampleDataBadge } from "./SampleDataBadge";

export function WelcomeHeader({
  user,
  workspace,
}: {
  user: SessionUser | null;
  workspace: WorkspaceSummary;
}) {
  const greeting = greetingForHour(new Date(currentTimestamp()).getHours());
  const summary = [
    `${workspace.name}`,
    `${workspace.workflowCount} workflows`,
    `${workspace.activeWorkflowCount} active`,
    `${formatCount(workspace.runsLast30d)} runs in the last 30 days`,
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            Workspace · {workspace.name}
          </p>
          <SampleDataBadge />
        </div>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
          {user ? `${greeting}, ${firstName(user.name)}.` : `${greeting}.`}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{summary.join(" · ")}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2.5">
        <Link href="/executions" className={secondaryActionCls}>
          View Executions
        </Link>
        <Link href="/workflows" className={primaryActionCls}>
          Create Workflow
        </Link>
      </div>
    </div>
  );
}
