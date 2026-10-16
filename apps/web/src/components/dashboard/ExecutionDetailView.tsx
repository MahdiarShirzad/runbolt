"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { ArrowLeftIcon, RetryIcon } from "@/components/landing/icons";
import { formatCount } from "@/lib/dashboard/format";
import { EmptyState } from "./EmptyState";
import { ExecutionLogsViewer } from "./ExecutionLogsViewer";
import { JsonBlock } from "./JsonBlock";
import { Panel } from "./Panel";
import { StatusBadge, TriggerBadge } from "./StatusBadge";
import { secondaryActionCls } from "./actions";
import {
  EXECUTIONS_LIST_QUERY_KEY,
} from "./executions-view";
import type { ExecutionDetailData, ExecutionLogRow, ExecutionStepDetailRow } from "./executions-view";

type TabId = "overview" | "logs";

const stepDotCls: Record<string, string> = {
  success: "bg-ok",
  failed: "bg-bad",
  running: "bg-volt blink",
  queued: "bg-state-queued",
  cancelled: "bg-state-cancelled",
};

function MetaCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface/60 px-4 py-3.5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      <div className="mt-2 text-[13.5px] text-fg">{children}</div>
    </div>
  );
}

function BackToExecutions() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        const stored = window.sessionStorage.getItem(EXECUTIONS_LIST_QUERY_KEY);
        router.push(`/executions${stored ?? ""}`);
      }}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
    >
      <ArrowLeftIcon width={13} height={13} aria-hidden />
      Back to executions
    </button>
  );
}

function Timeline({
  steps,
  selectedIndex,
  onSelect,
}: {
  steps: ExecutionStepDetailRow[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const listRef = useRef<HTMLOListElement>(null);

  const onKeyDown = (event: React.KeyboardEvent<HTMLOListElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>("[data-step-button]") ?? [],
    );
    if (buttons.length === 0) return;
    event.preventDefault();
    const current = buttons.indexOf(document.activeElement as HTMLElement);
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const next = current < 0 ? 0 : (current + delta + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };

  return (
    <ol ref={listRef} onKeyDown={onKeyDown} className="space-y-2">
      {steps.map((step, index) => {
        const selected = index === selectedIndex;
        return (
          <li key={`${step.name}-${index}`}>
            <button
              type="button"
              data-step-button
              onClick={() => onSelect(index)}
              aria-pressed={selected}
              className={`flex w-full items-start gap-3 rounded-md border px-3.5 py-3 text-left transition-colors ${
                selected
                  ? "border-primary bg-primary/[0.05]"
                  : "border-line bg-ink hover:border-line-strong"
              } ${step.status === "failed" && !selected ? "border-bad/50" : ""}`}
            >
              <span
                aria-hidden
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${stepDotCls[step.status] ?? "bg-muted"}`}
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="font-mono text-[12.5px] text-fg">
                    {step.index + 1}. {step.name}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted">
                    {step.durationLabel}
                  </span>
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-2">
                  <StatusBadge status={step.status} />
                  {step.startedClock && (
                    <span className="font-mono text-[11px] text-faint">
                      started {step.startedClock}
                    </span>
                  )}
                </span>
                {step.detail && (
                  <span className="mt-1.5 block text-[11.5px] leading-relaxed text-bad/90">
                    {step.detail}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function StepInspector({ step }: { step: ExecutionStepDetailRow | null }) {
  if (!step) {
    return (
      <EmptyState
        title="Select a step"
        description="Pick a step in the timeline to inspect its status, timing, and captured data."
      />
    );
  }

  const payload = {
    index: step.index,
    name: step.name,
    status: step.status,
    startedAt: step.startedAt,
    durationMs: step.durationMs,
    ...(step.detail ? { error: step.detail } : {}),
  };

  return (
    <div className="space-y-4">
      <div>
        <StatusBadge status={step.status} />
        <p className="mt-2 font-mono text-[13.5px] text-fg">{step.name}</p>
      </div>

      <dl className="divide-y divide-line/50 rounded-md border border-line bg-ink px-3.5">
        <div className="flex items-center justify-between gap-3 py-2">
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
            Step
          </dt>
          <dd className="font-mono text-[12px] tabular-nums text-fg">
            {step.index + 1}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 py-2">
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
            Started
          </dt>
          <dd className="text-[12.5px] text-fg">
            {step.startedAt ? (
              <time dateTime={step.startedAt} title={step.startedAbsolute ?? undefined}>
                {step.startedClock}
              </time>
            ) : (
              <span className="text-muted">—</span>
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 py-2">
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
            Duration
          </dt>
          <dd className="font-mono text-[12px] tabular-nums text-fg">
            {step.durationLabel}
          </dd>
        </div>
      </dl>

      {step.detail && (
        <div className="rounded-md border border-bad/30 bg-bad/[0.06] px-3.5 py-3">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-bad">
            Error
          </p>
          <p className="mt-1.5 break-words text-[12.5px] leading-relaxed text-bad/90">
            {step.detail}
          </p>
        </div>
      )}

      <div>
        <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
          Step data
        </p>
        <JsonBlock value={payload} label={`step-${step.index + 1}.json`} />
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-faint">
          Input and output payloads are not captured by the API yet — only the
          recorded step metadata is shown.
        </p>
      </div>
    </div>
  );
}

export function ExecutionDetailView({
  detail,
  logs,
}: {
  detail: ExecutionDetailData;
  logs: ExecutionLogRow[];
}) {
  const router = useRouter();
  const failedStepIndex = detail.steps.findIndex((step) => step.status === "failed");
  const [tab, setTab] = useState<TabId>("overview");
  const [selectedStep, setSelectedStep] = useState(
    failedStepIndex >= 0 ? failedStepIndex : 0,
  );

  const onTabsKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      setTab((prev) => (prev === "overview" ? "logs" : "overview"));
    },
    [],
  );

  const stepsSucceeded = detail.counts.success;
  const step = detail.steps[selectedStep] ?? null;

  return (
    <div className="space-y-4 lg:space-y-5">
      <BackToExecutions />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            Execution
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            {detail.workflowName}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <StatusBadge status={detail.status} />
            <TriggerBadge trigger={detail.trigger} />
            <span className="flex items-center gap-1">
              <span className="font-mono text-[11px] text-faint">{detail.id}</span>
              <CopyButton text={detail.id} label="Copy execution ID" />
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2.5">
          <Link href={`/workflows/${detail.workflowId}`} className={secondaryActionCls}>
            Open workflow
          </Link>
          <button
            type="button"
            onClick={() => router.refresh()}
            className={secondaryActionCls}
          >
            <RetryIcon width={13} height={13} aria-hidden />
            Refresh
          </button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Execution sections"
        onKeyDown={onTabsKeyDown}
        className="flex gap-1 border-b border-line/70"
      >
        {(
          [
            { id: "overview" as TabId, label: "Overview" },
            { id: "logs" as TabId, label: `Logs (${logs.length})` },
          ]
        ).map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`execution-tab-${item.id}`}
              aria-selected={active}
              aria-controls={`execution-panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`-mb-px border-b-2 px-3.5 py-2.5 text-[13px] transition-colors ${
                active
                  ? "border-primary font-medium text-fg"
                  : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" ? (
        <div
          role="tabpanel"
          id="execution-panel-overview"
          aria-labelledby="execution-tab-overview"
          className="space-y-4 lg:space-y-5"
        >
          {detail.status === "failed" && detail.errorStepName && (
            <div className="rounded-lg border border-bad/30 bg-bad/[0.06] px-4 py-3.5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-bad">
                Failed at step
              </p>
              <p className="mt-1.5 font-mono text-[13px] text-fg">
                {detail.errorStepName}
              </p>
              <p className="mt-1 break-words text-[13px] leading-relaxed text-bad/90">
                {detail.errorMessage}
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">
                This is the error recorded by the step — select it in the
                timeline below to inspect the full context.
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetaCard label="Result">
              <StatusBadge status={detail.status} />
            </MetaCard>
            <MetaCard label="Started">
              <time dateTime={detail.startedAt} title={detail.startedAbsolute}>
                {detail.startedLabel}
              </time>
              <p className="mt-0.5 font-mono text-[11px] text-faint">
                {detail.startedAbsolute}
              </p>
            </MetaCard>
            <MetaCard label="Finished">
              {detail.finishedAt ? (
                <>
                  <time dateTime={detail.finishedAt} title={detail.finishedAbsolute ?? undefined}>
                    {detail.finishedLabel}
                  </time>
                  <p className="mt-0.5 font-mono text-[11px] text-faint">
                    {detail.finishedAbsolute}
                  </p>
                </>
              ) : (
                <span className="text-muted">Not finished yet</span>
              )}
            </MetaCard>
            <MetaCard label="Duration">
              <span className="font-mono tabular-nums">{detail.durationLabel}</span>
            </MetaCard>
          </div>

          <div className="rounded-lg border border-line bg-surface/60 px-4 py-3.5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
              Steps
            </p>
            <p className="mt-2 text-[13.5px] text-fg">
              <span className="font-mono tabular-nums">{stepsSucceeded}</span> of{" "}
              <span className="font-mono tabular-nums">{detail.counts.total}</span>{" "}
              succeeded
              {detail.counts.failed > 0 && (
                <>
                  {" · "}
                  <span className="font-mono tabular-nums text-bad">
                    {detail.counts.failed}
                  </span>{" "}
                  failed
                </>
              )}
              {detail.counts.running > 0 && (
                <>
                  {" · "}
                  <span className="font-mono tabular-nums text-volt">
                    {detail.counts.running}
                  </span>{" "}
                  running
                </>
              )}
              {detail.counts.cancelled > 0 && (
                <>
                  {" · "}
                  <span className="font-mono tabular-nums text-muted">
                    {detail.counts.cancelled}
                  </span>{" "}
                  cancelled
                </>
              )}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Panel
              title="Timeline"
              subtitle={`Execution order · ${formatCount(detail.counts.total)} steps`}
              headingId="execution-timeline-heading"
            >
              <Timeline
                steps={detail.steps}
                selectedIndex={selectedStep}
                onSelect={setSelectedStep}
              />
            </Panel>
            <div className="self-start xl:sticky xl:top-4">
              <Panel
                title="Step inspector"
                subtitle={step ? step.name : "No step selected"}
                headingId="execution-inspector-heading"
              >
                <StepInspector step={step} />
              </Panel>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="tabpanel"
          id="execution-panel-logs"
          aria-labelledby="execution-tab-logs"
        >
          <Panel
            title="Logs"
            subtitle={`Sample log stream · ${formatCount(logs.length)} lines`}
            headingId="execution-logs-heading"
            bodyClassName="p-0"
          >
            <ExecutionLogsViewer logs={logs} />
          </Panel>
        </div>
      )}
    </div>
  );
}
