import Link from "next/link";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Panel } from "@/components/dashboard/Panel";

export default function IntegrationNotFound() {
  return (
    <div className="space-y-4 py-6">
      <Link
        href="/integrations"
        className="inline-flex h-8 items-center rounded-md border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
      >
        Back to integrations
      </Link>
      <Panel title="Integration" headingId="integration-not-found-heading">
        <EmptyState
          title="Integration not found"
          description="This catalog entry doesn't exist — the link may be out of date."
          action={
            <Link
              href="/integrations"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3.5 text-[13px] font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px"
            >
              Browse catalog
            </Link>
          }
        />
      </Panel>
    </div>
  );
}
