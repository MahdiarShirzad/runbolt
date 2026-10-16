import type { ReactNode } from "react";

/** Empty placeholder shared by analytics panels. */
export function ChartEmpty({
  title,
  description,
  action,
  height = 220,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  height?: number;
}) {
  return (
    <div
      style={{ minHeight: height }}
      className="flex flex-col items-center justify-center px-6 py-8 text-center"
    >
      <span
        aria-hidden
        className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-ink text-faint"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="m7 14 3-3 3 2 5-6" />
        </svg>
      </span>
      <p className="mt-3 text-[13.5px] font-medium text-fg">{title}</p>
      <p className="mt-1 max-w-xs text-[12.5px] leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Inline error placeholder for a single panel. */
export function ChartError({
  title = "Couldn’t render this chart",
  description = "The data for this panel is unavailable right now.",
  height = 220,
}: {
  title?: string;
  description?: string;
  height?: number;
}) {
  return (
    <div
      style={{ minHeight: height }}
      className="flex flex-col items-center justify-center px-6 py-8 text-center"
    >
      <span
        aria-hidden
        className="flex h-9 w-9 items-center justify-center rounded-md border border-bad/30 bg-bad/10 text-bad"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      </span>
      <p className="mt-3 text-[13.5px] font-medium text-fg">{title}</p>
      <p className="mt-1 max-w-xs text-[12.5px] leading-relaxed text-muted">{description}</p>
    </div>
  );
}
