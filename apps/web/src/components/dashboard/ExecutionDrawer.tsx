"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { CloseIcon } from "@/components/landing/icons";
import { StatusBadge } from "./StatusBadge";
import type { ExecutionRow, ExecutionStepRow } from "./executions-view";

function StepTimeline({ steps }: { steps: ExecutionStepRow[] }) {
  const dotByStatus: Record<string, string> = {
    success: "bg-ok",
    failed: "bg-bad",
    running: "bg-volt blink",
    queued: "bg-state-queued",
    cancelled: "bg-state-cancelled",
  };
  const textByStatus: Record<string, string> = {
    success: "text-muted",
    failed: "text-bad",
    running: "text-volt",
    queued: "text-muted",
    cancelled: "text-muted",
  };

  return (
    <ol className="relative space-y-3.5 border-l border-line pl-5">
      {steps.map((step, index) => (
        <li key={`${step.name}-${index}`} className="relative">
          <span
            aria-hidden
            className={`absolute -left-[23px] top-1.5 h-2 w-2 rounded-full ring-2 ring-surface ${dotByStatus[step.status] ?? "bg-muted"}`}
          />
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-[12.5px] text-fg">{step.name}</p>
            <p className={`shrink-0 font-mono text-[11px] tabular-nums ${textByStatus[step.status] ?? "text-muted"}`}>
              {step.durationLabel}
            </p>
          </div>
          {step.detail && (
            <p className="mt-1 text-[11.5px] leading-relaxed text-bad/90">{step.detail}</p>
          )}
        </li>
      ))}
    </ol>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
        {label}
      </dt>
      <dd className="min-w-0 truncate text-right text-[12.5px] text-fg">{children}</dd>
    </div>
  );
}

export function ExecutionDrawer({
  execution,
  onClose,
}: {
  execution: ExecutionRow | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!execution) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [execution, onClose]);

  if (!execution) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="execution-drawer-title"
    >
      <div
        className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col border-l border-line bg-ink shadow-2xl">
        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight text-fg" id="execution-drawer-title">
              {execution.workflowName}
            </p>
            <div className="mt-1.5 flex items-center gap-3">
              <StatusBadge status={execution.status} />
              <span className="font-mono text-[11px] text-faint">{execution.id}</span>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close execution details"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-fg"
          >
            <CloseIcon width={15} height={15} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 scroll-slim">
          <dl className="divide-y divide-line/50">
            <MetaRow label="Execution ID">
              <span className="flex items-center gap-1">
                <span className="truncate font-mono">{execution.id}</span>
                <CopyButton text={execution.id} label="Copy execution ID" />
              </span>
            </MetaRow>
            <MetaRow label="Trigger">{execution.trigger}</MetaRow>
            <MetaRow label="Duration">
              <span className="font-mono tabular-nums">{execution.durationLabel}</span>
            </MetaRow>
            <MetaRow label="Started">
              <time dateTime={execution.startedAt} title={execution.startedAbsolute}>
                {execution.startedLabel}
              </time>
            </MetaRow>
            <MetaRow label="Finished">
              {execution.finishedAt ? (
                <time
                  dateTime={execution.finishedAt}
                  title={execution.finishedAbsolute ?? undefined}
                >
                  {execution.finishedLabel}
                </time>
              ) : (
                <span className="text-muted">—</span>
              )}
            </MetaRow>
          </dl>

          <p className="mt-5 pb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
            Steps · {execution.steps.length}
          </p>
          <StepTimeline steps={execution.steps} />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3.5">
          <Link
            href={`/executions/${execution.id}`}
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
          >
            Open execution
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md px-3.5 text-[13px] text-muted transition-colors hover:text-fg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
