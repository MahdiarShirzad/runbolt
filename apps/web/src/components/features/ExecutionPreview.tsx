import { Reveal } from "../landing/Reveal";
import { StepIcon, type NodeStatus } from "./shared";

const steps: { label: string; detail: string; dur: string; status: NodeStatus }[] = [
  { label: "Trigger", detail: "webhook · /hooks/crm", dur: "14ms", status: "success" },
  { label: "Validate", detail: "schema · customer.v2", dur: "8ms", status: "success" },
  { label: "HTTP Request", detail: "POST crm.example.com", dur: "204ms", status: "success" },
  { label: "Transform", detail: "map crm → customer", dur: "11ms", status: "success" },
  { label: "Database", detail: "customers · upsert", dur: "—", status: "running" },
  { label: "Worker", detail: "queue: crm-sync", dur: "—", status: "queued" },
];

const logs: [string, string, string][] = [
  ["12:31:04", "INFO", "run #2210 started · trigger webhook"],
  ["12:31:04", " OK ", "validate passed · customer.v2"],
  ["12:31:05", " OK ", "http.sync → 200 OK (204ms)"],
  ["12:31:05", "WARN", "db.upsert retry 1/2 · row lock wait"],
  ["12:31:06", "RUN ", "db.upsert executing …"],
];

function RunPanel() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_80px_-24px_rgba(5,7,12,0.9)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 py-3">
        <p className="font-mono text-xs text-muted">
          runbolt<span className="text-line">/</span>
          <span className="text-fg">customer-sync</span>
        </p>
        <span className="ml-auto flex items-center gap-1.5 rounded border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
          <span className="blink h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          RUNNING
        </span>
      </div>

      {/* Steps */}
      <div className="p-4 sm:p-5">
        <ol className="space-y-1">
          {steps.map((step) => (
            <li
              key={step.label}
              className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors duration-200 hover:bg-hover/60"
            >
              <StepIcon status={step.status} />
              <span className="text-sm font-medium text-fg">{step.label}</span>
              <span className="hidden truncate font-mono text-[10.5px] text-muted sm:inline">
                {step.detail}
              </span>
              <span className="ml-auto font-mono text-[10.5px] text-muted/80">
                {step.dur}
              </span>
            </li>
          ))}
        </ol>

        {/* Meta */}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line/70 pt-4 font-mono text-[10.5px]">
          <div>
            <p className="text-muted/60">duration</p>
            <p className="mt-0.5 text-fg">2m 14s</p>
          </div>
          <div>
            <p className="text-muted/60">started</p>
            <p className="mt-0.5 text-fg">12:31:04 UTC</p>
          </div>
          <div>
            <p className="text-muted/60">retries</p>
            <p className="mt-0.5 text-warn">1</p>
          </div>
        </div>
      </div>

      {/* Logs + output */}
      <div className="border-t border-line/80 bg-code">
        <div className="flex items-center gap-4 border-b border-line/60 px-4">
          <span className="border-b border-highlight py-2.5 text-[11px] font-medium text-fg">
            Logs
          </span>
          <span className="py-2.5 text-[11px] text-muted">Output</span>
        </div>
        <div className="scroll-slim overflow-x-auto p-4 font-mono text-[10.5px] leading-5">
          {logs.map(([time, level, msg], i) => (
            <p key={i} className="whitespace-pre">
              <span className="text-muted/60">{time}</span>{" "}
              <span
                className={
                  level === "OK"
                    ? "text-ok"
                    : level === "WARN"
                      ? "text-warn"
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
        </div>
        <div className="border-t border-line/60 px-4 py-3 font-mono text-[10.5px]">
          <p className="text-muted/60">output</p>
          <p className="mt-1 whitespace-pre">
            <span className="text-highlight">{"{"}</span>{" "}
            <span className="text-highlight">"customerId"</span>
            <span className="text-[#7C89A6]">: </span>
            <span className="text-ok">"cus_123"</span>
            <span className="text-[#7C89A6]">, </span>
            <span className="text-highlight">"synced"</span>
            <span className="text-[#7C89A6]">: </span>
            <span className="text-warn">true</span>{" "}
            <span className="text-highlight">{"}"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function ExecutionPreview() {
  return (
    <section className="py-24 sm:py-32" aria-labelledby="observability-heading">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <Reveal className="lg:order-1">
          <p className="font-mono text-xs text-highlight">Observability</p>
          <h2
            id="observability-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Know what every workflow is doing.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Trace executions from trigger to completion with detailed logs,
            states, outputs, errors, and timing information. When something
            fails, you see exactly which step, why, and what to change.
          </p>
          <ul className="mt-6 space-y-2.5 font-mono text-xs text-muted">
            <li>
              <span className="text-ok">✓</span> per-step status and timings
            </li>
            <li>
              <span className="text-warn">↻</span> retry history with causes
            </li>
            <li>
              <span className="text-highlight">→</span> inputs and outputs of
              every node
            </li>
          </ul>
        </Reveal>

        <Reveal delay={120} className="lg:order-2">
          <RunPanel />
        </Reveal>
      </div>
    </section>
  );
}
