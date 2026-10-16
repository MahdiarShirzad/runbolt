import { SampleDataBadge } from "./SampleDataBadge";

export function ExecutionsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            Monitoring
          </p>
          <SampleDataBadge />
        </div>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
          Executions
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Every workflow run in one place — status, timing, and trigger — with
          step-level detail when something breaks.
        </p>
      </div>
    </div>
  );
}
