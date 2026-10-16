import type { ReactNode } from "react";

export interface TooltipRow {
  label: string;
  value: string;
  color?: string;
  muted?: boolean;
}

/** Consistent chart tooltip surface shared by every Recharts visualization. */
export function TooltipCard({
  title,
  subtitle,
  rows,
  footer,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  rows: TooltipRow[];
  footer?: ReactNode;
}) {
  return (
    <div className="min-w-[168px] rounded-md border border-line bg-tooltip px-3 py-2 shadow-xl">
      <p className="text-[11.5px] font-medium text-fg">{title}</p>
      {subtitle && (
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
          {subtitle}
        </p>
      )}
      <dl className="mt-1.5 space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <dt className="flex items-center gap-1.5 text-[11px] text-muted">
              {row.color && (
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-[1px]"
                  style={{ backgroundColor: row.color }}
                />
              )}
              {row.label}
            </dt>
            <dd
              className={`ml-auto font-mono text-[11px] tabular-nums ${
                row.muted ? "text-faint" : "text-fg"
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {footer && <div className="mt-1.5 border-t border-line/60 pt-1.5">{footer}</div>}
    </div>
  );
}
