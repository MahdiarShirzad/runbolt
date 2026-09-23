import { Reveal } from "../landing/Reveal";
import type { NodeStatus } from "../features/shared";

const statusPill: Record<NodeStatus, { label: string; cls: string; blink?: boolean }> = {
  success: { label: "succeeded", cls: "border-ok/30 bg-ok/10 text-ok" },
  running: { label: "running", cls: "border-primary/30 bg-primary/10 text-primary", blink: true },
  retrying: { label: "retrying", cls: "border-warn/30 bg-warn/10 text-warn", blink: true },
  queued: { label: "queued", cls: "border-line bg-raised text-muted" },
  skipped: { label: "skipped", cls: "border-line bg-raised text-muted" },
};

type IsolatedWorkflow = {
  name: string;
  status: NodeStatus;
  rows: [string, string][];
  lines: [string, string, string][];
};

const workflows: IsolatedWorkflow[] = [
  {
    name: "workflow-a",
    status: "success",
    rows: [
      ["state", "succeeded"],
      ["inputs", "2 params"],
      ["outputs", "1 result"],
      ["logs", "14 lines"],
    ],
    lines: [
      ["14:02:11", "OK", "http 200 · crm.example.com"],
      ["14:02:12", "OK", "workflow completed"],
    ],
  },
  {
    name: "workflow-b",
    status: "running",
    rows: [
      ["state", "running · step 2/4"],
      ["inputs", "1 param"],
      ["outputs", "pending"],
      ["logs", "7 lines"],
    ],
    lines: [
      ["14:04:03", "RUN", "transform · map payload"],
      ["14:04:05", "RUN", "db.upsert executing …"],
    ],
  },
  {
    name: "workflow-c",
    status: "retrying",
    rows: [
      ["state", "retry 1/3"],
      ["inputs", "3 params"],
      ["outputs", "pending"],
      ["logs", "21 lines"],
    ],
    lines: [
      ["14:05:40", "WARN", "timeout · retry scheduled"],
      ["14:05:42", "RUN", "http.sync attempt 2 …"],
    ],
  },
];

const levelCls: Record<string, string> = {
  OK: "text-ok",
  RUN: "text-primary",
  WARN: "text-warn",
  INFO: "text-info",
};

function IsolationPanel({ workflow }: { workflow: IsolatedWorkflow }) {
  const pill = statusPill[workflow.status];
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface/60 transition-colors duration-200 hover:border-[#3a466b]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-dashed border-line/70 px-4 py-3">
        <p className="font-mono text-xs text-fg">{workflow.name}</p>
        <span
          className={`ml-auto flex items-center gap-1.5 rounded-full border px-1.5 py-0.5 font-mono text-[9.5px] ${pill.cls}`}
        >
          {pill.blink && <span className="blink h-1 w-1 rounded-full bg-current" aria-hidden />}
          {pill.label}
        </span>
      </div>

      {/* State / inputs / outputs / logs */}
      <dl className="space-y-1.5 px-4 py-3.5 font-mono text-[10.5px]">
        {workflow.rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline gap-3">
            <dt className="w-14 shrink-0 text-muted/60">{label}</dt>
            <dd className={label === "state" && workflow.status !== "success" ? "text-fg" : "text-fg/90"}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Log excerpt */}
      <div className="scroll-slim overflow-x-auto border-t border-dashed border-line/70 bg-code px-4 py-3">
        <p className="sr-only">Log excerpt for {workflow.name}</p>
        {workflow.lines.map(([time, level, msg]) => (
          <p key={time + level} className="whitespace-pre font-mono text-[10px] leading-5">
            <span className="text-muted/50">{time}</span>{" "}
            <span className={levelCls[level]}>{level.padEnd(4)}</span>{" "}
            <span className="text-[#C9D2E3]">{msg}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function WorkflowIsolation() {
  return (
    <section id="isolation" className="py-20 sm:py-28" aria-labelledby="isolation-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs text-highlight">Isolation</p>
          <h2
            id="isolation-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Keep workflow execution boundaries clear.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Each workflow keeps its own execution state, inputs, outputs, and
            logs. Clear execution boundaries help reduce accidental coupling and
            improve operational clarity — every run is attributable to exactly
            one workflow.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {workflows.map((workflow, i) => (
            <Reveal key={workflow.name} delay={i * 110}>
              <IsolationPanel workflow={workflow} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
