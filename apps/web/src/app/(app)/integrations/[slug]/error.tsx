"use client";

import Link from "next/link";

export default function IntegrationDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
        Integration error
      </p>
      <h1 className="mt-3 font-display text-2xl font-semibold tracking-[-0.015em] text-fg">
        This integration didn&apos;t load.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        The integration details hit an unexpected error
        {error.digest ? ` (digest ${error.digest})` : ""}. Try again — if it
        persists, the API may be unreachable.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3.5 text-[13px] font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px"
        >
          Try again
        </button>
        <Link
          href="/integrations"
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-surface px-3.5 text-[13px] text-fg transition-colors duration-200 hover:border-line-strong hover:bg-hover"
        >
          Back to integrations
        </Link>
      </div>
    </div>
  );
}
