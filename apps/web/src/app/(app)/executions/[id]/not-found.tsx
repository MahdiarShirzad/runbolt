import Link from "next/link";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Panel } from "@/components/dashboard/Panel";

export default function ExecutionNotFound() {
  return (
    <div className="space-y-4 py-6">
      <Link
        href="/executions"
        className="inline-flex h-8 items-center rounded-md border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
      >
        Back to executions
      </Link>
      <Panel title="Execution" headingId="execution-not-found-heading">
        <EmptyState
          title="Execution not found"
          description="It may have been pruned from history, or the link is out of date."
          action={
            <Link
              href="/executions"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3.5 text-[13px] font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px"
            >
              Back to executions
            </Link>
          }
        />
      </Panel>
    </div>
  );
}
