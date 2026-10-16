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

export function WorkflowsListSkeleton() {
  return (
    <Panel title="All workflows" subtitle="Loading" bodyClassName="p-0">
      <div className="border-b border-line/70 px-5 py-3" aria-hidden>
        <div className="flex items-center gap-2.5">
          <div className={`${shimmer} h-9 w-56`} />
          <div className={`${shimmer} h-9 w-40`} />
          <div className={`${shimmer} h-9 w-36`} />
        </div>
      </div>
      <div className="divide-y divide-line/50" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <div className="min-w-0 flex-1">
              <div className={`${shimmer} h-3 w-44`} />
              <div className={`${shimmer} mt-1.5 h-2.5 w-32`} />
            </div>
            <div className={`${shimmer} h-3 w-16`} />
            <div className={`${shimmer} hidden h-3 w-20 sm:block`} />
            <div className={`${shimmer} h-3 w-24`} />
            <div className={`${shimmer} h-8 w-20 rounded-md`} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function WorkflowsPageSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" aria-hidden>
        <div>
          <div className={`${shimmer} h-2.5 w-36`} />
          <div className={`${shimmer} mt-3 h-8 w-52`} />
          <div className={`${shimmer} mt-3 h-3 w-80 max-w-full`} />
        </div>
        <div className="flex gap-2.5">
          <div className={`${shimmer} h-9 w-36 rounded-md`} />
          <div className={`${shimmer} h-9 w-40 rounded-md`} />
        </div>
      </div>
      <MetricsSkeleton />
      <WorkflowsListSkeleton />
    </div>
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

export function ExecutionsPageSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-hidden>
      <MetricsSkeleton />
      <Panel title="Execution history" subtitle="Loading" bodyClassName="p-0">
        <div className="border-b border-line/70 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className={`${shimmer} h-9 w-56`} />
            <div className={`${shimmer} h-9 w-36`} />
            <div className={`${shimmer} h-9 w-40`} />
            <div className={`${shimmer} ml-auto h-9 w-28`} />
          </div>
        </div>
        <div className="divide-y divide-line/50">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <div className={`${shimmer} h-3 w-44`} />
                <div className={`${shimmer} mt-1.5 h-2.5 w-28`} />
              </div>
              <div className={`${shimmer} h-3 w-16`} />
              <div className={`${shimmer} hidden h-3 w-14 sm:block`} />
              <div className={`${shimmer} h-3 w-16`} />
              <div className={`${shimmer} h-7 w-20 rounded-md`} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function IntegrationsPageSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-hidden>
      <div>
        <div className={`${shimmer} h-2.5 w-32`} />
        <div className={`${shimmer} mt-3 h-8 w-44`} />
        <div className={`${shimmer} mt-3 h-3 w-96 max-w-full`} />
      </div>
      <div className={`${shimmer} h-9 w-56`} />
      <Panel title="Connection" subtitle="Loading">
        <div className="space-y-2.5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${shimmer} h-28 rounded-md`} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function IntegrationDetailSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-hidden>
      <div className={`${shimmer} h-8 w-40`} />
      <div className="flex items-start gap-4">
        <div className={`${shimmer} h-9 w-9 rounded-md`} />
        <div className="min-w-0 flex-1">
          <div className={`${shimmer} h-2.5 w-28`} />
          <div className={`${shimmer} mt-3 h-8 w-52`} />
          <div className={`${shimmer} mt-3 h-3 w-96 max-w-full`} />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="space-y-4">
          <Panel title="Capabilities" subtitle="Loading">
            <div className="space-y-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={`${shimmer} h-11 rounded-md`} />
              ))}
            </div>
          </Panel>
          <Panel title="Setup" subtitle="Loading">
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className={`${shimmer} h-4 rounded`} />
              ))}
            </div>
          </Panel>
        </div>
        <Panel title="Connection" subtitle="Loading">
          <div className={`${shimmer} h-52 rounded-md`} />
        </Panel>
      </div>
    </div>
  );
}

export function TemplatesPageSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-hidden>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className={`${shimmer} h-2.5 w-24`} />
          <div className={`${shimmer} mt-3 h-8 w-64`} />
          <div className={`${shimmer} mt-3 h-3 w-96 max-w-full`} />
        </div>
        <div className={`${shimmer} h-9 w-36`} />
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className={`${shimmer} h-9 w-56`} />
        <div className={`${shimmer} h-9 w-40`} />
        <div className={`${shimmer} h-9 w-36`} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`${shimmer} h-7 w-24 rounded-full`} />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`${shimmer} h-64 rounded-lg`} />
        ))}
      </div>
    </div>
  );
}

export function TemplateDetailSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-hidden>
      <div className={`${shimmer} h-8 w-40`} />
      <div>
        <div className={`${shimmer} h-2.5 w-32`} />
        <div className={`${shimmer} mt-3 h-8 w-72`} />
        <div className={`${shimmer} mt-3 h-3 w-96 max-w-full`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="space-y-4">
          <Panel title="What it automates" subtitle="Loading">
            <div className="space-y-2.5">
              <div className={`${shimmer} h-4 rounded`} />
              <div className={`${shimmer} h-4 w-3/4 rounded`} />
            </div>
          </Panel>
          <Panel title="Workflow preview" subtitle="Loading">
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={`${shimmer} h-12 rounded-md`} />
              ))}
            </div>
          </Panel>
        </div>
        <Panel title="Required integrations" subtitle="Loading">
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className={`${shimmer} h-11 rounded-md`} />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function WebhooksPageSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-hidden>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className={`${shimmer} h-2.5 w-28`} />
          <div className={`${shimmer} mt-3 h-8 w-40`} />
          <div className={`${shimmer} mt-3 h-3 w-96 max-w-full`} />
        </div>
        <div className={`${shimmer} h-9 w-48`} />
      </div>
      <MetricsSkeleton />
      <Panel title="Endpoints" subtitle="Loading" bodyClassName="p-0">
        <div className="border-b border-line/70 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className={`${shimmer} h-9 w-56`} />
            <div className={`${shimmer} h-9 w-36`} />
            <div className={`${shimmer} h-9 w-40`} />
            <div className={`${shimmer} h-9 w-36`} />
          </div>
        </div>
        <div className="divide-y divide-line/50">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <div className={`${shimmer} h-3 w-48`} />
                <div className={`${shimmer} mt-1.5 h-2.5 w-64`} />
              </div>
              <div className={`${shimmer} h-7 w-40 rounded-md`} />
              <div className={`${shimmer} h-3 w-16`} />
              <div className={`${shimmer} h-7 w-16 rounded-md`} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function WebhookDetailSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-hidden>
      <div className={`${shimmer} h-8 w-40`} />
      <div>
        <div className={`${shimmer} h-2.5 w-32`} />
        <div className={`${shimmer} mt-3 h-8 w-64`} />
        <div className={`${shimmer} mt-3 h-3 w-96 max-w-full`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="space-y-4">
          <Panel title="Delivery history" subtitle="Loading" bodyClassName="p-0">
            <div className="space-y-0">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className={`${shimmer} h-12 border-b border-line/40`} />
              ))}
            </div>
          </Panel>
          <Panel title="Request inspection" subtitle="Loading">
            <div className={`${shimmer} h-40 rounded-md`} />
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Endpoint" subtitle="Loading">
            <div className={`${shimmer} h-48 rounded-md`} />
          </Panel>
          <Panel title="Authentication" subtitle="Loading">
            <div className={`${shimmer} h-20 rounded-md`} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

export function ExecutionDetailSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-hidden>
      <div className={`${shimmer} h-8 w-40`} />
      <div>
        <div className={`${shimmer} h-2.5 w-24`} />
        <div className={`${shimmer} mt-3 h-8 w-64`} />
        <div className={`${shimmer} mt-3 h-3 w-80 max-w-full`} />
      </div>
      <MetricsSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Timeline" subtitle="Loading">
          <div className="space-y-2.5">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={`${shimmer} h-14 rounded-md`} />
            ))}
          </div>
        </Panel>
        <Panel title="Step inspector" subtitle="Loading">
          <div className={`${shimmer} h-40 rounded-md`} />
        </Panel>
      </div>
    </div>
  );
}

export function CredentialsPageSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-hidden>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className={`${shimmer} h-2.5 w-28`} />
          <div className={`${shimmer} mt-3 h-8 w-44`} />
          <div className={`${shimmer} mt-3 h-3 w-96 max-w-full`} />
        </div>
        <div className={`${shimmer} h-9 w-36 rounded-md`} />
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className={`${shimmer} h-9 w-56`} />
        <div className={`${shimmer} h-9 w-36`} />
        <div className={`${shimmer} h-9 w-40`} />
        <div className={`${shimmer} h-9 w-36`} />
        <div className={`${shimmer} ml-auto h-9 w-28`} />
      </div>
      <Panel title="Stored credentials" subtitle="Loading" bodyClassName="p-0">
        <div className="divide-y divide-line/50">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <div className={`${shimmer} h-3 w-44`} />
                <div className={`${shimmer} mt-1.5 h-2.5 w-64`} />
              </div>
              <div className={`${shimmer} h-4 w-20`} />
              <div className={`${shimmer} h-3 w-24`} />
              <div className={`${shimmer} h-3 w-16`} />
              <div className={`${shimmer} h-3 w-20`} />
              <div className={`${shimmer} h-7 w-20 rounded-md`} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function CredentialDetailSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-hidden>
      <div className={`${shimmer} h-8 w-40`} />
      <div>
        <div className={`${shimmer} h-2.5 w-32`} />
        <div className={`${shimmer} mt-3 h-8 w-64`} />
        <div className={`${shimmer} mt-3 h-3 w-96 max-w-full`} />
      </div>
      <Panel title="Overview" subtitle="Loading">
        <div className={`${shimmer} h-40 rounded-md`} />
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Security" subtitle="Loading">
          <div className={`${shimmer} h-24 rounded-md`} />
        </Panel>
        <Panel title="Usage" subtitle="Loading">
          <div className={`${shimmer} h-24 rounded-md`} />
        </Panel>
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-hidden>
      <div>
        <div className={`${shimmer} h-2.5 w-24`} />
        <div className={`${shimmer} mt-3 h-8 w-40`} />
        <div className={`${shimmer} mt-3 h-3 w-96 max-w-full`} />
      </div>
      <div className="flex gap-1 border-b border-line/70">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`${shimmer} h-9 w-24 shrink-0`} />
        ))}
      </div>
      <Panel title="Profile" subtitle="Loading">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`${shimmer} h-14 w-14 rounded-lg`} />
            <div className="min-w-0 flex-1">
              <div className={`${shimmer} h-3.5 w-40`} />
              <div className={`${shimmer} mt-2 h-3 w-56`} />
            </div>
          </div>
          <div className={`${shimmer} h-9 rounded-md`} />
          <div className={`${shimmer} h-9 rounded-md`} />
        </div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Preferences" subtitle="Loading">
          <div className={`${shimmer} h-44 rounded-md`} />
        </Panel>
        <Panel title="Notifications" subtitle="Loading">
          <div className={`${shimmer} h-44 rounded-md`} />
        </Panel>
      </div>
    </div>
  );
}
