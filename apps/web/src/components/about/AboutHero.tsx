import type { CSSProperties } from "react";
import Link from "next/link";
import { Reveal } from "../landing/Reveal";
import { ArrowRightIcon, BookIcon } from "../landing/icons";

type Stage = {
  name: string;
  detail: string;
  state: string;
  stateCls: string;
  nodeCls: string;
  running?: boolean;
};

const stages: Stage[] = [
  {
    name: "Idea",
    detail: "intent · what should happen",
    state: "draft",
    stateCls: "border-line bg-raised text-muted",
    nodeCls: "bg-highlight shadow-[0_0_10px_rgba(76,201,240,0.7)]",
  },
  {
    name: "Workflow",
    detail: "graph · composable steps",
    state: "v1",
    stateCls: "border-primary/30 bg-primary/10 text-primary",
    nodeCls: "bg-primary",
  },
  {
    name: "Execution",
    detail: "workers · observable state",
    state: "running",
    stateCls: "border-primary/40 bg-primary/10 text-primary",
    nodeCls: "bg-primary pulse-primary",
    running: true,
  },
  {
    name: "Observation",
    detail: "logs · outputs · timing",
    state: "streaming",
    stateCls: "border-accent/30 bg-accent/10 text-accent",
    nodeCls: "bg-accent",
  },
  {
    name: "Result",
    detail: "outcome · verified",
    state: "ok",
    stateCls: "border-ok/30 bg-ok/10 text-ok",
    nodeCls: "bg-ok shadow-[0_0_10px_rgba(34,197,94,0.6)]",
  },
];

const logs: [string, string, string][] = [
  ["12:04:11", "INFO", "workflow resolved · 6 nodes · acyclic"],
  ["12:04:11", "RUN ", "execution started · run_7d21"],
  ["12:04:12", "OK ", "step 3/5 complete · 142ms"],
  ["12:04:12", "INFO", "logs streamed · observation attached"],
];

function WorkflowStoryPanel() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_80px_-24px_rgba(5,7,12,0.9)]">
      <div className="flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 py-3">
        <p className="truncate font-mono text-xs text-muted">
          runbolt<span className="text-line">/</span>
          <span className="text-fg">workflow-story</span>
        </p>
        <span className="ml-auto flex items-center gap-1.5 rounded border border-highlight/30 bg-highlight/10 px-2 py-0.5 font-mono text-[10px] text-highlight">
          <span className="blink h-1.5 w-1.5 rounded-full bg-highlight" aria-hidden />
          CONCEPT
        </span>
      </div>

      {/* Desktop: horizontal chain */}
      <div className="relative hidden px-5 py-7 sm:block">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-60" aria-hidden />
        <ol className="relative grid grid-cols-5 gap-2" aria-label="From idea to result">
          {stages.map((stage, i) => (
            <Reveal as="li" key={stage.name} delay={i * 90} className="relative">
              {i < stages.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute left-[calc(50%+22px)] right-[calc(-50%+22px)] top-[19px] h-px bg-line"
                >
                  <span
                    className="flow-x-dot absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-highlight shadow-[0_0_6px_rgba(76,201,240,0.8)]"
                    style={{ "--flow-delay": `${i * 0.45}s` } as CSSProperties}
                  />
                </span>
              ) : null}
              <div className="flex flex-col items-center px-1 text-center">
                <span
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink ${stage.nodeCls}`}
                  aria-hidden
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/70" />
                </span>
                <span className="mt-3 text-[13px] font-medium text-fg">
                  {stage.name}
                </span>
                <span className="mt-1 font-mono text-[9.5px] leading-snug text-muted/80">
                  {stage.detail}
                </span>
                <span
                  className={`mt-2 rounded-full border px-1.5 py-0.5 font-mono text-[9px] ${stage.stateCls}`}
                >
                  {stage.running && (
                    <span className="blink mr-1 inline-block h-1 w-1 rounded-full bg-current align-middle" aria-hidden />
                  )}
                  {stage.state}
                </span>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>

      {/* Mobile: vertical rail */}
      <div className="relative px-4 py-5 sm:hidden">
        <div
          aria-hidden
          className="absolute bottom-8 left-[31px] top-8 w-px bg-gradient-to-b from-line via-line to-transparent"
        >
          <span className="rail-pulse absolute left-1/2 h-6 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-highlight to-transparent" />
        </div>
        <ol className="space-y-1">
          {stages.map((stage) => (
            <li key={stage.name} className="relative flex items-center gap-3 py-1.5">
              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink ${stage.nodeCls}`}
                aria-hidden
              >
                <span className="h-1 w-1 rounded-full bg-ink/70" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium text-fg">
                  {stage.name}
                  <span
                    className={`ml-auto rounded-full border px-1.5 py-0.5 font-mono text-[9px] ${stage.stateCls}`}
                  >
                    {stage.state}
                  </span>
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-muted">{stage.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Log strip */}
      <div className="border-t border-line/80 bg-code px-4 py-3" aria-label="Execution log preview">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
          execution log
        </p>
        <div className="scroll-slim mt-2 space-y-0.5 overflow-x-auto font-mono text-[10.5px] leading-5">
          {logs.map(([time, level, msg], i) => (
            <p key={i} className="whitespace-pre">
              <span className="text-muted/60">{time}</span>{" "}
              <span
                className={
                  level === "OK"
                    ? "text-ok"
                    : level === "RUN"
                      ? "text-primary"
                      : "text-info"
                }
              >
                {level.padEnd(4)}
              </span>{" "}
              <span className="text-[#A7B2C9]">{msg}</span>
            </p>
          ))}
          <p className="whitespace-pre text-highlight">▍</p>
        </div>
      </div>
    </div>
  );
}

export function AboutHero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-14 sm:pt-20"
      aria-labelledby="about-hero-heading"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-50" />
        <div className="absolute left-1/2 top-[-280px] h-[560px] w-[880px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.13),transparent)] blur-2xl" />
        <div className="absolute right-[6%] top-[140px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(closest-side,rgba(76,201,240,0.08),transparent)] blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/80 py-1 pl-3 pr-3.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted backdrop-blur">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.9)]"
                  aria-hidden
                />
                About Runbolt
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h1
                id="about-hero-heading"
                className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl lg:text-[56px]"
              >
                Automation should feel like software.
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
                Runbolt is being built to give developers a clearer, more
                powerful way to design, execute, and observe automated
                workflows.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/features"
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-button-text shadow-[0_2px_20px_rgba(59,130,246,0.4)] transition-all duration-200 hover:bg-[#2f76ef] hover:shadow-[0_2px_28px_rgba(59,130,246,0.55)]"
                >
                  Explore Features
                  <ArrowRightIcon
                    width={15}
                    height={15}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface/60 px-6 text-sm font-medium text-fg backdrop-blur transition-colors duration-200 hover:border-[#3a466b] hover:bg-hover"
                >
                  <BookIcon width={15} height={15} className="text-muted" />
                  Read Documentation
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <WorkflowStoryPanel />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
