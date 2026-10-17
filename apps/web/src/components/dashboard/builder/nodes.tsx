"use client";

import type { ComponentType, SVGProps } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  BoltIcon,
  ClockIcon,
  CodeIcon,
  DbIcon,
  FilterIcon,
  GlobeIcon,
  NodeGraphIcon,
  RetryIcon,
  ShuffleIcon,
  WebhookIcon,
  ZapIcon,
} from "@/components/landing/icons";
import {
  CATEGORY_STYLES,
  configString,
  getInputHandle,
  getOutputHandles,
  type WorkflowNodeType,
} from "@/lib/dashboard/workflow-graph";
import type { GraphRunStatus } from "@/lib/dashboard/workflow-run";
import type { BuilderNode } from "./graph-flow";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const NODE_ICONS: Record<WorkflowNodeType, Icon> = {
  manual_trigger: BoltIcon,
  webhook_trigger: WebhookIcon,
  schedule_trigger: ClockIcon,
  api_trigger: GlobeIcon,
  http_request: GlobeIcon,
  integration_action: ZapIcon,
  action: NodeGraphIcon,
  data_mapping: ShuffleIcon,
  filter: FilterIcon,
  if_else: FilterIcon,
  switch: ShuffleIcon,
  loop: RetryIcon,
  delay: ClockIcon,
  log: CodeIcon,
};

void DbIcon;

const STATUS_LABELS: Record<GraphRunStatus, { label: string; cls: string }> = {
  success: { label: "Succeeded", cls: "text-ok" },
  failed: { label: "Failed", cls: "text-bad" },
  running: { label: "Running", cls: "text-volt" },
  queued: { label: "Queued", cls: "text-muted" },
  cancelled: { label: "Cancelled", cls: "text-muted" },
  skipped: { label: "Skipped", cls: "text-faint" },
};

function statusBorder(status: GraphRunStatus | undefined): string {
  switch (status) {
    case "failed":
      return "border-bad ring-1 ring-bad/30";
    case "running":
      return "border-volt ring-1 ring-volt/30";
    case "success":
      return "border-ok/50";
    case "skipped":
      return "border-line opacity-60";
    default:
      return "";
  }
}

function summaryFor(node: BuilderNode["data"]["node"]): string {
  switch (node.type) {
    case "http_request": {
      const method = configString(node, "method") || "GET";
      const url = configString(node, "url");
      return url ? `${method} ${url}` : `${method} — set a URL`;
    }
    case "integration_action": {
      const slug = configString(node, "integrationSlug");
      const op = configString(node, "operation");
      return op ? `${slug} · ${op}` : `${slug} — set an operation`;
    }
    case "webhook_trigger":
      return configString(node, "path") || "Set an endpoint path";
    case "schedule_trigger":
      return configString(node, "preset") || "Set a schedule";
    case "if_else":
    case "filter": {
      const operator = configString(node, "operator") || "equals";
      return `${configString(node, "left") || "value"} ${operator}`;
    }
    case "switch":
      return configString(node, "expression") || "Set an expression";
    case "delay":
      return `${configString(node, "duration") || "—"} ${configString(node, "unit") || ""}`.trim();
    case "log":
      return configString(node, "message") || "Log a message";
    case "manual_trigger":
      return "Started by hand";
    case "api_trigger":
      return "Started by your app";
    default:
      return node.description || "Configure this step";
  }
}

export function BuilderNodeCard({ data, selected }: NodeProps<BuilderNode>) {
  const { node, label, category, runStatus, hasIssue, executable, isTrigger } = data;
  const styles = CATEGORY_STYLES[category];
  const Icon = NODE_ICONS[node.type] ?? NodeGraphIcon;
  const outputHandles = getOutputHandles(node);
  const inputHandle = getInputHandle(node);
  const status = runStatus ? STATUS_LABELS[runStatus] : null;

  return (
    <div
      className={`relative w-[228px] rounded-lg border bg-surface px-3 py-2.5 text-left shadow-xl shadow-overlay/40 transition-colors ${
        statusBorder(runStatus) || styles.border
      } ${selected ? "ring-2 ring-primary ring-offset-1 ring-offset-ink" : ""} ${
        runStatus === "running" ? "pulse-primary" : ""
      }`}
    >
      {inputHandle && (
        <Handle
          id={inputHandle}
          type="target"
          position={Position.Left}
          className="!h-2.5 !w-2.5 !border-2 !border-ink !bg-line-strong"
        />
      )}

      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${styles.chip}`}
        >
          <Icon width={14} height={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-fg" title={label}>
            {label}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10.5px] text-faint" title={summaryFor(node)}>
            {summaryFor(node)}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        {isTrigger && (
          <span className="rounded border border-line bg-ink px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">
            trigger
          </span>
        )}
        {!executable && (
          <span className="rounded border border-warn/40 bg-warn/10 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-warn">
            soon
          </span>
        )}
        {hasIssue && (
          <span
            className="rounded border border-warn/40 bg-warn/10 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-warn"
            title="This node has a configuration issue."
          >
            check
          </span>
        )}
        {status && (
          <span className={`ml-auto font-mono text-[10px] ${status.cls}`}>{status.label}</span>
        )}
      </div>

      {outputHandles.map((handle, index) => (
        <div
          key={handle.id}
          className="pointer-events-none absolute right-0 flex items-center gap-1"
          style={{ top: `${((index + 1) / (outputHandles.length + 1)) * 100}%`, transform: "translateY(-50%)" }}
        >
          {outputHandles.length > 1 && (
            <span className="mr-1 rounded bg-ink/90 px-1 font-mono text-[9px] text-faint">
              {handle.label}
            </span>
          )}
          <Handle
            id={handle.id}
            type="source"
            position={Position.Right}
            style={{ position: "relative", right: 0, top: 0, transform: "none" }}
            className="!h-2.5 !w-2.5 !border-2 !border-ink !bg-line-strong"
          />
        </div>
      ))}
    </div>
  );
}

export const builderNodeTypes = { runbolt: BuilderNodeCard };
