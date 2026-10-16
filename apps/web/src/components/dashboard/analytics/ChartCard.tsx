import type { ReactNode } from "react";

/**
 * Shared shell for every analytics visualization: hairline panel, a compact
 * header (eyebrow + title + description + actions) and a body slot. Keeps
 * chart headers, spacing and borders consistent across the dashboard.
 */
export function ChartCard({
  title,
  eyebrow,
  description,
  action,
  footer,
  children,
  headingId,
  className = "",
  bodyClassName = "p-4 pt-3 sm:p-5 sm:pt-4",
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  headingId?: string;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className={`flex flex-col overflow-hidden rounded-lg border border-line bg-surface/60 ${className}`}
    >
      <header className="flex flex-wrap items-start gap-x-3 gap-y-2 border-b border-line/70 px-4 py-3 sm:px-5">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              {eyebrow}
            </p>
          )}
          <h2
            id={headingId}
            className="truncate text-[13.5px] font-semibold tracking-tight text-fg"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-1 max-w-2xl text-[12px] leading-snug text-muted">
              {description}
            </p>
          )}
        </div>
        {action && <div className="ml-auto shrink-0">{action}</div>}
      </header>
      <div className={`flex-1 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className="border-t border-line/70 px-4 py-2.5 sm:px-5">{footer}</div>
      )}
    </section>
  );
}
