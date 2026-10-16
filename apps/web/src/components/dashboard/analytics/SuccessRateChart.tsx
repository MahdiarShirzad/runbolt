"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotItemDotProps,
  type TooltipContentProps,
} from "recharts";
import { formatCount, formatPercent } from "@/lib/dashboard/format";
import type { SuccessRatePoint } from "@/lib/dashboard/analytics/types";
import { ChartCard } from "./ChartCard";
import { ChartEmpty } from "./ChartStates";
import { TooltipCard } from "./TooltipCard";
import { axisLine, axisTick, chartMargin, gridStroke, viz } from "./chart-theme";
import { usePrefersReducedMotion } from "./use-reduced-motion";

function RateTooltip(props: TooltipContentProps) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload as SuccessRatePoint | undefined;
  if (!point) return null;
  return (
    <TooltipCard
      title={point.tooltipLabel}
      subtitle={point.total > 0 ? `${formatCount(point.total)} finished` : "no finished runs"}
      rows={[
        {
          label: "Success rate",
          value: point.rate == null ? "—" : formatPercent(point.rate),
          color: viz.success,
        },
        {
          label: "Succeeded",
          value: formatCount(point.success),
        },
        { label: "Failed", value: formatCount(point.failed), color: viz.failed },
        {
          label: "Previous",
          value: point.previousRate == null ? "—" : formatPercent(point.previousRate),
          color: viz.faint,
          muted: true,
        },
      ]}
    />
  );
}

function RateDot(props: DotItemDotProps) {
  const { cx, cy, payload } = props;
  const point = payload as SuccessRatePoint;
  if (cx == null || cy == null || point.rate == null) {
    return <g />;
  }
  if (!point.anomalous) return <g />;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill={viz.failed}
      stroke={viz.surface}
      strokeWidth={1.5}
    />
  );
}

export function SuccessRateChart({
  data,
  rangeLabel,
}: {
  data: {
    points: SuccessRatePoint[];
    target: number;
    average: number | null;
    anomalousCount: number;
  };
  rangeLabel: string;
}) {
  const reduced = usePrefersReducedMotion();
  const points = data.points;
  const hasData = points.some((point) => point.rate != null);

  const chartPoints = useMemo(
    () =>
      points.map((point) => ({
        ...point,
        ratePct: point.rate == null ? null : point.rate * 100,
        previousPct: point.previousRate == null ? null : point.previousRate * 100,
      })),
    [points],
  );

  const domain = useMemo<[number, number]>(() => {
    const rates = points
      .map((point) => point.rate)
      .filter((rate): rate is number => rate != null)
      .map((rate) => rate * 100);
    if (rates.length === 0) return [0, 100];
    const min = Math.min(...rates, data.target * 100);
    const minFloor = Math.max(0, Math.floor((min - 2) / 5) * 5);
    return [minFloor, 100];
  }, [points, data.target]);

  return (
    <ChartCard
      headingId="success-rate-heading"
      eyebrow={rangeLabel}
      title="Success rate trend"
      description="Share of finished runs that succeeded, against the 95% reliability target."
      action={
        <div className="text-right">
          <p className="font-display text-[18px] font-semibold leading-none tabular-nums text-fg">
            {data.average == null ? "—" : formatPercent(data.average)}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
            period average
          </p>
        </div>
      }
    >
      {!hasData ? (
        <ChartEmpty
          title="No finished runs"
          description="Success rate appears once runs complete in the selected range."
          height={240}
        />
      ) : (
        <div className="font-mono">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: viz.success }} />
              Success rate
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span
                aria-hidden
                className="h-0 w-3.5 border-t border-dashed"
                style={{ borderColor: viz.faint }}
              />
              Previous period
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span
                aria-hidden
                className="h-0 w-3.5 border-t border-dashed"
                style={{ borderColor: viz.warn }}
              />
              95% target
            </span>
            {data.anomalousCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-bad">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: viz.failed }} />
                {data.anomalousCount} below target
              </span>
            )}
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartPoints} margin={{ ...chartMargin, left: -4 }}>
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
                  width={38}
                  domain={domain}
                  tickCount={5}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <Tooltip
                  content={RateTooltip}
                  cursor={{ stroke: viz.line, strokeWidth: 1 }}
                  wrapperStyle={{ outline: "none" }}
                />
                <ReferenceLine
                  y={data.target * 100}
                  stroke={viz.warn}
                  strokeDasharray="4 3"
                  label={{
                    value: "95%",
                    position: "insideTopRight",
                    fill: viz.warn,
                    fontSize: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="previousPct"
                  name="Previous period"
                  stroke={viz.faint}
                  strokeWidth={1.25}
                  strokeDasharray="4 3"
                  dot={false}
                  connectNulls
                  isAnimationActive={!reduced}
                />
                <Line
                  type="monotone"
                  dataKey="ratePct"
                  name="Success rate"
                  stroke={viz.success}
                  strokeWidth={2}
                  dot={RateDot}
                  activeDot={{ r: 4, fill: viz.success, stroke: viz.surface, strokeWidth: 2 }}
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
