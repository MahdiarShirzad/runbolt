import type { CSSProperties } from "react";
import { Reveal } from "../landing/Reveal";

type Stage = {
  name: string;
  tag: string;
  label: string;
  tone: "primary" | "accent" | "highlight";
};

const stages: Stage[] = [
  { name: "Client", tag: "entry", label: "Your app, CLI, or a webhook source.", tone: "primary" },
  { name: "Runbolt API", tag: "gateway", label: "Receives the request and its context.", tone: "primary" },
  { name: "Workflow Engine", tag: "orchestration", label: "Resolves the graph and tracks state.", tone: "accent" },
  { name: "Worker", tag: "execution", label: "Runs each step and reports back.", tone: "primary" },
  { name: "External Service", tag: "destination", label: "The system your workflow reaches.", tone: "highlight" },
];

const stores = [
  {
    name: "Secrets",
    tag: "protected",
    label: "Referenced by name; kept separate from workflow logic.",
    cls: "border-accent/30 bg-accent/10 text-accent",
    dot: "bg-accent",
  },
  {
    name: "Logs",
    tag: "records",
    label: "Structured lines recorded during execution.",
    cls: "border-info/30 bg-info/10 text-info",
    dot: "bg-info",
  },
  {
    name: "Execution Data",
    tag: "records",
    label: "Inputs, outputs, and state for each step.",
    cls: "border-highlight/30 bg-highlight/10 text-highlight",
    dot: "bg-highlight",
  },
];

const toneCls = {
  primary: "text-primary",
  accent: "text-accent",
  highlight: "text-highlight",
} as const;

function Connector({ delay }: { delay: number }) {
  return (
    <span
      aria-hidden
      className="relative mx-0.5 mt-[34px] hidden h-px w-6 shrink-0 self-start bg-line md:block lg:w-8"
    >
      <span
        className="flow-x-dot absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-highlight shadow-[0_0_6px_rgba(76,201,240,0.8)]"
        style={{ "--flow-delay": `${delay}s` } as CSSProperties}
      />
    </span>
  );
}

function StageBox({ stage }: { stage: Stage }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-[68px] flex-col items-center justify-center gap-1 rounded-lg border border-line bg-surface px-2 text-center transition-colors duration-200 hover:border-[#3a466b]">
        <span className={`font-mono text-[9.5px] uppercase tracking-wider ${toneCls[stage.tone]}`}>
          {stage.tag}
        </span>
        <span className="text-[13px] font-medium leading-tight text-fg">{stage.name}</span>
      </div>
      <p className="mt-2.5 text-center text-[11px] leading-snug text-muted">{stage.label}</p>
    </div>
  );
}

function MobilePipeline() {
  return (
    <div className="relative md:hidden">
      <div
        aria-hidden
        className="absolute bottom-6 left-[19px] top-6 w-px bg-gradient-to-b from-line via-line to-transparent"
      >
        <span className="rail-pulse absolute left-1/2 h-6 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-highlight to-transparent" />
      </div>
      <ol className="space-y-2">
        {stages.map((stage) => (
          <li key={stage.name} className="relative flex items-center gap-3.5 py-1.5">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-raised ${toneCls[stage.tone]}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-fg">
                {stage.name}
                <span className={`ml-2 font-mono text-[9.5px] uppercase ${toneCls[stage.tone]}`}>
                  {stage.tag}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-muted">{stage.label}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ArchitectureDiagram() {
  return (
    <section id="data-flow" className="py-20 sm:py-28" aria-labelledby="data-flow-heading">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.06),transparent)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs text-highlight">Data flow</p>
          <h2
            id="data-flow-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Understand where your data moves.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Seeing the path a workflow takes makes it easier to reason about
            what it touches — which systems it reaches, which credentials it
            uses, and what gets recorded along the way.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 rounded-xl border border-line bg-surface/60 p-5 sm:p-7">
            {/* sr-only narrative for the diagram */}
            <p className="sr-only">
              Conceptual data flow: a request moves from the client through the
              Runbolt API to the workflow engine, then to a worker, and finally
              to the external service it calls. Secrets are referenced by
              workflows, while logs and execution data are recorded as work
              happens.
            </p>

            {/* Desktop pipeline */}
            <div className="hidden items-stretch md:flex">
              {stages.map((stage, i) => (
                <div key={stage.name} className="flex min-w-0 flex-1 items-stretch">
                  <StageBox stage={stage} />
                  {i < stages.length - 1 ? <Connector delay={i * 0.55} /> : null}
                </div>
              ))}
            </div>

            {/* Mobile pipeline */}
            <MobilePipeline />

            {/* Data layer divider */}
            <div className="mt-8 flex items-center gap-4" aria-hidden>
              <span className="h-px flex-1 border-t border-dashed border-line" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted/60">
                data &amp; records
              </span>
              <span className="h-px flex-1 border-t border-dashed border-line" />
            </div>

            {/* Stores */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {stores.map((store) => (
                <div
                  key={store.name}
                  className="rounded-lg border border-line bg-code/50 p-4 transition-colors duration-200 hover:border-[#3a466b]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${store.dot}`} aria-hidden />
                    <span className="text-[13px] font-medium text-fg">{store.name}</span>
                    <span
                      className={`ml-auto rounded border px-1.5 py-0.5 font-mono text-[9px] ${store.cls}`}
                    >
                      {store.tag}
                    </span>
                  </div>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-muted">{store.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <p className="mt-3 text-center font-mono text-[10.5px] text-muted/60">
          Conceptual data flow — illustrative, not a deployment diagram.
        </p>
      </div>
    </section>
  );
}
