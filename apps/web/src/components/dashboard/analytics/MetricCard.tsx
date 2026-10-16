import type { KpiMetric } from "@/lib/dashboard/analytics/types";
import { Sparkline } from "./Sparkline";

const TONE_COLOR: Record<KpiMetric["tone"], string> = {
  default: "var(--color-muted)",
  ok: "var(--color-ok)",
  bad: "var(--color-bad)",
  warn: "var(--color-warn)",
  accent: "var(--color-accent)",
  highlight: "var(--color-highlight)",
};

function DeltaBadge({ metric }: { metric: KpiMetric }) {
  const { trend, invert, deltaPct } = metric;

  if (deltaPct == null) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-faint">
        — <span className="sr-only">no comparison available</span>
      </span>
    );
  }

  const good = trend === "flat" ? null : trend === "up" ? !invert : invert;
  const color = good == null ? "text-muted" : good ? "text-ok" : "text-bad";
  const glyph = trend === "up" ? "▲" : trend === "down" ? "▼" : "▬";
  const sign = deltaPct > 0 ? "+" : "";
  const label = trend === "flat" ? "no change" : good ? "improving" : "worsening";

  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[11px] tabular-nums ${color}`}>
      <span aria-hidden>{glyph}</span>
      <span>
        {sign}
        {(deltaPct * 100).toFixed(1)}%
      </span>
      <span className="sr-only">{label} vs previous period</span>
    </span>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group/info relative inline-flex">
      <button
        type="button"
        aria-label={text}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-line text-faint transition-colors hover:border-line-strong hover:text-muted"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 11v5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="7.6" r="1.1" fill="currentColor" />
        </svg>
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 z-30 mb-1.5 w-56 rounded-md border border-line bg-tooltip px-2.5 py-2 text-left text-[11.5px] leading-snug text-muted opacity-0 shadow-xl transition-opacity duration-150 group-hover/info:opacity-100 group-focus-within/info:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

/**
 * Primary KPI tile: value, previous-period delta (direction + meaning, not
 * colour alone), a decorative sparkline and an accessible metric explanation.
 */
export function MetricCard({ metric }: { metric: KpiMetric }) {
  const color = TONE_COLOR[metric.tone];

  return (
    <div className="flex flex-col rounded-lg border border-line bg-surface/60 px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[10.5px] uppercase leading-tight tracking-[0.14em] text-faint">
          {metric.label}
        </p>
        <InfoTooltip text={metric.tooltip} />
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="font-display text-[26px] font-semibold leading-none tracking-[-0.01em] tabular-nums text-fg">
          {metric.display}
        </p>
        <Sparkline values={metric.spark} color={color} width={92} height={28} />
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <DeltaBadge metric={metric} />
        <span aria-hidden className="h-3 w-px bg-line" />
        <p className="truncate text-[11.5px] text-muted">{metric.context}</p>
      </div>
    </div>
  );
}
