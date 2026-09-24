import Link from "next/link";
import { Reveal } from "../landing/Reveal";
import { BookIcon, CheckIcon } from "../landing/icons";

type PathNode = {
  name: string;
  /** mono metadata shown under the node name */
  detail: string;
  /** small state pill on the right */
  state?: string;
  stateCls?: string;
  /** color role for the icon chip */
  tone: "flow" | "protected" | "success" | "running";
  /** one-line explanation of what this stage represents */
  note: string;
};

const chipCls: Record<PathNode["tone"], string> = {
  flow: "border-line bg-raised text-primary",
  protected: "border-accent/30 bg-accent/10 text-accent",
  success: "border-ok/30 bg-ok/10 text-ok",
  running: "border-primary/40 bg-primary/10 text-primary pulse-primary",
};

const statePillCls: Record<string, string> = {
  ok: "border-ok/30 bg-ok/10 text-ok",
  accent: "border-accent/30 bg-accent/10 text-accent",
  primary: "border-primary/30 bg-primary/10 text-primary",
  muted: "border-line bg-raised text-muted",
};

const pathNodes: PathNode[] = [
  {
    name: "User",
    detail: "principal · usr_8f21",
    state: "context",
    stateCls: "muted",
    tone: "flow",
    note: "Every run starts with an identity.",
  },
  {
    name: "Authentication",
    detail: "session · verified",
    state: "verified",
    stateCls: "ok",
    tone: "success",
    note: "Identity is checked before anything runs.",
  },
  {
    name: "Workflow",
    detail: "workflow · deploy-report",
    state: "v12",
    stateCls: "muted",
    tone: "flow",
    note: "The definition is loaded from your project.",
  },
  {
    name: "Secrets",
    detail: "values never inlined",
    state: "3 refs",
    stateCls: "accent",
    tone: "protected",
    note: "Referenced by name, kept apart from logic.",
  },
  {
    name: "Execution",
    detail: "state · step 3/5",
    state: "running",
    stateCls: "primary",
    tone: "running",
    note: "Each step is observed as it happens.",
  },
  {
    name: "External Services",
    detail: "scoped request",
    state: "200 OK",
    stateCls: "ok",
    tone: "success",
    note: "Calls leave with only the context you send.",
  },
];

function TrustedPathPanel() {
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_24px_80px_-24px_rgba(3,5,9,0.95)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 py-3">
        <p className="font-mono text-xs text-muted">
          runbolt<span className="text-line-strong">/</span>
          <span className="text-fg">secure-path</span>
        </p>
        <span className="ml-auto flex items-center gap-1.5 rounded border border-info/30 bg-info/10 px-2 py-0.5 font-mono text-[10px] text-info">
          <span className="h-1.5 w-1.5 rounded-full bg-info" aria-hidden />
          TRUSTED PATH
        </span>
      </div>

      {/* Node sequence */}
      <div className="relative p-4 sm:p-5">
        <div
          aria-hidden
          className="absolute bottom-8 left-[27px] top-8 w-px bg-gradient-to-b from-line via-line to-transparent"
        >
          <span className="rail-pulse absolute left-1/2 h-7 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary to-transparent" />
        </div>
        <ol className="space-y-1">
          {pathNodes.map((node, i) => (
            <Reveal as="li" key={node.name} delay={i * 90}>
              <div className="relative flex gap-3 rounded-md px-1.5 py-2 transition-colors duration-200 hover:bg-hover/50">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${chipCls[node.tone]}`}
                >
                  {node.tone === "success" ? (
                    <CheckIcon width={12} height={12} />
                  ) : (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        node.tone === "protected"
                          ? "bg-accent"
                          : node.tone === "running"
                            ? "blink bg-primary"
                            : "bg-primary"
                      }`}
                    />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-fg">{node.name}</span>
                    {node.state ? (
                      <span
                        className={`ml-auto flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9.5px] ${
                          statePillCls[node.stateCls ?? "muted"]
                        }`}
                      >
                        {node.state === "running" && (
                          <span className="blink h-1 w-1 rounded-full bg-current" aria-hidden />
                        )}
                        {node.state}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[10.5px] text-muted">
                    <span className="text-highlight/80">{node.detail}</span>
                    <span className="text-muted/60"> — {node.note}</span>
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>

      {/* Footer note */}
      <p className="border-t border-line/80 bg-code px-4 py-2.5 font-mono text-[10px] text-muted/70">
        Conceptual flow — the stages Runbolt makes visible on a run.
      </p>
    </div>
  );
}

export function SecurityHero() {
  return (
    <section className="relative overflow-hidden pt-14 sm:pt-20" aria-labelledby="security-hero-heading">
      {/* Background atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-50" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                <span className="relative mr-2.5 inline-flex h-[7px] w-[7px] items-center justify-center align-middle" aria-hidden>
                  <span className="absolute inset-0 border border-volt/60" />
                  <span className="h-[3px] w-[3px] bg-volt" />
                </span>
                Security at Runbolt
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h1
                id="security-hero-heading"
                className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl lg:text-[56px]"
              >
                Security built into the workflow.
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
                Runbolt is designed to give developers control over workflows,
                credentials, executions, and the systems they connect. This page
                describes how that approach works — and where it is headed.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/docs"
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px"
                >
                  <BookIcon width={15} height={15} />
                  Read the Documentation
                </Link>
                <a
                  href="mailto:hello@runbolt.dev"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface/70 px-6 text-sm font-medium text-fg transition-colors duration-200 hover:border-line-strong hover:bg-hover"
                >
                  Contact Us
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <TrustedPathPanel />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
