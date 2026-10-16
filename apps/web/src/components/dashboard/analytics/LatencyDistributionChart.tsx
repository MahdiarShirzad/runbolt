"use client";

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
import type { DurationDistribution } from "@/lib/dashboard/analytics/types";
import { ChartCard } from "./ChartCard";
import { ChartEmpty } from "./ChartStates";
import { TooltipCard } from "./TooltipCard";
import { axisLine, axisTick, gridStroke, viz } from "./chart-theme";
import { usePrefersReducedMotion } from "./use-reduced-motion";

function HistogramTooltip(props: TooltipContentProps) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const bin = payload[0]?.payload as { label: string; count: number; share: number; slow: boolean } | undefined;
  if (!bin) return null;
  return (
    <TooltipCard
      title={bin.label}
      subtitle={bin.slow ? "above P95" : "within P95"}
      rows={[
        { label: "Runs", value: formatCount(bin.count), color: bin.slow ? viz.failed : viz.highlight },
        { label: "Share", value: formatPercent(bin.share) },
      ]}
    />
  );
}

export function LatencyDistributionChart({
  distribution,
  rangeLabel,
}: {
  distribution: DurationDistribution;
  rangeLabel: string;
}) {
  const reduced = usePrefersReducedMotion();
  const total = distribution.total;
  const bins = distribution.bins.map((bin) => ({
    ...bin,
    share: total === 0 ? 0 : bin.count / total,
  }));

  return (
    <ChartCard
      headingId="latency-distribution-heading"
      eyebrow={rangeLabel}
      title="Duration distribution"
      description="Where finished runs cluster in time. Bars past the P95 mark are the slow tail."
      action={
        <div className="flex items-center gap-3">
          <Stat label="P50" value={formatDuration(distribution.p50Ms)} />
          <Stat label="P90" value={formatDuration(distribution.p90Ms)} />
          <Stat label="P99" value={formatDuration(distribution.p99Ms)} tone="text-warn" />
        </div>
      }
    >
      {total === 0 ? (
        <ChartEmpty
          title="No timing data"
          description="The distribution appears once runs report durations."
          height={240}
        />
      ) : (
        <div className="font-mono">
          <div className="h-[248px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bins} margin={{ top: 8, right: 8, bottom: 24, left: -8 }}>
                <CartesianGrid vertical={false} stroke={gridStroke} />
                <XAxis
                  dataKey="label"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={axisLine}
                  interval={0}
                  angle={-32}
                  textAnchor="end"
                  height={48}
                />
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={38}
                  allowDecimals={false}
                  tickFormatter={(value: number) => formatCount(value)}
                />
                <Tooltip
                  content={HistogramTooltip}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  wrapperStyle={{ outline: "none" }}
                />
                <Bar dataKey="count" isAnimationActive={!reduced} maxBarSize={44}>
                  {bins.map((bin) => (
                    <Cell
                      key={bin.label}
                      fill={bin.slow ? viz.failed : viz.highlight}
                      fillOpacity={bin.slow ? 0.85 : 0.65}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: viz.highlight }} />
              Within P95
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: viz.failed }} />
              Slow tail (above P95)
            </span>
            <span className="ml-auto text-faint">
              slowest {formatDuration(distribution.maxMs)} · avg {formatDuration(distribution.avgMs)}
            </span>
          </div>
        </div>
      )}
    </ChartCard>
  );
}

function Stat({ label, value, tone = "text-fg" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="text-right">
      <p className={`font-display text-[14px] font-semibold leading-none tabular-nums ${tone}`}>
        {value}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">{label}</p>
    </div>
  );
}
