"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatCount, formatDuration, formatPercent } from "@/lib/dashboard/format";
import type { WorkflowRank } from "@/lib/dashboard/analytics/types";
import { ChartCard } from "./ChartCard";
import { ChartEmpty } from "./ChartStates";
import { TooltipCard } from "./TooltipCard";
import { axisLine, axisTick, cursorFill, gridStroke, viz } from "./chart-theme";
import { usePrefersReducedMotion } from "./use-reduced-motion";

type View = "runs" | "failures" | "duration";

interface Row extends WorkflowRank {
  other: number;
  failurePct: number;
}

const VIEWS: { value: View; label: string; question: string }[] = [
  { value: "runs", label: "Most active", question: "Highest execution volume" },
  { value: "failures", label: "Flakiest", question: "Highest failure rate" },
  { value: "duration", label: "Slowest", question: "Highest P95 duration" },
];

function rankTooltip(view: View) {
  return function RankTooltip(props: TooltipContentProps) {
    const { active, payload } = props;
    if (!active || !payload || payload.length === 0) return null;
    const row = payload[0]?.payload as Row | undefined;
    if (!row) return null;
    return (
      <TooltipCard
        title={row.name}
        subtitle={`${formatCount(row.runs)} runs`}
        rows={
          view === "runs"
            ? [
                { label: "Succeeded", value: formatCount(row.success), color: viz.success },
                { label: "Failed", value: formatCount(row.failed), color: viz.failed },
                { label: "Other", value: formatCount(row.other), color: viz.muted, muted: true },
              ]
            : view === "failures"
              ? [
                  { label: "Failure rate", value: formatPercent(row.failureRate ?? 0), color: viz.failed },
                  { label: "Failed", value: formatCount(row.failed) },
                  { label: "Runs", value: formatCount(row.runs) },
                ]
              : [
                  { label: "P95", value: formatDuration(row.p95DurationMs), color: viz.warn },
                  { label: "Average", value: formatDuration(row.avgDurationMs) },
                  { label: "Runs", value: formatCount(row.runs) },
                ]
        }
      />
    );
  };
}

export function WorkflowPerformanceChart({
  data,
  rangeLabel,
}: {
  data: { byRuns: WorkflowRank[]; byFailures: WorkflowRank[]; byDuration: WorkflowRank[] };
  rangeLabel: string;
}) {
  const reduced = usePrefersReducedMotion();
  const router = useRouter();
  const [view, setView] = useState<View>("runs");

  const rows = useMemo<Row[]>(() => {
    const source =
      view === "runs" ? data.byRuns : view === "failures" ? data.byFailures : data.byDuration;
    return source.map((rank) => ({
      ...rank,
      other: Math.max(0, rank.runs - rank.success - rank.failed),
      failurePct: (rank.failureRate ?? 0) * 100,
    }));
  }, [view, data]);

  const RenderedTooltip = rankTooltip(view);
  const activeView = VIEWS.find((option) => option.value === view)!;

  const openWorkflow = (data: unknown) => {
    const row = (data as { payload?: Row }).payload;
    if (row) router.push(`/workflows/${row.slug}`);
  };

  return (
    <ChartCard
      headingId="workflow-performance-heading"
      eyebrow={rangeLabel}
      title="Workflow performance"
      description={`${activeView.question}. Select a bar to open the workflow.`}
      action={
        <div role="group" aria-label="Workflow ranking" className="flex rounded-md border border-line bg-ink p-0.5">
          {VIEWS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={option.value === view}
              onClick={() => setView(option.value)}
              className={`h-7 rounded-[4px] px-2.5 font-mono text-[11px] transition-colors duration-150 ${
                option.value === view
                  ? "bg-hover font-medium text-fg"
                  : "text-muted hover:text-fg"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      }
    >
      {rows.length === 0 ? (
        <ChartEmpty
          title="No workflow activity"
          description="Rankings appear once workflows run in the selected range."
          height={280}
        />
      ) : (
        <div className="font-mono [&_.recharts-rectangle]:cursor-pointer">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
                barCategoryGap="28%"
              >
                <CartesianGrid horizontal={false} stroke={gridStroke} />
                <XAxis
                  type="number"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={axisLine}
                  allowDecimals={false}
                  tickFormatter={(value: number) =>
                    view === "duration" ? formatDuration(value) : formatCount(value)
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={132}
                  interval={0}
                />
                <Tooltip
                  content={RenderedTooltip}
                  cursor={{ fill: cursorFill }}
                  wrapperStyle={{ outline: "none" }}
                />
                {view === "runs" && (
                  <>
                    <Bar
                      dataKey="success"
                      name="Succeeded"
                      stackId="runs"
                      fill={viz.success}
                      isAnimationActive={!reduced}
                      maxBarSize={18}
                      onClick={openWorkflow}
                    />
                    <Bar
                      dataKey="failed"
                      name="Failed"
                      stackId="runs"
                      fill={viz.failed}
                      isAnimationActive={!reduced}
                      maxBarSize={18}
                      onClick={openWorkflow}
                    />
                    <Bar
                      dataKey="other"
                      name="Other"
                      stackId="runs"
                      fill={viz.queued}
                      isAnimationActive={!reduced}
                      maxBarSize={18}
                      radius={[0, 3, 3, 0]}
                      onClick={openWorkflow}
                    />
                  </>
                )}
                {view === "failures" && (
                  <Bar
                    dataKey="failurePct"
                    isAnimationActive={!reduced}
                    maxBarSize={18}
                    radius={[0, 3, 3, 0]}
                    onClick={openWorkflow}
                  >
                    {rows.map((row) => (
                      <Cell
                        key={row.workflowId}
                        fill={viz.failed}
                        fillOpacity={0.5 + Math.min(0.5, (row.failureRate ?? 0) * 2)}
                      />
                    ))}
                  </Bar>
                )}
                {view === "duration" && (
                  <Bar
                    dataKey="p95DurationMs"
                    isAnimationActive={!reduced}
                    maxBarSize={18}
                    radius={[0, 3, 3, 0]}
                    onClick={openWorkflow}
                  >
                    {rows.map((row) => (
                      <Cell key={row.workflowId} fill={viz.warn} fillOpacity={0.7} />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ul className="sr-only">
            {rows.map((row) => (
              <li key={row.workflowId}>
                <a href={`/workflows/${row.slug}`}>{row.name}</a>: {formatCount(row.runs)} runs,{" "}
                {formatCount(row.failed)} failed, P95 {formatDuration(row.p95DurationMs)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}
