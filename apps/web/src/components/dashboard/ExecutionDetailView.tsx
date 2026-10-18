"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { ArrowLeftIcon, RetryIcon } from "@/components/landing/icons";
import { hashString } from "@/lib/dashboard/random";
import { formatDuration } from "@/lib/dashboard/format";
import { runWorkflowGraph, type GraphRunStatus } from "@/lib/dashboard/workflow-run";
import type { NodeExecution } from "@/lib/dashboard/execution-debug";
import { ExecutionLogsViewer } from "./ExecutionLogsViewer";
import { Panel } from "./Panel";
import { SampleDataBadge } from "./SampleDataBadge";
import { StatusBadge, TriggerBadge } from "./StatusBadge";
import { primaryActionCls, secondaryActionCls } from "./actions";
import { EXECUTIONS_LIST_QUERY_KEY } from "./executions-view";
import type { ExecutionDebugData, ExecutionLogRow } from "./executions-view";
import { ErrorPanel } from "./executions/ErrorPanel";
import { ExecutionGraph } from "./executions/ExecutionGraph";
import { ExecutionSummary } from "./executions/ExecutionSummary";
import { ExecutionTimeline } from "./executions/ExecutionTimeline";
import { NodeInspector } from "./executions/NodeInspector";
import { NodeStatusBadge } from "./executions/NodeStatusBadge";
import { ReplayDialog } from "./executions/ReplayDialog";

interface SimulatedRun {
  runId: string;
  statuses: Record<string, GraphRunStatus>;
  details: Record<string, string>;
  counts: { success: number; failed: number; skipped: number; running: number };
  durationMs: number | null;
}

function nodeDetail(node: NodeExecution): string {
  switch (node.status) {
    case "running":
      return "running…";
    case "failed":
      return "failed";
    case "skipped":
      return "skipped";
    case "pending":
      return "not executed";
    default:
      return formatDuration(node.durationMs);
  }
}

function MetaCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface/60 px-4 py-3.5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">{label}</p>
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

/**
 * Execution debugger.
 *
 * Renders one execution as three linked surfaces — the status-annotated graph,
 * the node inspector, and the timeline/logs — all fed from the same node-run
 * projections so they always agree. Replay is a clearly labelled local
 * simulation and never claims a real run occurred.
 */
export function ExecutionDetailView({
  data,
  logs,
}: {
  data: ExecutionDebugData;
  logs: ExecutionLogRow[];
}) {
  const router = useRouter();
  const graphRef = useRef<HTMLDivElement>(null);
  const { debug } = data;
  const defaultSelected =
    debug.failedNode?.nodeId ?? debug.nodes[0]?.nodeId ?? null;

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(defaultSelected);
  const [focus, setFocus] = useState<{ id: string | null; nonce: number }>({
    id: null,
    nonce: 0,
  });
  const [replayOpen, setReplayOpen] = useState(false);
  const [simulated, setSimulated] = useState<SimulatedRun | null>(null);

  const recordedStatuses = useMemo(
    () => Object.fromEntries(debug.nodes.map((node) => [node.nodeId, node.status])),
    [debug],
  );
  const recordedDetails = useMemo(
    () => Object.fromEntries(debug.nodes.map((node) => [node.nodeId, nodeDetail(node)])),
    [debug],
  );

  const statuses = simulated?.statuses ?? recordedStatuses;
  const details = simulated?.details ?? recordedDetails;
  const selectedNode = debug.nodes.find((node) => node.nodeId === selectedNodeId) ?? null;

  const nodeLogs = useMemo(
    () => logs.filter((entry) => entry.nodeId === selectedNodeId),
    [logs, selectedNodeId],
  );
  const nodeOptions = useMemo(
    () => debug.nodes.map((node) => ({ value: node.nodeId, label: node.name })),
    [debug],
  );

  function focusNode(id: string | null, scroll = false) {
    if (!id) return;
    setSelectedNodeId(id);
    setFocus((prev) => ({ id, nonce: prev.nonce + 1 }));
    if (scroll) {
      graphRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function confirmReplay() {
    const result = runWorkflowGraph(debug.graph, {
      seed: hashString(`${data.id}:replay`),
    });
    const simStatuses: Record<string, GraphRunStatus> = {};
    const simDetails: Record<string, string> = {};
    for (const step of result.steps) {
      simStatuses[step.nodeId] = step.status;
      simDetails[step.nodeId] =
        step.durationMs == null ? "" : formatDuration(step.durationMs);
    }
    setSimulated({
      runId: `replay_${hashString(data.id).toString(16)}`,
      statuses: simStatuses,
      details: simDetails,
      counts: { ...result.counts },
      durationMs: result.durationMs,
    });
    setReplayOpen(false);
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <BackToExecutions />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
              Execution
            </p>
            <SampleDataBadge />
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            {data.workflowName}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <StatusBadge status={data.status} />
            <TriggerBadge trigger={data.trigger} />
            {data.attempt > 1 && (
              <span className="rounded border border-warn/40 bg-warn/10 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-warn">
                retry attempt {data.attempt}
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="font-mono text-[11px] text-faint">{data.id}</span>
              <CopyButton text={data.id} label="Copy execution ID" />
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2.5">
          <button type="button" onClick={() => focusNode(defaultSelected, true)} className={secondaryActionCls}>
            Inspect execution
          </button>
          <CopyButton
            text={data.id}
            label="Copy execution ID"
            className="h-9 rounded-md border border-line px-3"
          />
          <button type="button" onClick={() => setReplayOpen(true)} className={primaryActionCls}>
            <RetryIcon width={13} height={13} aria-hidden />
            Simulate replay
          </button>
          {data.workflowHref ? (
            <Link href={data.workflowHref} className={secondaryActionCls}>
              Open workflow
            </Link>
          ) : (
            <button
              type="button"
              disabled
              title="No matching workflow exists in the local dataset."
              className={`${secondaryActionCls} cursor-not-allowed opacity-50`}
            >
              Open workflow
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetaCard label="Started">
          <time dateTime={data.startedAt} title={data.startedAbsolute}>
            {data.startedLabel}
          </time>
          <p className="mt-0.5 font-mono text-[11px] text-faint">{data.startedAbsolute}</p>
        </MetaCard>
        <MetaCard label="Finished">
          {data.finishedAt ? (
            <>
              <time dateTime={data.finishedAt} title={data.finishedAbsolute ?? undefined}>
                {data.finishedLabel}
              </time>
              <p className="mt-0.5 font-mono text-[11px] text-faint">
                {data.finishedAbsolute}
              </p>
            </>
          ) : (
            <span className="text-muted">Not finished yet</span>
          )}
        </MetaCard>
        <MetaCard label="Total duration">
          <span className="font-mono tabular-nums">{data.durationLabel}</span>
        </MetaCard>
        <MetaCard label="Failed node">
          {debug.failedNode ? (
            <span className="flex items-center gap-2">
              <span className="truncate text-bad">{debug.failedNode.name}</span>
              <NodeStatusBadge status="failed" />
            </span>
          ) : (
            <span className="text-muted">None</span>
          )}
        </MetaCard>
      </div>

      {simulated && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-volt/40 bg-volt/[0.08] px-4 py-3">
          <span className="rounded border border-volt/50 bg-volt/15 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-volt">
            simulated
          </span>
          <p className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-volt/90">
            Simulated replay <span className="font-mono">{simulated.runId}</span> ·{" "}
            {simulated.counts.success} succeeded, {simulated.counts.failed} failed,{" "}
            {simulated.counts.skipped} skipped · {simulated.durationMs == null ? "—" : formatDuration(simulated.durationMs)}.
            Demo only — no workflow was executed and no run was saved.
          </p>
          <button
            type="button"
            onClick={() => setSimulated(null)}
            className="rounded-md border border-volt/40 px-2.5 py-1 text-[11.5px] text-volt transition-colors hover:bg-volt/10"
          >
            Clear
          </button>
        </div>
      )}

      <ExecutionSummary
        status={data.status}
        counts={debug.counts}
        durationMs={data.durationMs}
        failedNode={debug.failedNode}
        errorSummary={debug.errorSummary}
      />

      <Panel
        title="Error inspector"
        subtitle={
          debug.failedNode
            ? `Failed at ${debug.failedNode.name}`
            : "No failures recorded"
        }
        headingId="execution-error-heading"
      >
        <ErrorPanel failedNode={debug.failedNode} />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div ref={graphRef} className="scroll-mt-4">
          <Panel
            title="Execution graph"
            subtitle={`${debug.counts.total} nodes · select a node to inspect`}
            headingId="execution-graph-heading"
            bodyClassName="p-0"
          >
            <ExecutionGraph
              graph={debug.graph}
              statuses={statuses}
              details={details}
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => setSelectedNodeId(id)}
              focusNodeId={focus.id}
              focusNonce={focus.nonce}
              className="h-[440px]"
            />
          </Panel>
        </div>

        <Panel
          title="Node inspector"
          subtitle={selectedNode ? selectedNode.name : "No node selected"}
          headingId="execution-node-heading"
          className="xl:sticky xl:top-4"
          bodyClassName="p-0"
        >
          <div className="h-[492px]">
            <NodeInspector node={selectedNode} logs={nodeLogs} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="Timeline"
          subtitle={`Execution order · ${debug.nodes.length} nodes`}
          headingId="execution-timeline-heading"
        >
          <ExecutionTimeline
            nodes={debug.nodes}
            selectedNodeId={selectedNodeId}
            onSelect={(id) => focusNode(id)}
          />
        </Panel>

        <Panel
          title="Logs"
          subtitle={`Sample log stream · ${logs.length} lines`}
          headingId="execution-logs-heading"
          bodyClassName="p-0"
        >
          <ExecutionLogsViewer logs={logs} nodeOptions={nodeOptions} />
        </Panel>
      </div>

      <ReplayDialog
        open={replayOpen}
        onClose={() => setReplayOpen(false)}
        onConfirm={confirmReplay}
      />

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-[11.5px] text-faint">
          Execution data is deterministic sample data — a placeholder until the
          Runbolt API is connected.
        </p>
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
  );
}
