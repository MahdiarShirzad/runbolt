import Link from "next/link";
import { PlusIcon } from "@/components/landing/icons";
import { primaryActionCls, secondaryActionCls } from "./actions";
import { SampleDataBadge } from "./SampleDataBadge";

export function WorkflowsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            Workflow library
          </p>
          <SampleDataBadge />
        </div>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
          Workflows
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Create, pause, duplicate, and inspect every automation in this
          workspace from one place.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2.5">
        <Link href="/templates" className={secondaryActionCls}>
          Explore templates
        </Link>
        <Link href="/workflows/new" className={primaryActionCls}>
          <PlusIcon width={13} height={13} aria-hidden />
          Create Workflow
        </Link>
      </div>
    </div>
  );
}
