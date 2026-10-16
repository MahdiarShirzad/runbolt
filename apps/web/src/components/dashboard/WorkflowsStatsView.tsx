"use client";

import { useEffect, useState } from "react";
import { formatCount } from "@/lib/dashboard/format";
import {
  loadLocalState,
  subscribeLocalWorkflows,
} from "@/lib/dashboard/local-workflows";
import { mergeWorkflowStatItems } from "./workflows-view";
import type { WorkflowStatItem } from "./workflows-view";

function StatCard({
  label,
  value,
  context,
}: {
  label: string;
  value: string;
  context: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface/60 px-4 py-3.5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      <p className="mt-2 font-display text-[26px] font-semibold leading-none tracking-[-0.01em] tabular-nums text-fg">
        {value}
      </p>
      <p className="mt-2 text-[12px] leading-snug text-muted">{context}</p>
    </div>
  );
}

/** Status overview for the workflows page — counts derived only from real data fields. */
export function WorkflowsStatsView({ items: baseItems }: { items: WorkflowStatItem[] }) {
  const [items, setItems] = useState<WorkflowStatItem[]>(baseItems);

  // Browser-local changes (created/paused/deleted) update the counts live.
  useEffect(() => {
    function refresh() {
      setItems(mergeWorkflowStatItems(baseItems, loadLocalState()));
    }
    refresh();
    return subscribeLocalWorkflows(refresh);
  }, [baseItems]);

  const total = items.length;
  const active = items.filter((item) => item.status === "active").length;
  const paused = total - active;
  const recentFailures = items.filter(
    (item) => item.lastRunStatus === "failed",
  ).length;

  return (
    <div
      className={`grid gap-3 sm:grid-cols-2 ${
        recentFailures > 0 ? "xl:grid-cols-4" : "xl:grid-cols-3"
      }`}
    >
      <StatCard
        label="Total workflows"
        value={formatCount(total)}
        context="in this workspace"
      />
      <StatCard
        label="Active"
        value={formatCount(active)}
        context="accepting triggers"
      />
      <StatCard
        label="Paused"
        value={formatCount(paused)}
        context="not accepting triggers"
      />
      {recentFailures > 0 && (
        <StatCard
          label="Recent failures"
          value={formatCount(recentFailures)}
          context="last run did not succeed"
        />
      )}
    </div>
  );
}
