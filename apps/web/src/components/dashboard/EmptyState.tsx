import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div
        aria-hidden
        className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-ink text-faint"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 15h4" />
        </svg>
      </div>
      <p className="mt-3.5 text-sm font-medium text-fg">{title}</p>
      <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
