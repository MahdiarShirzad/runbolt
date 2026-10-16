"use client";

import { useMemo, useRef, useState } from "react";
import { formatCount, formatPercent } from "@/lib/dashboard/format";
import type { HeatmapCell, HeatmapData, HeatmapRow } from "@/lib/dashboard/analytics/types";
import { ChartCard } from "./ChartCard";
import { ChartEmpty } from "./ChartStates";
import { TooltipCard } from "./TooltipCard";
import { viz } from "./chart-theme";

type Metric = "executions" | "failures";

function cellColor(value: number, max: number, metric: Metric): string {
  if (value <= 0) return "rgba(35, 44, 59, 0.45)";
  const t = max <= 0 ? 0 : Math.min(1, value / max);
  if (metric === "failures") return `rgba(242, 97, 78, ${0.2 + 0.72 * t})`;
  return `rgba(199, 240, 78, ${0.16 + 0.74 * t})`;
}

interface HoverState {
  left: number;
  top: number;
  row: HeatmapRow;
  cell: HeatmapCell;
}

/**
 * Calendar-style heatmap: one row per day, one column per hour. Reveals peak
 * windows and quiet periods; hovering a cell shows exact counts and failures.
 */
export function ExecutionHeatmap({
  data,
  hourLabels,
  rangeLabel,
}: {
  data: HeatmapData;
  hourLabels: string[];
  rangeLabel: string;
}) {
  const [metric, setMetric] = useState<Metric>("executions");
  const [hover, setHover] = useState<HoverState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxFailures = useMemo(
    () => data.rows.reduce((max, row) => Math.max(max, ...row.cells.map((cell) => cell.failed)), 0),
    [data.rows],
  );
  const maxValue = metric === "executions" ? data.maxCount : maxFailures;
  const headerLabels =
    data.dayCount === 1 && data.rows[0]
      ? data.rows[0].cells.map((cell) => String(cell.hour).padStart(2, "0"))
      : hourLabels;

  const showHover = (
    event: React.MouseEvent<HTMLButtonElement>,
    row: HeatmapRow,
    cell: HeatmapCell,
  ) => {
    const parent = containerRef.current?.getBoundingClientRect();
    if (!parent) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setHover({
      left: rect.left - parent.left + rect.width / 2,
      top: rect.top - parent.top,
      row,
      cell,
    });
  };

  const hasData = data.total > 0;

  return (
    <ChartCard
      headingId="heatmap-heading"
      eyebrow={rangeLabel}
      title="Execution activity heatmap"
      description="Runs by day and hour — spot peak windows, quiet periods and recurring patterns."
      action={
        <div className="flex items-center gap-3">
          <div role="group" aria-label="Heatmap metric" className="flex rounded-md border border-line bg-ink p-0.5">
            {(["executions", "failures"] as Metric[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={metric === option}
                onClick={() => setMetric(option)}
                className={`h-7 rounded-[4px] px-2.5 font-mono text-[11px] capitalize transition-colors duration-150 ${
                  metric === option ? "bg-hover font-medium text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {!hasData ? (
        <ChartEmpty
          title="No activity"
          description="The heatmap fills in as workflows execute across the selected range."
          height={220}
        />
      ) : (
        <div ref={containerRef} className="relative overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="mb-1 flex items-center gap-2">
              <span className="w-16 shrink-0" aria-hidden />
              <div className="grid flex-1 gap-[2px]" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
                {headerLabels.map((label, index) => (
                  <span
                    key={`${label}-${index}`}
                    className="text-center font-mono text-[9px] text-faint"
                  >
                    {index % 3 === 0 ? label : ""}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-[2px]">
              {data.rows.map((row) => (
                <div key={row.key} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 truncate pr-1 text-right font-mono text-[9.5px] text-faint">
                    {row.label}
                  </span>
                  <div
                    className="grid flex-1 gap-[2px]"
                    style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
                    role="img"
                    aria-label={`${row.longLabel}: ${row.total} executions, ${row.failed} failed`}
                  >
                    {row.cells.map((cell) => {
                      const value = metric === "executions" ? cell.count : cell.failed;
                      return (
                        <button
                          key={cell.hour}
                          type="button"
                          tabIndex={-1}
                          onMouseEnter={(event) => showHover(event, row, cell)}
                          onMouseLeave={() => setHover(null)}
                          title={`${row.longLabel} ${String(cell.hour).padStart(2, "0")}:00 — ${cell.count} runs, ${cell.failed} failed`}
                          aria-label={`${row.longLabel} ${cell.hour}:00, ${cell.count} executions, ${cell.failed} failed`}
                          className="h-3.5 w-full rounded-[2px] transition-transform duration-100 hover:ring-1 hover:ring-line-strong focus-visible:ring-1 focus-visible:ring-primary"
                          style={{ backgroundColor: cellColor(value, maxValue, metric) }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-end gap-2 font-mono text-[10px] text-faint">
              <span>0</span>
              <span
                aria-hidden
                className="h-2.5 w-28 rounded-[2px]"
                style={{
                  background:
                    metric === "failures"
                      ? `linear-gradient(to right, rgba(242,97,78,0.2), rgba(242,97,78,0.92))`
                      : `linear-gradient(to right, rgba(199,240,78,0.16), rgba(199,240,78,0.9))`,
                }}
              />
              <span>{formatCount(maxValue)}</span>
            </div>
          </div>

          {hover && (
            <div
              className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full pb-1.5"
              style={{ left: hover.left, top: hover.top }}
            >
              <TooltipCard
                title={`${hover.row.longLabel} · ${String(hover.cell.hour).padStart(2, "0")}:00`}
                rows={[
                  { label: "Executions", value: formatCount(hover.cell.count), color: viz.volt },
                  { label: "Failed", value: formatCount(hover.cell.failed), color: viz.failed },
                  {
                    label: "Failure rate",
                    value:
                      hover.cell.count === 0
                        ? "—"
                        : formatPercent(hover.cell.failed / hover.cell.count),
                    muted: true,
                  },
                ]}
              />
            </div>
          )}
        </div>
      )}
    </ChartCard>
  );
}
