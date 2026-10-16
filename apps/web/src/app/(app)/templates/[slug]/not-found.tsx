import Link from "next/link";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Panel } from "@/components/dashboard/Panel";

export default function TemplateNotFound() {
  return (
    <div className="space-y-4 py-6">
      <Link
        href="/templates"
        className="inline-flex h-8 items-center rounded-md border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
      >
        Back to templates
      </Link>
      <Panel title="Template" headingId="template-not-found-heading">
        <EmptyState
          title="Template not found"
          description="This template doesn't exist — the link may be out of date."
          action={
            <Link
              href="/templates"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3.5 text-[13px] font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px"
            >
              Browse templates
            </Link>
          }
        />
      </Panel>
    </div>
  );
}
