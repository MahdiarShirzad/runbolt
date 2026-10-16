"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatDuration } from "@/lib/dashboard/format";
import type { DurationPoint } from "@/lib/dashboard/analytics/types";
import { ChartCard } from "./ChartCard";
import { ChartEmpty } from "./ChartStates";
import { TooltipCard } from "./TooltipCard";
import { axisLine, axisTick, chartMargin, gridStroke, viz } from "./chart-theme";
import { usePrefersReducedMotion } from "./use-reduced-motion";

function DurationTooltip(props: TooltipContentProps) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload as DurationPoint | undefined;
  if (!point) return null;
  return (
    <TooltipCard
      title={point.tooltipLabel}
      rows={[
        { label: "P95", value: formatDuration(point.p95), color: viz.warn },
        { label: "Median", value: formatDuration(point.p50), color: viz.highlight },
        { label: "Average", value: formatDuration(point.avg), color: viz.accent },
        {
          label: "Previous avg",
          value: formatDuration(point.previousAvg),
          color: viz.faint,
          muted: true,
        },
      ]}
    />
  );
}

export function ExecutionDurationChart({
  data,
  rangeLabel,
}: {
  data: { points: DurationPoint[]; average: number | null; p95: number | null };
  rangeLabel: string;
}) {
  const reduced = usePrefersReducedMotion();
  const hasData = data.points.some((point) => point.avg != null);

  return (
    <ChartCard
      headingId="duration-heading"
      eyebrow={rangeLabel}
      title="Duration trend"
      description="Average, median and 95th-percentile execution time to separate normal from slow."
      action={
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="font-display text-[16px] font-semibold leading-none tabular-nums text-fg">
              {formatDuration(data.average)}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
              avg
            </p>
          </div>
          <div>
            <p className="font-display text-[16px] font-semibold leading-none tabular-nums text-warn">
              {formatDuration(data.p95)}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
              p95
            </p>
          </div>
        </div>
      }
    >
      {!hasData ? (
        <ChartEmpty
          title="No timing data"
          description="Duration trends appear once runs finish and report a duration."
          height={240}
        />
      ) : (
        <div className="font-mono">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: viz.accent }} />
              Average
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: viz.highlight }} />
              Median
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: viz.warn }} />
              P95
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span
                aria-hidden
                className="h-0 w-3.5 border-t border-dashed"
                style={{ borderColor: viz.faint }}
              />
              Previous avg
            </span>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.points} margin={{ ...chartMargin, left: -4 }}>
                <CartesianGrid vertical={false} stroke={gridStroke} />
                <XAxis
                  dataKey="label"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={axisLine}
                  interval="preserveStartEnd"
                  minTickGap={22}
                />
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={46}
                  tickFormatter={(value: number) => formatDuration(value)}
                />
                <Tooltip
                  content={DurationTooltip}
                  cursor={{ stroke: viz.line, strokeWidth: 1 }}
                  wrapperStyle={{ outline: "none" }}
                />
                <Line
                  type="monotone"
                  dataKey="previousAvg"
                  name="Previous avg"
                  stroke={viz.faint}
                  strokeWidth={1.25}
                  strokeDasharray="4 3"
                  dot={false}
                  connectNulls
                  isAnimationActive={!reduced}
                />
                <Line
                  type="monotone"
                  dataKey="p95"
                  name="P95"
                  stroke={viz.warn}
                  strokeWidth={1.75}
                  dot={false}
                  connectNulls
                  isAnimationActive={!reduced}
                />
                <Line
                  type="monotone"
                  dataKey="p50"
                  name="Median"
                  stroke={viz.highlight}
                  strokeWidth={1.75}
                  dot={false}
                  connectNulls
                  isAnimationActive={!reduced}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  name="Average"
                  stroke={viz.accent}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: viz.accent, stroke: viz.surface, strokeWidth: 2 }}
                  connectNulls
                  isAnimationActive={!reduced}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
