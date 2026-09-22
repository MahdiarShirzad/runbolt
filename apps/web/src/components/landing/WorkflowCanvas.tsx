import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { CheckIcon, DbIcon, FilterIcon, GlobeIcon, ShuffleIcon, WebhookIcon, WorkerIcon } from "./icons";

type Status = "success" | "running" | "skipped";

type GraphNode = {
  id: string;
  label: string;
  sub: string;
  kind: "webhook" | "http" | "condition" | "db" | "transform" | "worker";
  icon: ReactNode;
  x: number; // viewBox coords (0..1100)
  y: number; // viewBox coords (0..480)
  status: Status;
};

const kindColor = {
  webhook: "text-warn",
  http: "text-info",
  condition: "text-accent",
  db: "text-ok",
  transform: "text-highlight",
  worker: "text-primary",
} as const;

const nodes: GraphNode[] = [
  { id: "hook_in", label: "Webhook", sub: "trigger · /hooks/orders", kind: "webhook", icon: <WebhookIcon width={14} height={14} />, x: 95, y: 240, status: "success" },
  { id: "check_order", label: "Condition", sub: "premium === true", kind: "condition", icon: <FilterIcon width={14} height={14} />, x: 295, y: 240, status: "success" },
  { id: "charge_api", label: "HTTP Request", sub: "POST stripe.com/v1", kind: "http", icon: <GlobeIcon width={14} height={14} />, x: 505, y: 130, status: "success" },
  { id: "enrich", label: "Transform", sub: "shape response", kind: "transform", icon: <ShuffleIcon width={14} height={14} />, x: 505, y: 350, status: "skipped" },
  { id: "persist", label: "Database", sub: "orders · upsert", kind: "db", icon: <DbIcon width={14} height={14} />, x: 720, y: 130, status: "success" },
  { id: "fulfill", label: "Worker", sub: "queue: fulfillment", kind: "worker", icon: <WorkerIcon width={14} height={14} />, x: 925, y: 240, status: "running" },
];

const edges = [
  { d: "M95 240 H295", delay: "0s" },
  { d: "M295 240 C360 240 420 130 505 130", delay: "0.6s" },
  { d: "M295 240 C360 240 420 350 505 350", delay: "0.6s", dim: true },
  { d: "M505 130 H720", delay: "1.2s" },
  { d: "M720 130 C800 130 850 240 925 240", delay: "1.8s" },
  { d: "M505 350 C650 350 790 240 925 240", delay: "1.8s", dim: true },
  { d: "M925 240 H1035", delay: "2.4s" },
];

function StatusBadge({ status }: { status: Status }) {
  if (status === "success") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-ok/12 px-1.5 py-0.5 font-mono text-[9px] text-ok">
        <CheckIcon width={8} height={8} />
        ok
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] text-primary">
        <span className="blink h-1 w-1 rounded-full bg-primary" aria-hidden />
        running
      </span>
    );
  }
  return (
    <span className="rounded-full bg-raised px-1.5 py-0.5 font-mono text-[9px] text-muted">
      skipped
    </span>
  );
}

function NodeCard({ node, pulse }: { node: GraphNode; pulse?: boolean }) {
  const skipped = node.status === "skipped";
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border bg-surface/95 px-3 py-2.5 backdrop-blur-sm ${
        pulse ? "border-primary/60 pulse-primary" : ""
      } ${skipped ? "border-dashed border-line opacity-65" : "border-line"}`}
    >
      <span className={kindColor[node.kind]}>{node.icon}</span>
      <span className="leading-tight">
        <span className="block whitespace-nowrap text-xs font-medium text-fg">
          {node.label}
        </span>
        <span className="block whitespace-nowrap font-mono text-[9.5px] text-muted">
          {node.sub}
        </span>
      </span>
      <StatusBadge status={node.status} />
    </div>
  );
}

function DesktopGraph() {
  return (
    <div className="relative hidden aspect-[1100/480] md:block">
      <div className="bg-grid mask-fade-radial absolute inset-0" aria-hidden />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1100 480"
        preserveAspectRatio="none"
        aria-hidden
      >
        {edges.map((edge) => (
          <g key={edge.d}>
            <path
              d={edge.d}
              fill="none"
              stroke="#26304A"
              strokeWidth={1.5}
              strokeDasharray={edge.dim ? "5 5" : undefined}
              vectorEffect="non-scaling-stroke"
            />
            {!edge.dim && (
              <path
                d={edge.d}
                fill="none"
                stroke="#4CC9F0"
                strokeWidth={1.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="edge-flow"
                style={{ "--edge-delay": edge.delay } as React.CSSProperties}
              />
            )}
          </g>
        ))}
      </svg>

      {/* Branch labels */}
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded border border-line bg-active px-1.5 py-0.5 font-mono text-[10px] text-muted"
        style={{ left: "35.7%", top: "36.5%" }}
      >
        true
      </span>
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded border border-line bg-active px-1.5 py-0.5 font-mono text-[10px] text-muted"
        style={{ left: "35.7%", top: "61.5%" }}
      >
        false
      </span>

      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${node.x / 11}%`, top: `${node.y / 4.8}%` }}
        >
          <NodeCard node={node} pulse={node.status === "running"} />
        </div>
      ))}

      {/* Terminal state */}
      <div
        className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-ok/40 bg-ok/10 px-3.5 py-1.5 text-xs font-medium text-ok shadow-[0_0_24px_rgba(34,197,94,0.25)]"
        style={{ left: "94%", top: "50%" }}
      >
        <CheckIcon width={13} height={13} />
        Success
      </div>
    </div>
  );
}

function MobileGraph() {
  return (
    <ol className="relative ml-3 space-y-3 border-l border-line md:hidden">
      {nodes.map((node, i) => (
        <li key={node.id} className="relative pl-6">
          <span
            className="absolute -left-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-ink bg-line"
            aria-hidden
          />
          <NodeCard node={node} pulse={node.status === "running"} />
          {i === nodes.length - 1 && (
            <p className="mt-3 flex items-center gap-2 text-xs font-medium text-ok">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ok/15">
                <CheckIcon width={11} height={11} />
              </span>
              Success — 395ms total
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

export function WorkflowCanvas() {
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="workflow-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs text-highlight">Execution graph</p>
          <h2
            id="workflow-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Every run, from trigger to worker.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Watch events move through your graph in real time. Each node reports
            its own status, latency, and retry count — down to the individual
            execution.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-12">
          <div className="relative overflow-hidden rounded-xl border border-line bg-surface/50 p-4 sm:p-6">
            <DesktopGraph />
            <MobileGraph />

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line/70 pt-4 font-mono text-[11px] text-muted">
              <span>
                p50 <span className="text-fg">84ms</span>
              </span>
              <span>
                p99 <span className="text-fg">412ms</span>
              </span>
              <span>
                success rate <span className="text-ok">99.99%</span>
              </span>
              <span className="ml-auto hidden sm:inline">
                workflow: order-fulfillment · v42
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
