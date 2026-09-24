import type { ReactNode } from "react";
import { CheckIcon, DbIcon, FilterIcon, GlobeIcon, WebhookIcon, WorkerIcon } from "./icons";

/* Node kinds → color roles from the Runbolt node palette */
const kindColor: Record<string, string> = {
  webhook: "text-warn",
  http: "text-highlight",
  condition: "text-accent",
  db: "text-ok",
  worker: "text-highlight",
};

type NodeStatus = "success" | "running";

type MockNode = {
  id: string;
  label: string;
  sub: string;
  kind: keyof typeof kindColor;
  icon: ReactNode;
  x: number; // viewBox coords (0..1000)
  y: number; // viewBox coords (0..460)
  status: NodeStatus;
};

const nodes: MockNode[] = [
  {
    id: "hook_in",
    label: "Webhook",
    sub: "/hooks/orders",
    kind: "webhook",
    icon: <WebhookIcon width={13} height={13} />,
    x: 110,
    y: 120,
    status: "success",
  },
  {
    id: "charge_api",
    label: "HTTP Request",
    sub: "POST stripe.com",
    kind: "http",
    icon: <GlobeIcon width={13} height={13} />,
    x: 350,
    y: 120,
    status: "success",
  },
  {
    id: "check_customer",
    label: "Condition",
    sub: "premium === true",
    kind: "condition",
    icon: <FilterIcon width={13} height={13} />,
    x: 590,
    y: 120,
    status: "success",
  },
  {
    id: "persist_order",
    label: "Database",
    sub: "orders · insert",
    kind: "db",
    icon: <DbIcon width={13} height={13} />,
    x: 830,
    y: 70,
    status: "success",
  },
  {
    id: "fulfill_job",
    label: "Worker",
    sub: "fulfillment.job",
    kind: "worker",
    icon: <WorkerIcon width={13} height={13} />,
    x: 830,
    y: 210,
    status: "running",
  },
];

/* Edges drawn center-to-center; the HTML nodes sit on top and cover the ends. */
const edges = [
  { d: "M110 120 H350", delay: "0s" },
  { d: "M350 120 H590", delay: "0.6s" },
  { d: "M590 120 C690 120 730 70 830 70", delay: "1.2s" },
  { d: "M590 120 C690 120 730 210 830 210", delay: "1.2s" },
];

const logs: [string, string, string, string][] = [
  ["12:04:31", "INFO", "text-highlight", "webhook.received POST /hooks/orders (18ms)"],
  ["12:04:31", "INFO", "text-highlight", "condition.eval premium === true"],
  ["12:04:31", "INFO", "text-highlight", "http.request stripe/charges → 200 (171ms)"],
  ["12:04:31", " OK ", "text-ok", "db.insert orders · 1 row (94ms)"],
  ["12:04:31", "INFO", "text-highlight", "worker.enqueue fulfillment.job #48213"],
  ["12:04:31", "RUN ", "text-primary", "worker.running fulfillment.job #48213 …"],
];

/* Tracing waterfall: [label, left %, width %, color, running?] */
const spans: [string, number, number, string, boolean?][] = [
  ["webhook.received", 1, 5, "bg-warn/70"],
  ["condition.eval", 7, 5, "bg-accent/70"],
  ["http.request", 13, 24, "bg-highlight/70"],
  ["db.insert", 38, 12, "bg-ok/70"],
  ["worker.running", 51, 47, "bg-primary/80", true],
];

function StatusBadge({ status }: { status: NodeStatus }) {
  if (status === "success") {
    return (
      <span
        className="flex h-4 w-4 items-center justify-center rounded-full bg-ok/15 text-ok"
        aria-label="succeeded"
      >
        <CheckIcon width={9} height={9} />
      </span>
    );
  }
  return (
    <span
      className="spin inline-block h-3 w-3 rounded-full border-[1.5px] border-primary border-t-transparent"
      role="status"
      aria-label="running"
    />
  );
}

export function BuilderMock() {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_24px_70px_-28px_rgba(3,5,9,0.95)]">
        {/* Trace chrome */}
        <div className="ruler flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 pb-2 pt-2.5">
          <p className="truncate font-mono text-[11px] text-muted">
            runbolt<span className="text-line-strong">/</span>workflows
            <span className="text-line-strong">/</span>
            <span className="text-fg">order-fulfillment</span>
          </p>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded border border-line bg-code px-2 py-0.5 font-mono text-[10px] text-muted sm:inline">
              run #48213
            </span>
            <span className="flex items-center gap-1.5 rounded border border-ok/25 bg-ok/10 px-2 py-0.5 font-mono text-[10px] text-ok">
              <span className="blink h-1.5 w-1.5 rounded-full bg-ok" aria-hidden />
              LIVE
            </span>
          </div>
        </div>

        <div className="flex">
          {/* Node library */}
          <aside className="hidden w-44 shrink-0 border-r border-line/80 p-3 md:block" aria-label="Node library">
            <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
              Nodes
            </p>
            <ul className="space-y-0.5">
              {[
                ["Trigger", "bg-primary"],
                ["Webhook", "bg-warn"],
                ["HTTP", "bg-highlight"],
                ["Condition", "bg-accent"],
                ["Transform", "bg-viz-7"],
                ["Database", "bg-ok"],
                ["Worker", "bg-highlight"],
              ].map(([label, dot]) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs text-muted transition-colors hover:bg-hover hover:text-fg"
                >
                  <span className={`h-1.5 w-1.5 ${dot}`} aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </aside>

          {/* Canvas */}
          <div className="scroll-slim flex-1 overflow-x-auto">
            <div className="relative aspect-[1000/460] min-w-[600px] bg-ink">
              <div className="bg-grid mask-fade-radial absolute inset-0" aria-hidden />

              {/* Edges */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 1000 460"
                preserveAspectRatio="none"
                aria-hidden
              >
                {edges.map((edge) => (
                  <g key={edge.d}>
                    <path
                      d={edge.d}
                      fill="none"
                      stroke="#232C3B"
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                    <path
                      d={edge.d}
                      fill="none"
                      stroke="#C7F04E"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      className="edge-flow"
                      style={{ "--edge-delay": edge.delay } as React.CSSProperties}
                    />
                  </g>
                ))}
              </svg>

              {/* Nodes */}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-lg border bg-surface/95 px-3 py-2 ${
                    node.status === "running"
                      ? "border-primary/60 pulse-primary"
                      : "border-line"
                  }`}
                  style={{ left: `${node.x / 10}%`, top: `${node.y / 4.6}%` }}
                >
                  <span className={kindColor[node.kind]}>{node.icon}</span>
                  <span className="leading-tight">
                    <span className="block whitespace-nowrap text-[11px] font-medium text-fg">
                      {node.label}
                    </span>
                    <span className="block whitespace-nowrap font-mono text-[9.5px] text-muted">
                      {node.sub}
                    </span>
                  </span>
                  <StatusBadge status={node.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Logs */}
          <aside
            className="hidden w-72 shrink-0 flex-col border-l border-line/80 bg-code lg:flex"
            aria-label="Execution logs"
          >
            <p className="border-b border-line/60 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-faint">
              Execution log
            </p>
            <div className="scroll-slim flex-1 overflow-y-auto overflow-x-auto p-3 font-mono text-[10.5px] leading-5">
              {logs.map(([time, level, levelColor, msg], i) => (
                <p key={i} className="whitespace-pre">
                  <span className="text-faint">{time}</span>{" "}
                  <span className={levelColor}>{level}</span>{" "}
                  <span className="text-code-text">{msg}</span>
                </p>
              ))}
              <p className="whitespace-pre">
                <span className="text-faint">12:04:31</span>{" "}
                <span className="text-primary">▍</span>
              </p>
            </div>
          </aside>
        </div>

        {/* Tracing waterfall */}
        <div className="border-t border-line/80 bg-raised/40 px-4 py-3">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-faint">
            <span className="uppercase tracking-widest">Trace · run #48213</span>
            <span>
              elapsed <span className="text-fg">395ms</span> · retries{" "}
              <span className="text-fg">0</span>
            </span>
          </div>
          <div className="space-y-1.5">
            {spans.map(([label, left, width, color, running]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate font-mono text-[10px] text-muted">
                  {label}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-code">
                  <span
                    className={`absolute inset-y-0 rounded-full ${color} ${running ? "" : "opacity-90"}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
