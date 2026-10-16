"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon } from "@/components/landing/icons";
import {
  currentTimestamp,
  formatAbsoluteTime,
  formatRelativeTime,
} from "@/lib/dashboard/format";
import {
  addCreatedWorkflow,
  loadLocalState,
  markMockDeleted,
  nextCopySlug,
  removeCreatedWorkflow,
  setMockStatusOverride,
  subscribeLocalWorkflows,
  updateCreatedWorkflow,
} from "@/lib/dashboard/local-workflows";
import type { LocalWorkflow } from "@/lib/dashboard/local-workflows";
import type { WorkflowStatus } from "@/lib/dashboard/types";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";
import { SampleDataBadge } from "./SampleDataBadge";
import { StatusBadge, TriggerBadge, WorkflowStatusBadge } from "./StatusBadge";
import { primaryActionCls, secondaryActionCls } from "./actions";
import type { WorkflowDetailData, WorkflowRunRow } from "./workflows-view";

type ResolvedView =
  | { kind: "pending" }
  | { kind: "missing" }
  | { kind: "mock"; status: WorkflowStatus }
  | {
      kind: "local";
      workflow: LocalWorkflow;
      updatedLabel: string;
      updatedAbsolute: string;
    };

const dangerActionCls =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-bad/40 px-3.5 text-[13px] text-bad transition-colors hover:bg-bad/10 active:translate-y-px";

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

export function WorkflowDetailView({
  mock,
  runs,
  paramSlug,
}: {
  mock: WorkflowDetailData | null;
  runs: WorkflowRunRow[];
  paramSlug: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<ResolvedView>(() =>
    mock ? { kind: "mock", status: mock.status } : { kind: "pending" },
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);

  // Resolve browser-local records: a created workflow unknown to the server
  // baseline, a locally deleted mock, or a status override on a mock.
  useEffect(() => {
    function resolve() {
      const state = loadLocalState();
      if (mock && state.deletedMockIds.includes(mock.id)) {
        setView({ kind: "missing" });
        return;
      }
      const local = state.created.find(
        (workflow) => workflow.slug === paramSlug || workflow.id === paramSlug,
      );
      if (local && !(mock && local.slug === mock.slug)) {
        setView({
          kind: "local",
          workflow: local,
          updatedLabel: formatRelativeTime(local.createdAt, currentTimestamp()),
          updatedAbsolute: formatAbsoluteTime(local.createdAt),
        });
        return;
      }
      if (mock) {
        setView({
          kind: "mock",
          status: state.statusOverrides[mock.id] ?? mock.status,
        });
        return;
      }
      setView({ kind: "missing" });
    }
    resolve();
    return subscribeLocalWorkflows(resolve);
  }, [mock, paramSlug]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const closeDelete = useCallback(() => setConfirmDelete(false), []);

  useEffect(() => {
    if (!confirmDelete) return;
    cancelDeleteRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDelete();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [confirmDelete, closeDelete]);

  if (view.kind === "pending") {
    return (
      <Panel title="Loading workflow" headingId="workflow-detail-heading">
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          <div className="h-4 w-48 animate-pulse rounded bg-hover" />
          <div className="h-3 w-72 animate-pulse rounded bg-hover" />
          <div className="h-3 w-56 animate-pulse rounded bg-hover" />
        </div>
      </Panel>
    );
  }

  if (view.kind === "missing") {
    return (
      <div className="space-y-4">
        <BackLink />
        <Panel title="Workflow" headingId="workflow-detail-heading">
          <EmptyState
            title="Workflow not found"
            description="It may have been deleted in this browser, or the link is out of date."
            action={
              <Link href="/workflows" className={primaryActionCls}>
                Back to workflows
              </Link>
            }
          />
        </Panel>
      </div>
    );
  }

  const isMock = view.kind === "mock";
  const name = isMock ? mock!.name : view.workflow.name;
  const slug = isMock ? mock!.slug : view.workflow.slug;
  const trigger = isMock ? mock!.trigger : view.workflow.trigger;
  const status = view.kind === "mock" ? view.status : view.workflow.status;
  const triggerDetail = isMock ? null : view.workflow.triggerDetail;
  const steps = isMock ? null : view.workflow.steps;
  const updatedAt = isMock ? mock!.updatedAt : view.workflow.createdAt;
  const updatedLabel = isMock ? mock!.updatedLabel : view.updatedLabel;
  const updatedAbsolute = isMock ? mock!.updatedAbsolute : view.updatedAbsolute;

  const toggleStatus = () => {
    const next: WorkflowStatus = status === "active" ? "paused" : "active";
    if (view.kind === "local") {
      updateCreatedWorkflow(view.workflow.id, { status: next });
    } else if (mock) {
      setMockStatusOverride(mock.id, next);
    }
    setNotice(
      `“${name}” ${next === "active" ? "activated" : "paused"} — saved in this browser.`,
    );
  };

  const duplicate = () => {
    const state = loadLocalState();
    const copySlug = nextCopySlug(slug, [
      ...state.created.map((workflow) => workflow.slug),
      slug,
    ]);
    const copy: LocalWorkflow = {
      id: `local_${copySlug}`,
      name: `${name} (copy)`,
      slug: copySlug,
      status: "paused",
      trigger,
      steps: steps ?? [],
      triggerDetail,
      createdAt: new Date(currentTimestamp()).toISOString(),
    };
    addCreatedWorkflow(copy);
    router.push(`/workflows/${copySlug}`);
  };

  const handleDelete = () => {
    if (view.kind === "local") {
      removeCreatedWorkflow(view.workflow.id);
    } else if (mock) {
      markMockDeleted(mock.id);
    }
    setConfirmDelete(false);
    router.push("/workflows");
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <BackLink />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
              Workflow
            </p>
            {isMock && <SampleDataBadge />}
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            {name}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
            <WorkflowStatusBadge status={status} />
            <TriggerBadge trigger={trigger} />
            <span className="font-mono text-[11px] text-faint">{slug}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2.5">
          <Link href="/executions" className={secondaryActionCls}>
            View executions
          </Link>
          <button type="button" onClick={toggleStatus} className={secondaryActionCls}>
            {status === "active" ? "Pause" : "Activate"}
          </button>
          <button type="button" onClick={duplicate} className={secondaryActionCls}>
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className={dangerActionCls}
          >
            Delete…
          </button>
        </div>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-md border border-line/70 bg-primary/[0.04] px-4 py-2.5 text-[12.5px] text-muted"
        >
          {notice}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetaCard label="Trigger">
          <TriggerBadge trigger={trigger} />
          {triggerDetail && (
            <p className="mt-1.5 text-[12.5px] text-muted">{triggerDetail}</p>
          )}
        </MetaCard>
        <MetaCard label="Runs (30d)">
          <span className="font-mono tabular-nums">
            {isMock ? mock!.runsLabel : "0"}
          </span>
        </MetaCard>
        <MetaCard label="Last run">
          {isMock && mock!.lastRunStatus ? (
            <span className="flex flex-wrap items-center gap-2">
              <StatusBadge status={mock!.lastRunStatus} />
              <span className="text-muted">{mock!.lastRunLabel}</span>
            </span>
          ) : (
            <span className="text-muted">Never run</span>
          )}
        </MetaCard>
        <MetaCard label="Updated">
          <time dateTime={updatedAt} title={updatedAbsolute}>
            {updatedLabel}
          </time>
        </MetaCard>
      </div>

      {steps && (
        <Panel
          title="Steps"
          subtitle={`${steps.length} step${steps.length === 1 ? "" : "s"}`}
          headingId="workflow-steps-heading"
        >
          {steps.length === 0 ? (
            <EmptyState
              title="No steps recorded"
              description="This workflow does not have any steps yet."
            />
          ) : (
            <ol className="space-y-2">
              {steps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 rounded-md border border-line bg-ink px-3.5 py-2.5"
                >
                  <span className="font-mono text-[11px] text-faint">{index + 1}</span>
                  <span className="min-w-0 truncate text-[13.5px] text-fg">{step}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      )}

      <Panel
        title="Recent runs"
        subtitle="This workflow"
        headingId="workflow-runs-heading"
        bodyClassName={runs.length > 0 ? "p-0" : undefined}
      >
        {runs.length === 0 ? (
          <EmptyState
            title="No runs yet"
            description="Runs appear here after this workflow is triggered for the first time."
            action={
              <Link href="/executions" className={secondaryActionCls}>
                View all executions
              </Link>
            }
          />
        ) : (
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line/70">
                <th scope="col" className="px-5 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                  Run
                </th>
                <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                  Status
                </th>
                <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                  Trigger
                </th>
                <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                  Started
                </th>
                <th scope="col" className="px-5 py-2.5 text-right font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.id}
                  className="border-b border-line/40 transition-colors last:border-b-0 hover:bg-hover/40"
                >
                  <td className="px-5 py-3 font-mono text-[12px] text-muted">
                    {run.id}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="px-4 py-3">
                    <TriggerBadge trigger={run.trigger} />
                  </td>
                  <td className="px-4 py-3">
                    <time
                      dateTime={run.startedAt}
                      title={run.startedAbsolute}
                      className="text-[13px] text-muted"
                    >
                      {run.startedLabel}
                    </time>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-[12.5px] tabular-nums text-muted">
                    {run.durationLabel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-workflow-title"
          aria-describedby="delete-workflow-description"
        >
          <div
            className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
            onClick={closeDelete}
            aria-hidden
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface shadow-2xl shadow-overlay/40">
            <div className="px-5 py-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
                Delete workflow
              </p>
              <h2
                id="delete-workflow-title"
                className="mt-2 font-display text-lg font-semibold tracking-[-0.01em] text-fg"
              >
                {name}
              </h2>
              <p className="mt-1 font-mono text-[11px] text-faint">{slug}</p>
              <p
                id="delete-workflow-description"
                className="mt-2.5 text-[13px] leading-relaxed text-muted"
              >
                This removes the workflow from the list. Already recorded
                executions are not affected. The change is stored in this
                browser.
              </p>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-line/70 px-5 py-3.5">
              <button
                ref={cancelDeleteRef}
                type="button"
                onClick={closeDelete}
                className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex h-9 items-center justify-center rounded-md bg-bad px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-bad/90 active:translate-y-px"
              >
                Delete workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/workflows"
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
    >
      <ArrowLeftIcon width={13} height={13} aria-hidden />
      Back to workflows
    </Link>
  );
}
