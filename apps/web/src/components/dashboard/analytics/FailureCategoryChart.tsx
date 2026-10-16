import { formatCount, formatPercent } from "@/lib/dashboard/format";
import type { FailureCategoryStat } from "@/lib/dashboard/analytics/types";
import { ChartCard } from "./ChartCard";
import { ChartEmpty } from "./ChartStates";
import { viz } from "./chart-theme";

/**
 * Failure categories as ranked horizontal bars. Rendered with plain markup
 * (no chart runtime) because a ranked list reads better than a pie here.
 */
export function FailureCategoryChart({
  categories,
  failedTotal,
  rangeLabel,
}: {
  categories: FailureCategoryStat[];
  failedTotal: number;
  rangeLabel: string;
}) {
  const max = categories.reduce((value, category) => Math.max(value, category.count), 0);

  return (
    <ChartCard
      headingId="failure-categories-heading"
      eyebrow={rangeLabel}
      title="Failure categories"
      description="Most frequent error signatures across failed runs in the range."
      action={
        <div className="text-right">
          <p className="font-display text-[18px] font-semibold leading-none tabular-nums text-bad">
            {formatCount(failedTotal)}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
            failures
          </p>
        </div>
      }
    >
      {categories.length === 0 ? (
        <ChartEmpty
          title="No failures recorded"
          description="No failed runs in this range — nothing to break down."
          height={220}
        />
      ) : (
        <ul className="space-y-3">
          {categories.map((category) => (
            <li key={category.category}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-[12.5px] text-fg" title={category.category}>
                  {category.category}
                </span>
                <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-muted">
                  {formatCount(category.count)}
                  <span className="ml-1.5 text-faint">{formatPercent(category.pct)}</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line/50">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${max === 0 ? 0 : Math.max(4, (category.count / max) * 100)}%`,
                    backgroundColor: viz.failed,
                    opacity: 0.8,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  );
}
