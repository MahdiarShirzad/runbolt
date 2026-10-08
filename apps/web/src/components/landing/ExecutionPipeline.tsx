"use client";

import { Reveal } from "./Reveal";
import { SectionHeader } from "../ui/kit";
import {
  WebhookIcon,
  NodeGraphIcon,
  WorkerIcon,
  EyeIcon,
} from "./icons";

const stages = [
  {
    index: "01",
    title: "TRIGGER",
    description: "Start from a webhook, schedule, API request, or event.",
    icon: WebhookIcon,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    index: "02",
    title: "ROUTE",
    description: "Resolve the workflow and execution path.",
    icon: NodeGraphIcon,
    color: "text-highlight",
    bgColor: "bg-highlight/10",
  },
  {
    index: "03",
    title: "EXECUTE",
    description: "Run the workflow and track its live execution state.",
    icon: WorkerIcon,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    index: "04",
    title: "OBSERVE",
    description: "Inspect logs, failures, timing, and execution history.",
    icon: EyeIcon,
    color: "text-info",
    bgColor: "bg-info/10",
  },
] as const;

function Stage({
  stage,
  isLast,
}: {
  stage: (typeof stages)[number];
  isLast: boolean;
}) {
  const Icon = stage.icon;

  return (
    <div className="relative flex flex-col items-center gap-4 lg:flex-1">
      <Reveal>
        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-lg border border-line/70 bg-surface/80">
          <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${stage.color}`}>
            {stage.index}
          </span>
        </div>
      </Reveal>

      <Reveal delay={40}>
        <div className="relative flex h-12 w-12 items-center justify-center rounded-lg border border-line/40 bg-surface/60 transition-colors hover:border-primary/40 hover:bg-primary/5">
          <Icon className={stage.color} width={20} height={20} />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex h-2 w-2 rounded-full bg-line/50" aria-hidden />
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            {stage.title}
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-fg">
            {stage.description}
          </p>
        </div>
      </Reveal>

      {!isLast && (
        <div
          aria-hidden
          className="absolute top-[34px] left-[calc(50%+60px)] h-px w-[calc(100%-120px)] bg-gradient-to-r from-transparent via-line/40 to-transparent lg:top-[50px] lg:left-[calc(50%+70px)] lg:w-[calc(100%-140px)]"
        >
          <span
            className="flow-x-dot absolute top-0 h-px w-px rounded-full bg-primary"
            style={{ "--flow-delay": `${stages.indexOf(stage) * 0.6}s` } as React.CSSProperties}
          />
        </div>
      )}
    </div>
  );
}

export function ExecutionPipeline() {
  return (
    <section
      id="pipeline"
      className="relative border-y border-line/70 bg-surface/40 py-20 sm:py-28"
      aria-labelledby="pipeline-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeader
            id="pipeline-heading"
            eyebrow="EXECUTION PIPELINE"
            title="From trigger to execution."
            lede="Runbolt turns events into observable, reliable workflow executions — without hiding the execution layer behind abstractions."
          />
        </Reveal>

        <Reveal delay={120}>
          <div
            className="relative mt-16 flex flex-col items-center gap-10 overflow-hidden lg:flex-row lg:gap-0 lg:items-stretch"
            role="list"
            aria-label="Execution pipeline stages"
          >
            {stages.map((stage, index) => (
              <div key={stage.index} className="relative flex flex-col items-center lg:flex-1" role="listitem">
                <Stage stage={stage} isLast={index === stages.length - 1} />
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-16 grid max-w-3xl gap-4 sm:grid-cols-2">
            {stages.map((stage) => (
              <details
                key={stage.index}
                className="group rounded-lg border border-line/50 bg-surface/60 p-4 transition-colors hover:border-line-strong"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 list-none">
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                    {stage.index} — {stage.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-faint">
                    <span className="h-1.5 w-1.5 rounded-full bg-line" aria-hidden />
                    <span className="h-1.5 w-1.5 rounded-full bg-line" aria-hidden />
                    <span className="h-1.5 w-1.5 rounded-full bg-line" aria-hidden />
                  </span>
                </summary>
                <div className="mt-4 grid gap-2 border-t border-line/50 pt-4">
                  {[
                    "Idempotent by default — safe to retry",
                    "Exact-once delivery semantics",
                    "Typed payloads with schema validation",
                    "Native scheduling with cron & intervals",
                  ].map((detail, i) => (
                    i < 2 && (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted"
                      >
                        <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                        {detail}
                      </div>
                    )
                  ))}
                  {stage.index === "02" && [
                    "DAG resolution with parallel fan-out",
                    "Conditional branching & loops",
                    "Typed step outputs for type-safe chaining",
                    "Dynamic workflow composition",
                  ].map((detail, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted"
                    >
                      <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-highlight/50" />
                      {detail}
                    </div>
                  ))}
                  {stage.index === "03" && [
                    "Real-time execution state streaming",
                    "Step-level retries with backoff",
                    "Checkpoint & resume for long runs",
                    "Worker isolation & resource limits",
                  ].map((detail, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted"
                    >
                      <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                      {detail}
                    </div>
                  ))}
                  {stage.index === "04" && [
                    "Structured logs with query syntax",
                    "Flame graphs for duration analysis",
                    "Error traces with stack correlation",
                    "Export runs to your observability stack",
                  ].map((detail, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted"
                    >
                      <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-info/50" />
                      {detail}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}