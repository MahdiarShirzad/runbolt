import { Reveal } from "../landing/Reveal";
import { ButtonAnchor } from "../ui/kit";
import {
  BookIcon,
  CheckIcon,
  DbIcon,
  FilterIcon,
  GlobeIcon,
  ShuffleIcon,
  WebhookIcon,
  WorkerIcon,
} from "../landing/icons";
import { kindColor, StatusPill, type NodeStatus } from "./shared";
import type { ReactNode } from "react";

/* Vertical execution pipeline shown in the hero preview */
const pipeline: {
  kind: keyof typeof kindColor;
  label: string;
  sub: string;
  dur: string;
  status: NodeStatus;
  icon: ReactNode;
}[] = [
  { kind: "webhook", label: "Webhook", sub: "/hooks/orders", dur: "18ms", status: "success", icon: <WebhookIcon width={14} height={14} /> },
  { kind: "condition", label: "Condition", sub: "premium === true", dur: "12ms", status: "success", icon: <FilterIcon width={14} height={14} /> },
  { kind: "http", label: "HTTP Request", sub: "POST stripe.com/v1/charges", dur: "171ms", status: "success", icon: <GlobeIcon width={14} height={14} /> },
  { kind: "transform", label: "Transform", sub: "map charge → order", dur: "9ms", status: "success", icon: <ShuffleIcon width={14} height={14} /> },
  { kind: "db", label: "PostgreSQL", sub: "orders · upsert", dur: "94ms", status: "success", icon: <DbIcon width={14} height={14} /> },
  { kind: "worker", label: "Worker", sub: "queue: fulfillment", dur: "—", status: "running", icon: <WorkerIcon width={14} height={14} /> },
];

const logs: [string, string, string][] = [
  ["12:31:04", "INFO", "trigger received · run #2210 started"],
  ["12:31:04", "INFO", "condition passed → http path"],
  ["12:31:05", " OK ", "stripe charge succeeded · ch_3PqL2k"],
  ["12:31:05", " OK ", "postgres upsert · orders/48213"],
  ["12:31:05", "RUN ", "worker fulfillment.job picked up"],
];

const inspectorRows: [string, string][] = [
  ["mode", '"map"'],
  ["input", "charge.status = succeeded"],
  ["output", "order.rows[1]"],
  ["retries", "2 · exponential"],
  ["timeout", "30s"],
];

function PipelinePreview() {
  return (
    <div className="relative overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_24px_70px_-28px_rgba(3,5,9,0.95)]">
      {/* Trace chrome */}
      <div className="ruler flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 pb-2 pt-2.5">
        <p className="truncate font-mono text-[11px] text-muted">
          runbolt<span className="text-line-strong">/</span>workflows
          <span className="text-line-strong">/</span>
          <span className="text-fg">order-fulfillment</span>
        </p>
        <span className="ml-auto flex items-center gap-1.5 rounded border border-ok/25 bg-ok/10 px-2 py-0.5 font-mono text-[10px] text-ok">
          <span className="blink h-1.5 w-1.5 rounded-full bg-ok" aria-hidden />
          LIVE
        </span>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        {/* Pipeline canvas */}
        <div className="relative border-b border-line/80 lg:border-b-0 lg:border-r">
          <div className="bg-grid mask-fade-radial absolute inset-0" aria-hidden />
          <div className="relative flex items-center px-5 py-6 sm:px-8">
            <ol className="relative mx-auto w-full max-w-sm" aria-label="Workflow execution pipeline">
              {/* Rail + execution pulse */}
              <span
                className="absolute bottom-3 left-[7px] top-3 w-px bg-line"
                aria-hidden
              />
              <span
                className="rail-pulse absolute left-[5px] h-3 w-3 bg-primary shadow-[0_0_10px_rgba(199,240,78,0.7)]"
                aria-hidden
              />
              {pipeline.map((step) => (
                <li key={step.label} className="relative pb-2.5 pl-7">
                  <span
                    className={`absolute left-0 top-1/2 h-[13px] w-[13px] -translate-y-1/2 border-2 border-ink ${
                      step.status === "running" ? "bg-primary" : "bg-line"
                    }`}
                    aria-hidden
                  />
                  <div
                    className={`flex items-center gap-2.5 rounded-lg border bg-surface/95 px-3 py-2 ${
                      step.status === "running"
                        ? "border-primary/60 pulse-primary"
                        : "border-line"
                    }`}
                  >
                    <span className={kindColor[step.kind]}>{step.icon}</span>
                    <span className="min-w-0 leading-tight">
                      <span className="block truncate text-xs font-medium text-fg">
                        {step.label}
                      </span>
                      <span className="block truncate font-mono text-[9.5px] text-muted">
                        {step.sub}
                      </span>
                    </span>
                    <span className="ml-auto flex shrink-0 items-center gap-2">
                      <span className="font-mono text-[9.5px] text-muted/80">
                        {step.dur}
                      </span>
                      <StatusPill status={step.status} />
                    </span>
                  </div>
                </li>
              ))}
              <li className="relative pl-7 pt-1">
                <span
                  className="absolute left-0 top-1/2 flex h-[15px] w-[15px] -translate-y-1/2 items-center justify-center rounded-full bg-ok/20 text-ok"
                  aria-hidden
                >
                  <CheckIcon width={9} height={9} />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-ok/40 bg-ok/10 px-3 py-1 text-[11px] font-medium text-ok">
                  <CheckIcon width={11} height={11} />
                  Success
                </span>
              </li>
            </ol>
          </div>
        </div>

        {/* Inspector + logs */}
        <div className="flex flex-col bg-code/60">
          <div className="border-b border-line/60 p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
                Inspector
              </p>
              <span className="rounded border border-highlight/30 bg-highlight/10 px-1.5 py-0.5 font-mono text-[9px] text-highlight">
                transform · map_charge
              </span>
            </div>
            <dl className="mt-3 space-y-1.5 font-mono text-[10.5px]">
              {inspectorRows.map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <dt className="w-16 shrink-0 text-highlight">{key}</dt>
                  <dd className="truncate text-code-text">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex-1 p-4" aria-label="Execution logs">
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              Logs
            </p>
            <div className="scroll-slim mt-3 space-y-1 overflow-x-auto font-mono text-[10.5px] leading-5">
              {logs.map(([time, level, msg], i) => (
                <p key={i} className="whitespace-pre">
                  <span className="text-faint">{time}</span>{" "}
                  <span
                    className={
                      level === "OK"
                        ? "text-ok"
                        : level === "RUN"
                          ? "text-primary"
                          : "text-highlight"
                    }
                  >
                    {level.padEnd(4)}
                  </span>{" "}
                  <span className="text-code-text">{msg}</span>
                </p>
              ))}
              <p className="whitespace-pre text-primary">▍</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesHero() {
  return (
    <section className="relative overflow-hidden pt-14 sm:pt-20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-50" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <h1 className="text-balance font-display text-4xl font-bold leading-[1.08] tracking-[-0.025em] sm:text-5xl lg:text-[56px]">
            Everything you need to run workflows in production
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
            Build, execute, monitor, and scale automated workflows with a
            developer-first platform designed for modern engineering teams.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonAnchor href="#cta">
              Start Building
            </ButtonAnchor>
            <ButtonAnchor href="#developers" variant="secondary">
              <BookIcon width={15} height={15} className="text-muted" />
              Read Documentation
            </ButtonAnchor>
          </div>
        </div>

        <Reveal className="mt-14 sm:mt-16">
          <PipelinePreview />
        </Reveal>
      </div>
    </section>
  );
}
