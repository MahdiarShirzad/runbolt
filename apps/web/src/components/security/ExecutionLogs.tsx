import { Reveal } from "../landing/Reveal";

const entries: [string, string, string][] = [
  ["14:32:04", "INFO", "workflow started · trigger webhook"],
  ["14:32:05", "INFO", "HTTP request completed"],
  ["14:32:05", "INFO", "database operation completed"],
  ["14:32:06", "WARN", "retry scheduled"],
  ["14:32:08", "INFO", "workflow completed"],
];

const levelCls: Record<string, string> = {
  INFO: "text-info",
  WARN: "text-warn",
  ERROR: "text-bad",
  OK: "text-ok",
};

function LogsPanel() {
  return (
    <div>
      <div className="overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_24px_80px_-24px_rgba(3,5,9,0.95)]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 py-3">
          <p className="font-mono text-xs text-muted">
            runbolt<span className="text-line-strong">/</span>
            <span className="text-fg">logs</span>
          </p>
          <span className="ml-auto rounded border border-line bg-raised px-2 py-0.5 font-mono text-[10px] text-muted">
            sample
          </span>
        </div>

        {/* Log stream */}
        <div className="scroll-slim overflow-x-auto bg-code px-4 py-4 font-mono text-[10.5px] leading-6">
          {entries.map(([time, level, msg], i) => (
            <p key={i} className="whitespace-pre">
              <span className="text-muted/50">{time}</span>{" "}
              <span className={levelCls[level]}>{level.padEnd(4)}</span>{" "}
              <span className="text-code-text">{msg}</span>
            </p>
          ))}
        </div>

        {/* Footer meta */}
        <p className="border-t border-line/80 bg-raised/40 px-4 py-2.5 font-mono text-[10px] text-muted/70">
          run_91f4 · 5 entries · states, errors, and timings per step
        </p>
      </div>
      <p className="mt-3 font-mono text-[10.5px] text-muted/60">
        Example stream — sample data, not a live feed.
      </p>
    </div>
  );
}

export function ExecutionLogs() {
  return (
    <section id="observability" className="py-20 sm:py-28" aria-labelledby="observability-heading">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="font-mono text-xs text-highlight">Observability</p>
          <h2
            id="observability-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Visibility is part of security.
          </h2>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted">
            Logs, execution states, errors, and audit-oriented information help
            teams understand what happened during workflow execution — what ran,
            what failed, and what changed.
          </p>
          <ul className="mt-6 space-y-2.5 font-mono text-xs text-muted">
            <li>
              <span className="text-ok">✓</span> states, retries, and timings per
              run
            </li>
            <li>
              <span className="text-ok">✓</span> errors with step-level context
            </li>
            <li>
              <span className="text-ok">✓</span> history you can review after the
              fact
            </li>
          </ul>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted/80">
            Because logs can contain sensitive workflow data, treat log access
            as part of your access model — the same &ldquo;who can see
            this&rdquo; questions apply.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <LogsPanel />
        </Reveal>
      </div>
    </section>
  );
}
