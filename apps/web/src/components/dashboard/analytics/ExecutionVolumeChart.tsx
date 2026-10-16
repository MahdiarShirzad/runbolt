"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatCompactCount, formatCount } from "@/lib/dashboard/format";
import type { VolumeGranularity, VolumePoint } from "@/lib/dashboard/analytics/types";
import { ChartCard } from "./ChartCard";
import { ChartEmpty } from "./ChartStates";
import { TooltipCard } from "./TooltipCard";
import {
  axisLine,
  axisTick,
  chartMargin,
  cursorFill,
  gridStroke,
  viz,
} from "./chart-theme";
import { usePrefersReducedMotion } from "./use-reduced-motion";

const SERIES = [
  { key: "success", label: "Succeeded", color: viz.success },
  { key: "failed", label: "Failed", color: viz.failed },
  { key: "cancelled", label: "Cancelled", color: viz.cancelled },
  { key: "running", label: "Running", color: viz.running },
  { key: "queued", label: "Queued", color: viz.queued },
] as const;

type SeriesKey = (typeof SERIES)[number]["key"] | "previous";

function VolumeTooltip(props: TooltipContentProps) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload as VolumePoint | undefined;
  if (!point) return null;

  return (
    <TooltipCard
      title={point.tooltipLabel}
      subtitle={`${formatCount(point.total)} total`}
      rows={[
        { label: "Succeeded", value: formatCount(point.success), color: viz.success },
        { label: "Failed", value: formatCount(point.failed), color: viz.failed },
        { label: "Cancelled", value: formatCount(point.cancelled), color: viz.cancelled },
        { label: "Running", value: formatCount(point.running), color: viz.running },
        { label: "Queued", value: formatCount(point.queued), color: viz.queued },
        {
          label: "Previous",
          value: formatCount(point.previousTotal),
          color: viz.faint,
          muted: true,
        },
      ]}
    />
  );
}

export function ExecutionVolumeChart({
  data,
  rangeLabel,
  previousLabel,
}: {
  data: VolumeGranularity[];
  rangeLabel: string;
  previousLabel: string;
}) {
  const reduced = usePrefersReducedMotion();
  const defaultGranularity =
    data.find((gran) => gran.value === "day")?.value ?? data[0]?.value ?? "hour";
  const [granularity, setGranularity] = useState(defaultGranularity);
  const [hidden, setHidden] = useState<Set<SeriesKey>>(() => new Set());

  const active = data.find((gran) => gran.value === granularity) ?? data[0];
  const points = useMemo(() => active?.points ?? [], [active]);
  const hasPrevious = useMemo(() => points.some((point) => point.previousTotal > 0), [points]);
  const hasData = useMemo(() => points.some((point) => point.total > 0), [points]);

  const toggle = (key: SeriesKey) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <ChartCard
      headingId="volume-heading"
      eyebrow={rangeLabel}
      title="Execution volume"
      description="Runs started over time, split by outcome. Toggle series to isolate signals."
      action={
        <div
          role="group"
          aria-label="Chart granularity"
          className="flex rounded-md border border-line bg-ink p-0.5"
        >
          {data.map((gran) => (
            <button
              key={gran.value}
              type="button"
              aria-pressed={gran.value === granularity}
              onClick={() => setGranularity(gran.value)}
              className={`h-7 rounded-[4px] px-2.5 font-mono text-[11px] transition-colors duration-150 ${
                gran.value === granularity
                  ? "bg-hover font-medium text-fg"
                  : "text-muted hover:text-fg"
              }`}
            >
              {gran.label}
            </button>
          ))}
        </div>
      }
    >
      {!hasData ? (
        <ChartEmpty
          title="No executions in this range"
          description="Runs will appear here as soon as workflows execute in the selected window."
        />
      ) : (
        <div className="font-mono">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {SERIES.map((series) => {
              const isHidden = hidden.has(series.key);
              return (
                <button
                  key={series.key}
                  type="button"
                  aria-pressed={!isHidden}
                  onClick={() => toggle(series.key)}
                  className={`inline-flex items-center gap-1.5 rounded text-[11px] transition-opacity ${
                    isHidden ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-[2px]"
                    style={{ backgroundColor: series.color }}
                  />
                  <span className={isHidden ? "text-faint line-through" : "text-muted"}>
                    {series.label}
                  </span>
                </button>
              );
            })}
            {hasPrevious && (
              <button
                type="button"
                aria-pressed={!hidden.has("previous")}
                onClick={() => toggle("previous")}
                className={`inline-flex items-center gap-1.5 rounded text-[11px] transition-opacity ${
                  hidden.has("previous") ? "opacity-40" : "opacity-100"
                }`}
              >
                <span aria-hidden className="h-0 w-3.5 border-t border-dashed" style={{ borderColor: viz.faint }} />
                <span className={hidden.has("previous") ? "text-faint line-through" : "text-muted"}>
                  Previous period
                </span>
              </button>
            )}
          </div>

          <div className="h-[272px] w-full" role="img" aria-label={`Execution volume ${rangeLabel}, per ${active?.label ?? ""}`}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                key={granularity}
                data={points}
                margin={{ ...chartMargin, left: 0 }}
                barCategoryGap={points.length > 40 ? "10%" : "22%"}
              >
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
                  width={40}
                  tickFormatter={(value: number) => formatCompactCount(value)}
                />
                <Tooltip
                  content={VolumeTooltip}
                  cursor={{ fill: cursorFill }}
                  wrapperStyle={{ outline: "none" }}
                />
                {SERIES.map((series) => (
                  <Bar
                    key={series.key}
                    dataKey={series.key}
                    name={series.label}
                    stackId="runs"
                    fill={series.color}
                    hide={hidden.has(series.key)}
                    isAnimationActive={!reduced}
                    maxBarSize={28}
                  />
                ))}
                {hasPrevious && (
                  <Line
                    type="monotone"
                    dataKey="previousTotal"
                    name="Previous period"
                    stroke={viz.faint}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={false}
                    hide={hidden.has("previous")}
                    isAnimationActive={!reduced}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-faint">{previousLabel} shown as a dashed line.</p>
        </div>
      )}
    </ChartCard>
  );
}
