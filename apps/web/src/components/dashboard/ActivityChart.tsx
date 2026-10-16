import { formatBucketLabel, formatBucketLabelLong, formatCompactCount, formatCount } from "@/lib/dashboard/format";
import { getActivitySeries } from "@/lib/dashboard/data";
import type { ActivitySeries, TimeRange } from "@/lib/dashboard/types";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";
import { RangeSelector } from "./RangeSelector";

function niceMax(max: number): number {
  if (max <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const normalized = max / magnitude;
  const step =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function tickIndexes(count: number): number[] {
  if (count <= 8) return Array.from({ length: count }, (_, i) => i);
  const ticks = new Set([
    0,
    Math.floor(count / 4),
    Math.floor(count / 2),
    Math.floor((3 * count) / 4),
    count - 1,
  ]);
  return [...ticks].sort((a, b) => a - b);
}

export async function ActivityChart({ range }: { range: TimeRange }) {
  const series: ActivitySeries = await getActivitySeries(range);
  const { points, bucketLabel } = series;

  const totals = points.map((p) => p.success + p.failed);
  const maxTotal = Math.max(0, ...totals);
  const hasData = totals.some((total) => total > 0);
  const yMax = niceMax(maxTotal);
  const totalSuccess = points.reduce((sum, p) => sum + p.success, 0);
  const totalFailed = points.reduce((sum, p) => sum + p.failed, 0);
  const ticks = tickIndexes(points.length);
  const gridPercents = [0, 25, 50, 75, 100];

  return (
    <Panel
      title="Execution activity"
      subtitle={`${series.rangeLabel} · per ${bucketLabel}`}
      action={<RangeSelector current={range} />}
      headingId="activity-heading"
      bodyClassName="p-5 pt-4"
    >
      {!hasData ? (
        <EmptyState
          title="No executions in this range"
          description="Runs will appear here as soon as workflows start executing in the selected window."
        />
      ) : (
        <>
          <div className="mb-3 flex items-center justify-end gap-4">
            <span className="flex items-center gap-1.5 text-[11.5px] text-muted">
              <span className="h-2 w-2 rounded-[2px] bg-ok" aria-hidden />
              Succeeded
            </span>
            <span className="flex items-center gap-1.5 text-[11.5px] text-muted">
              <span className="h-2 w-2 rounded-[2px] bg-bad" aria-hidden />
              Failed
            </span>
          </div>

          <div className="relative h-48 pl-10 sm:h-52">
            {gridPercents.map((percent) => (
              <div
                key={percent}
                aria-hidden
                className="absolute inset-y-0 left-10 right-0"
              >
                <div
                  className="absolute h-px w-full bg-line/50"
                  style={{ top: `${100 - percent}%` }}
                />
              </div>
            ))}
            <span
              aria-hidden
              className="absolute left-0 w-8 -translate-y-1/2 text-right font-mono text-[10px] text-faint"
              style={{ top: "0%" }}
            >
              {formatCompactCount(yMax)}
            </span>
            <span
              aria-hidden
              className="absolute left-0 w-8 -translate-y-1/2 text-right font-mono text-[10px] text-faint"
              style={{ top: "50%" }}
            >
              {formatCompactCount(yMax / 2)}
            </span>
            <span
              aria-hidden
              className="absolute left-0 w-8 translate-y-1/2 text-right font-mono text-[10px] text-faint"
              style={{ top: "100%" }}
            >
              0
            </span>

            <div
              role="group"
              aria-label={`Execution activity, ${series.rangeLabel.toLowerCase()}. ${formatCount(totalSuccess)} succeeded, ${formatCount(totalFailed)} failed.`}
              className="absolute inset-y-0 left-10 right-0 flex items-end gap-[3px]"
            >
              {points.map((point, index) => {
                const date = new Date(point.at);
                const successPct = (point.success / yMax) * 100;
                const failedPct = (point.failed / yMax) * 100;
                const labelLong = formatBucketLabelLong(date, bucketLabel);
                const edgeClass =
                  index === 0
                    ? "left-0 translate-x-0"
                    : index === points.length - 1
                      ? "left-auto right-0 translate-x-0"
                      : "left-1/2 -translate-x-1/2";
                return (
                  <div
                    key={point.at}
                    role="img"
                    tabIndex={0}
                    aria-label={`${labelLong}: ${point.success} succeeded, ${point.failed} failed`}
                    className="group relative flex h-full min-w-0 flex-1 cursor-default flex-col justify-end outline-none"
                  >
                    <div className="flex h-full flex-col justify-end">
                      {point.failed > 0 && (
                        <div
                          className="w-full rounded-t-[2px] bg-bad/85 transition-colors group-hover:bg-bad group-focus-visible:bg-bad"
                          style={{ height: `${Math.max(failedPct, 1.2)}%` }}
                        />
                      )}
                      {point.success > 0 && (
                        <div
                          className={`w-full bg-ok/75 transition-colors group-hover:bg-ok group-focus-visible:bg-ok ${
                            point.failed > 0 ? "" : "rounded-t-[2px]"
                          }`}
                          style={{ height: `${Math.max(successPct, 1.2)}%` }}
                        />
                      )}
                    </div>
                    <div
                      className={`pointer-events-none absolute bottom-full z-20 mb-2 w-40 rounded-md border border-line bg-tooltip px-2.5 py-2 opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 ${edgeClass}`}
                    >
                      <p className="text-[11.5px] font-medium text-fg">{labelLong}</p>
                      <dl className="mt-1.5 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <dt className="flex items-center gap-1.5 text-[11px] text-muted">
                            <span className="h-1.5 w-1.5 rounded-[1px] bg-ok" aria-hidden />
                            Succeeded
                          </dt>
                          <dd className="ml-auto font-mono text-[11px] tabular-nums text-fg">
                            {formatCount(point.success)}
                          </dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <dt className="flex items-center gap-1.5 text-[11px] text-muted">
                            <span className="h-1.5 w-1.5 rounded-[1px] bg-bad" aria-hidden />
                            Failed
                          </dt>
                          <dd className="ml-auto font-mono text-[11px] tabular-nums text-fg">
                            {formatCount(point.failed)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div aria-hidden className="mt-2 flex gap-[3px] pl-10">
            {points.map((point, index) => (
              <span
                key={point.at}
                className="min-w-0 flex-1 text-center font-mono text-[10px] text-faint"
              >
                {ticks.includes(index) ? formatBucketLabel(new Date(point.at), bucketLabel) : ""}
              </span>
            ))}
          </div>

          <table className="sr-only">
            <caption>Execution activity — {series.rangeLabel}</caption>
            <thead>
              <tr>
                <th scope="col">{bucketLabel}</th>
                <th scope="col">Succeeded</th>
                <th scope="col">Failed</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.at}>
                  <th scope="row">{formatBucketLabelLong(new Date(point.at), bucketLabel)}</th>
                  <td>{point.success}</td>
                  <td>{point.failed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Panel>
  );
}
