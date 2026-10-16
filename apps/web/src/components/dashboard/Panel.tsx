import type { ReactNode } from "react";

/** Hairline panel used for every dashboard widget. */
export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
  headingId,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  headingId?: string;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className={`overflow-hidden rounded-lg border border-line bg-surface/60 ${className}`}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line/70 px-5 py-3.5">
          <div className="min-w-0">
            {title && (
              <h2
                id={headingId}
                className="truncate text-sm font-semibold tracking-tight text-fg"
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 truncate font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="ml-auto shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName || "p-5"}>{children}</div>
    </section>
  );
}
