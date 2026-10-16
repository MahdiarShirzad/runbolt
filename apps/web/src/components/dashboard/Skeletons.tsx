import { Panel } from "./Panel";

const shimmer = "animate-pulse rounded bg-raised";

export function MetricsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-line bg-surface/60 px-4 py-3.5">
          <div className={`${shimmer} h-2.5 w-24`} />
          <div className={`${shimmer} mt-3.5 h-7 w-16`} />
          <div className={`${shimmer} mt-3 h-2.5 w-32`} />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Panel title="Execution activity" subtitle="Loading" bodyClassName="p-5 pt-4">
      <div className="flex h-48 items-end gap-[3px] pl-10 sm:h-52" aria-hidden>
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            className={`${shimmer} flex-1`}
            style={{ height: `${30 + ((i * 37) % 55)}%` }}
          />
        ))}
      </div>
    </Panel>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Panel title="Recent executions" subtitle="Loading" bodyClassName="p-0">
      <div className="divide-y divide-line/50" aria-hidden>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <div className="min-w-0 flex-1">
              <div className={`${shimmer} h-3 w-40`} />
              <div className={`${shimmer} mt-1.5 h-2.5 w-24`} />
            </div>
            <div className={`${shimmer} h-3 w-16`} />
            <div className={`${shimmer} hidden h-3 w-14 sm:block`} />
            <div className={`${shimmer} h-7 w-16 rounded-md`} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function WorkflowsSkeleton() {
  return (
    <Panel title="Workflows" subtitle="Loading" bodyClassName="p-0">
      <div className="divide-y divide-line/50" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <div className="min-w-0 flex-1">
              <div className={`${shimmer} h-3 w-36`} />
              <div className={`${shimmer} mt-1.5 h-2.5 w-28`} />
            </div>
            <div className={`${shimmer} h-3 w-14`} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function WelcomeHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" aria-hidden>
      <div>
        <div className={`${shimmer} h-2.5 w-40`} />
        <div className={`${shimmer} mt-3 h-8 w-64`} />
        <div className={`${shimmer} mt-3 h-3 w-80 max-w-full`} />
      </div>
      <div className="flex gap-2.5">
        <div className={`${shimmer} h-9 w-32 rounded-md`} />
        <div className={`${shimmer} h-9 w-36 rounded-md`} />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5">
      <WelcomeHeaderSkeleton />
      <MetricsSkeleton />
      <ChartSkeleton />
      <TableSkeleton />
      <WorkflowsSkeleton />
    </div>
  );
}
