"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatCount, formatPercent } from "@/lib/dashboard/format";
import type { TriggerStat } from "@/lib/dashboard/analytics/types";
import { ChartCard } from "./ChartCard";
import { ChartEmpty } from "./ChartStates";
import { TooltipCard } from "./TooltipCard";
import { axisLine, axisTick, chartMargin, cursorFill, gridStroke, viz } from "./chart-theme";
import { usePrefersReducedMotion } from "./use-reduced-motion";

function TriggerTooltip(props: TooltipContentProps) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const stat = payload[0]?.payload as TriggerStat | undefined;
  if (!stat) return null;
  return (
    <TooltipCard
      title={stat.label}
      subtitle={`${formatPercent(stat.pct)} of runs`}
      rows={[
        { label: "Total", value: formatCount(stat.total) },
        { label: "Succeeded", value: formatCount(stat.success), color: viz.success },
        { label: "Failed", value: formatCount(stat.failed), color: viz.failed },
        { label: "Other", value: formatCount(stat.other), color: viz.muted, muted: true },
      ]}
    />
  );
}

export function TriggerDistributionChart({
  triggers,
  rangeLabel,
}: {
  triggers: TriggerStat[];
  rangeLabel: string;
}) {
  const reduced = usePrefersReducedMotion();
  const hasData = triggers.some((trigger) => trigger.total > 0);

  return (
    <ChartCard
      headingId="triggers-heading"
      eyebrow={rangeLabel}
      title="Runs by trigger"
      description="How workflows are being invoked, split by outcome."
    >
      {!hasData ? (
        <ChartEmpty
          title="No executions"
          description="Trigger breakdown appears once runs execute."
          height={240}
        />
      ) : (
        <div className="font-mono">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: viz.success }} />
              Succeeded
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: viz.failed }} />
              Failed
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: viz.muted }} />
              Other
            </span>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={triggers} margin={{ ...chartMargin, left: -8 }} barCategoryGap="26%">
                <CartesianGrid vertical={false} stroke={gridStroke} />
                <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={axisLine} />
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  allowDecimals={false}
                  tickFormatter={(value: number) => formatCount(value)}
                />
                <Tooltip
                  content={TriggerTooltip}
                  cursor={{ fill: cursorFill }}
                  wrapperStyle={{ outline: "none" }}
                />
                <Bar
                  dataKey="success"
                  name="Succeeded"
                  stackId="trigger"
                  fill={viz.success}
                  isAnimationActive={!reduced}
                  maxBarSize={44}
                />
                <Bar
                  dataKey="failed"
                  name="Failed"
                  stackId="trigger"
                  fill={viz.failed}
                  isAnimationActive={!reduced}
                  maxBarSize={44}
                />
                <Bar
                  dataKey="other"
                  name="Other"
                  stackId="trigger"
                  fill={viz.muted}
                  isAnimationActive={!reduced}
                  maxBarSize={44}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
