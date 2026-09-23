import type { ReactNode } from "react";
import { Reveal } from "../landing/Reveal";
import { EyeIcon, CodeIcon, NodeGraphIcon, FilterIcon } from "../landing/icons";

type PrincipleData = {
  index: string;
  tag: string;
  title: string;
  text: string;
};

const principleList: PrincipleData[] = [
  {
    index: "01",
    tag: "developer-first",
    title: "Developer First",
    text: "Powerful tools should respect the way engineers think and work.",
  },
  {
    index: "02",
    tag: "make-complexity-visible",
    title: "Make Complexity Visible",
    text: "Complex workflows should be easier to understand, inspect, and reason about.",
  },
  {
    index: "03",
    tag: "control-without-friction",
    title: "Control Without Friction",
    text: "Developers should have control over execution without unnecessary operational complexity.",
  },
  {
    index: "04",
    tag: "observability-by-design",
    title: "Observability by Design",
    text: "Knowing what happened should be as important as making something happen.",
  },
  {
    index: "05",
    tag: "composable-systems",
    title: "Composable Systems",
    text: "Small, focused building blocks can form powerful automation systems.",
  },
];

/** Individual principle — editorial row with optional visual fragment. */
export function Principle({
  principle,
  visual,
  flip = false,
}: {
  principle: PrincipleData;
  visual?: ReactNode;
  flip?: boolean;
}) {
  const textBlock = (
    <div className={visual ? "lg:max-w-md" : undefined}>
      <p className="font-mono text-[11px] text-highlight">{principle.tag}</p>
      <h3 className="mt-2 text-balance text-xl font-semibold tracking-tight text-fg sm:text-2xl">
        {principle.title}
      </h3>
      <p className="mt-3 text-pretty leading-relaxed text-muted">
        {principle.text}
      </p>
    </div>
  );

  if (!visual) {
    return (
      <div className="grid gap-4 border-t border-line/70 py-8 sm:grid-cols-[80px_1fr] sm:gap-8 sm:py-10">
        <p
          aria-hidden
          className="font-mono text-xs text-muted/60 sm:text-right"
        >
          {principle.index}
        </p>
        <div className="sm:max-w-xl">{textBlock}</div>
      </div>
    );
  }

  return (
    <div className="grid items-center gap-8 border-t border-line/70 py-8 sm:py-10 lg:grid-cols-2 lg:gap-14">
      <div className={flip ? "lg:order-2" : undefined}>
        <div className="flex items-start gap-5">
          <p aria-hidden className="mt-1 font-mono text-xs text-muted/60">
            {principle.index}
          </p>
          {textBlock}
        </div>
      </div>
      <div className={flip ? "lg:order-1" : undefined}>{visual}</div>
    </div>
  );
}

function InspectFragment() {
  const rows: [string, string][] = [
    ["node", "condition · is_premium"],
    ["input", "user.tier = unknown"],
    ["branch", "true → http / upgrade"],
    ["state", "step 2 of 6"],
    ["visible", "yes"],
  ];
  return (
    <div className="rounded-lg border border-line bg-code/70 p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
          inspector
        </p>
        <span className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] text-accent">
          visible
        </span>
      </div>
      <dl className="mt-3 space-y-1.5 font-mono text-[11px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3">
            <dt className="w-14 shrink-0 text-highlight">{k}</dt>
            <dd className="truncate text-[#A7B2C9]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ControlFragment() {
  const controls: [string, string, boolean][] = [
    ["auto_retry", "exponential · max 5", true],
    ["timeout", "30s per step", true],
    ["concurrency", "pool · 8 workers", true],
    ["manual_approval", "off", false],
  ];
  return (
    <div className="rounded-lg border border-line bg-code/70 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
        execution controls
      </p>
      <ul className="mt-3 space-y-2.5">
        {controls.map(([key, val, on]) => (
          <li key={key} className="flex items-center gap-3 font-mono text-[11px]">
            <span
              className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${
                on ? "bg-primary/70" : "bg-line"
              }`}
              aria-hidden
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-fg transition-all ${
                  on ? "left-3.5" : "left-0.5"
                }`}
              />
            </span>
            <span className="text-highlight">{key}</span>
            <span className="ml-auto truncate text-muted">{val}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ObservabilityFragment() {
  const logs: [string, string, string][] = [
    ["14:02:01", "INFO", "run started · trigger webhook"],
    ["14:02:01", "OK ", "condition evaluated · 6ms"],
    ["14:02:02", "OK ", "http 200 · 118ms"],
    ["14:02:02", "RUN ", "worker job picked up"],
    ["14:02:03", "OK ", "run complete · 1.4s"],
  ];
  return (
    <div className="rounded-lg border border-line bg-code/70 p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
          run log
        </p>
        <span className="flex items-center gap-1.5 rounded border border-ok/30 bg-ok/10 px-1.5 py-0.5 font-mono text-[9px] text-ok">
          <span className="blink h-1 w-1 rounded-full bg-current" aria-hidden />
          live
        </span>
      </div>
      <div className="mt-3 space-y-1 font-mono text-[11px] leading-5">
        {logs.map(([t, level, msg], i) => (
          <p key={i} className="whitespace-pre-wrap">
            <span className="text-muted/60">{t}</span>{" "}
            <span
              className={
                level === "OK" ? "text-ok" : level === "RUN" ? "text-primary" : "text-info"
              }
            >
              {level.padEnd(4)}
            </span>{" "}
            <span className="text-[#A7B2C9]">{msg}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function ComposeFragment() {
  const chips: { label: string; dot: string }[] = [
    { label: "trigger", dot: "bg-primary" },
    { label: "http", dot: "bg-info" },
    { label: "condition", dot: "bg-accent" },
    { label: "database", dot: "bg-ok" },
    { label: "webhook", dot: "bg-warn" },
    { label: "worker", dot: "bg-primary" },
  ];
  return (
    <div className="rounded-lg border border-line bg-code/70 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
        building blocks
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 font-mono text-[11px] text-fg"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${chip.dot}`} aria-hidden />
            {chip.label}
          </span>
        ))}
      </div>
      <div aria-hidden className="mt-4 flex items-center gap-2 border-t border-line/60 pt-4">
        <NodeGraphIcon width={14} height={14} className="text-highlight" />
        <span className="font-mono text-[10px] text-muted">
          small blocks → whole system
        </span>
      </div>
    </div>
  );
}

function LeadVisual() {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-raised text-primary">
        <CodeIcon width={18} height={18} />
      </span>
      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-raised text-highlight">
        <FilterIcon width={18} height={18} />
      </span>
      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-raised text-accent">
        <EyeIcon width={18} height={18} />
      </span>
      <span
        aria-hidden
        className="hidden h-px flex-1 bg-gradient-to-r from-line to-transparent sm:block"
      />
    </div>
  );
}

export function PrinciplesSection() {
  const [first, second, third, fourth, fifth] = principleList;

  return (
    <section
      className="border-y border-line/70 bg-surface/30 py-20 sm:py-28"
      aria-labelledby="principles-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs text-highlight">Product philosophy</p>
          <h2
            id="principles-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Principles we build around.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Five ideas that shape how the product is designed — from the shape
            of a node to the behavior of a failed run.
          </p>
        </Reveal>

        <div className="mt-12">
          {/* 01 — full-width lead */}
          <Reveal>
            <div className="grid gap-4 border-t border-line/70 py-8 sm:grid-cols-[80px_1fr] sm:gap-8 sm:py-10">
              <p aria-hidden className="font-mono text-xs text-muted/60 sm:text-right">
                {first.index}
              </p>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="sm:max-w-xl">
                  <p className="font-mono text-[11px] text-highlight">{first.tag}</p>
                  <h3 className="mt-2 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
                    {first.title}
                  </h3>
                  <p className="mt-3 text-pretty leading-relaxed text-muted">
                    {first.text}
                  </p>
                </div>
                <LeadVisual />
              </div>
            </div>
          </Reveal>

          {/* 02 — text + inspector */}
          <Reveal delay={60}>
            <Principle
              principle={second}
              visual={<InspectFragment />}
            />
          </Reveal>

          {/* 03 — flipped */}
          <Reveal delay={60}>
            <Principle
              principle={third}
              visual={<ControlFragment />}
              flip
            />
          </Reveal>

          {/* 04 — text + logs */}
          <Reveal delay={60}>
            <Principle
              principle={fourth}
              visual={<ObservabilityFragment />}
            />
          </Reveal>

          {/* 05 — full-width with chips */}
          <Reveal delay={60}>
            <div className="grid gap-6 border-t border-line/70 py-8 sm:grid-cols-[80px_1fr] sm:gap-8 sm:py-10">
              <p aria-hidden className="font-mono text-xs text-muted/60 sm:text-right">
                {fifth.index}
              </p>
              <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12">
                <div>
                  <p className="font-mono text-[11px] text-highlight">{fifth.tag}</p>
                  <h3 className="mt-2 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
                    {fifth.title}
                  </h3>
                  <p className="mt-3 text-pretty leading-relaxed text-muted">
                    {fifth.text}
                  </p>
                </div>
                <ComposeFragment />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
