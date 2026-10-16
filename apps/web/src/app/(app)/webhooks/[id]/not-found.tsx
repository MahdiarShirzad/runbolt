import Link from "next/link";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Panel } from "@/components/dashboard/Panel";

export default function WebhookNotFound() {
  return (
    <div className="space-y-4 py-6">
      <Link
        href="/webhooks"
        className="inline-flex h-8 items-center rounded-md border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
      >
        Back to webhooks
      </Link>
      <Panel title="Endpoint" headingId="webhook-not-found-heading">
        <EmptyState
          title="Endpoint not found"
          description="This webhook endpoint doesn't exist — the link may be out of date."
          action={
            <Link
              href="/webhooks"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3.5 text-[13px] font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px"
            >
              Back to webhooks
            </Link>
          }
        />
      </Panel>
    </div>
  );
}
