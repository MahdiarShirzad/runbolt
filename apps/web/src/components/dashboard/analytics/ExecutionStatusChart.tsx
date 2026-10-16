"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipContentProps } from "recharts";
import { formatCount, formatPercent } from "@/lib/dashboard/format";
import type { StatusStat } from "@/lib/dashboard/analytics/types";
import { ChartCard } from "./ChartCard";
import { ChartEmpty } from "./ChartStates";
import { TooltipCard } from "./TooltipCard";
import { STATUS_COLORS, viz } from "./chart-theme";
import { usePrefersReducedMotion } from "./use-reduced-motion";

function StatusTooltip(props: TooltipContentProps) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const stat = payload[0]?.payload as StatusStat | undefined;
  if (!stat) return null;
  return (
    <TooltipCard
      title={stat.label}
      rows={[
        { label: "Runs", value: formatCount(stat.count), color: STATUS_COLORS[stat.status] },
        { label: "Share", value: formatPercent(stat.pct) },
      ]}
    />
  );
}

export function ExecutionStatusChart({
  status,
  rangeLabel,
}: {
  status: StatusStat[];
  rangeLabel: string;
}) {
  const reduced = usePrefersReducedMotion();
  const total = status.reduce((sum, stat) => sum + stat.count, 0);
  const visible = status.filter((stat) => stat.count > 0);

  return (
    <ChartCard
      headingId="status-heading"
      eyebrow={rangeLabel}
      title="Execution outcomes"
      description="How every run in the range finished, with absolute counts."
    >
      {total === 0 ? (
        <ChartEmpty
          title="No executions"
          description="Outcome breakdown appears when runs execute in this range."
          height={200}
        />
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="relative h-[164px] w-[164px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visible}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={visible.length > 1 ? 1.5 : 0}
                  stroke={viz.surface}
                  strokeWidth={2}
                  isAnimationActive={!reduced}
                >
                  {visible.map((stat) => (
                    <Cell key={stat.status} fill={STATUS_COLORS[stat.status]} />
                  ))}
                </Pie>
                <Tooltip content={StatusTooltip} wrapperStyle={{ outline: "none" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-[22px] font-semibold leading-none tabular-nums text-fg">
                {formatCount(total)}
              </span>
              <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                runs
              </span>
            </div>
          </div>

          <ul className="w-full min-w-0 flex-1 space-y-1.5">
            {status.map((stat) => (
              <li
                key={stat.status}
                className="flex items-center gap-2.5"
                aria-label={`${stat.label}: ${stat.count} runs, ${formatPercent(stat.pct)}`}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                  style={{ backgroundColor: STATUS_COLORS[stat.status] }}
                />
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-muted">
                  {stat.label}
                </span>
                <span className="font-mono text-[12px] tabular-nums text-fg">
                  {formatCount(stat.count)}
                </span>
                <span className="w-12 text-right font-mono text-[11px] tabular-nums text-faint">
                  {formatPercent(stat.pct)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}
