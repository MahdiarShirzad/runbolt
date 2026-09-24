import type { ReactNode } from "react";
import { Reveal } from "../landing/Reveal";
import { SectionHeader } from "../ui/kit";
import {
  DbIcon,
  FilterIcon,
  GlobeIcon,
  MinusIcon,
  PlusIcon,
  RetryIcon,
  WebhookIcon,
  WorkerIcon,
} from "../landing/icons";
import { kindColor, StatusPill, type NodeStatus } from "./shared";

type CanvasNode = {
  id: string;
  label: string;
  sub: string;
  kind: keyof typeof kindColor;
  icon: ReactNode;
  x: number; // viewBox coords (0..1100)
  y: number; // viewBox coords (0..520)
  status?: NodeStatus;
  selected?: boolean;
  dashed?: boolean;
};

const nodes: CanvasNode[] = [
  { id: "hook_in", label: "Webhook", sub: "trigger · /hooks/customers", kind: "webhook", icon: <WebhookIcon width={14} height={14} />, x: 95, y: 110, status: "success" },
  { id: "check_valid", label: "Condition", sub: "source.trusted", kind: "condition", icon: <FilterIcon width={14} height={14} />, x: 300, y: 110, status: "success", selected: true },
  { id: "sync_api", label: "HTTP Request", sub: "POST crm.example.com", kind: "http", icon: <GlobeIcon width={14} height={14} />, x: 545, y: 60, status: "success" },
  { id: "persist", label: "PostgreSQL", sub: "customers · upsert", kind: "db", icon: <DbIcon width={14} height={14} />, x: 770, y: 60, status: "success" },
  { id: "enqueue", label: "Worker", sub: "queue: crm-sync", kind: "worker", icon: <WorkerIcon width={14} height={14} />, x: 940, y: 110, status: "running" },
  { id: "retry", label: "Retry", sub: "backoff · 3 attempts", kind: "worker", icon: <RetryIcon width={14} height={14} />, x: 545, y: 205, dashed: true },
];

const edges = [
  { d: "M95 110 H300", delay: "0s" },
  { d: "M300 110 C370 110 465 60 545 60", delay: "0.6s" },
  { d: "M300 110 C370 110 465 205 545 205", delay: "0.6s", dim: true },
  { d: "M545 60 H770", delay: "1.2s" },
  { d: "M770 60 C860 60 870 110 940 110", delay: "1.8s" },
];

const inspectorRows: [string, string][] = [
  ["expression", "source.trusted === true"],
  ["on_true", "→ http.sync_crm"],
  ["on_false", "→ retry(3)"],
  ["timeout", "30s"],
];

function CanvasNodeCard({ node }: { node: CanvasNode }) {
  const running = node.status === "running";
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border bg-surface/95 px-3 py-2.5 backdrop-blur-sm ${
        node.selected
          ? "border-primary shadow-[0_0_0_1px_rgba(199,240,78,0.5)]"
          : running
            ? "border-primary/60 pulse-primary"
            : "border-line"
      } ${node.dashed ? "border-dashed border-warn/40" : ""}`}
    >
      <span className={node.dashed ? "text-warn" : kindColor[node.kind]}>
        {node.icon}
      </span>
      <span className="leading-tight">
        <span className="block whitespace-nowrap text-xs font-medium text-fg">
          {node.label}
        </span>
        <span className="block whitespace-nowrap font-mono text-[9.5px] text-muted">
          {node.sub}
        </span>
      </span>
      {node.status && <StatusPill status={node.status} />}
    </div>
  );
}

function ShowcaseCanvas() {
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_24px_80px_-24px_rgba(3,5,9,0.95)]">
      {/* Editor toolbar */}
      <div className="flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 py-2.5">
        <p className="truncate font-mono text-[11px] text-muted">
          runbolt<span className="text-line-strong">/</span>
          <span className="text-fg">customer-sync</span>
          <span className="text-line"> · v12</span>
        </p>
        <div className="ml-auto flex items-center gap-2" aria-hidden>
          <span className="flex items-center overflow-hidden rounded-md border border-line">
            <span className="flex h-6 w-6 items-center justify-center text-muted">
              <MinusIcon width={12} height={12} />
            </span>
            <span className="border-x border-line px-1.5 font-mono text-[10px] text-fg">
              100%
            </span>
            <span className="flex h-6 w-6 items-center justify-center text-muted">
              <PlusIcon width={12} height={12} />
            </span>
          </span>
          <span className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-button-text">
            Deploy
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <div className="bg-grid mask-fade-radial absolute inset-0" aria-hidden />
        <div className="relative hidden aspect-[1100/420] md:block">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1100 520"
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
                {!edge.dim && (
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
                )}
              </g>
            ))}
            {/* Branch label chips */}
          </svg>

          <span
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded border border-line bg-active px-1.5 py-0.5 font-mono text-[10px] text-muted"
            style={{ left: "38%", top: "20%" }}
          >
            true
          </span>
          <span
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded border border-line bg-active px-1.5 py-0.5 font-mono text-[10px] text-warn/90"
            style={{ left: "38%", top: "37.5%" }}
          >
            false
          </span>

          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x / 11}%`, top: `${node.y / 4.2}%` }}
            >
              <CanvasNodeCard node={node} />
            </div>
          ))}

          {/* Inspector for the selected node */}
          <aside
            className="absolute bottom-4 right-4 hidden w-60 rounded-lg border border-line bg-code/95 p-3.5 shadow-xl backdrop-blur-sm xl:block"
            aria-label="Node inspector"
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
                Inspector
              </p>
              <span className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] text-accent">
                condition
              </span>
            </div>
            <dl className="mt-3 space-y-1.5 font-mono text-[10px]">
              {inspectorRows.map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <dt className="w-16 shrink-0 text-highlight">{key}</dt>
                  <dd className="truncate text-code-text">{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {/* Mobile fallback: vertical chain */}
        <ol className="relative ml-3 space-y-3 border-l border-line py-5 md:hidden">
          {nodes.map((node) => (
            <li key={node.id} className="relative pl-6">
              <span
                className="absolute -left-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-ink bg-line"
                aria-hidden
              />
              <CanvasNodeCard node={node} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function BuilderShowcase() {
  return (
    <section className="py-24 sm:py-32" aria-labelledby="builder-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeader
            id="builder-heading"
            eyebrow="Workflow builder"
            title="Build workflows visually. Think in systems."
            lede="Compose triggers, conditions, APIs, databases, workers, and transformations into reliable execution pipelines."
          />
        </Reveal>

        <Reveal delay={120} className="mt-12">
          <ShowcaseCanvas />
        </Reveal>
      </div>
    </section>
  );
}
