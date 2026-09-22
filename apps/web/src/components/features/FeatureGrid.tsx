import type { ReactNode } from "react";
import { FeatureCard, type Feature } from "../landing/Features";
import { Reveal } from "../landing/Reveal";
import {
  CheckIcon,
  CodeIcon,
  EyeIcon,
  NodeGraphIcon,
  PulseIcon,
  RetryIcon,
  WorkerIcon,
} from "../landing/icons";

/* 1 · Visual Workflow Builder — mini canvas with a drop slot */
function PreviewBuilder() {
  return (
    <div className="flex flex-wrap items-center gap-y-2" aria-hidden>
      <span className="rounded border border-warn/40 bg-code px-2 py-1 font-mono text-[10px] text-warn">
        Webhook
      </span>
      <span className="h-px w-4 bg-line" />
      <span className="rounded border border-accent/40 bg-code px-2 py-1 font-mono text-[10px] text-accent">
        Condition
      </span>
      <span className="h-px w-4 bg-line" />
      <span className="rounded border border-primary/40 bg-code px-2 py-1 font-mono text-[10px] text-primary">
        Worker
      </span>
      <span className="h-px w-4 border-t border-dashed border-line" />
      <span className="flex h-6 w-9 items-center justify-center rounded border border-dashed border-line font-mono text-[10px] text-muted/60">
        +
      </span>
    </div>
  );
}

/* 2 · Real-time Execution — status timeline */
function PreviewTimeline() {
  const rows: [string, number, number, string][] = [
    ["trigger", 1, 6, "bg-warn/70"],
    ["http.sync", 8, 22, "bg-info/70"],
    ["db.upsert", 31, 14, "bg-ok/70"],
    ["worker", 46, 42, "bg-primary/70"],
  ];
  return (
    <div className="space-y-1.5" aria-hidden>
      {rows.map(([label, left, width, color]) => (
        <div key={label} className="flex items-center gap-2.5">
          <span className="w-16 shrink-0 truncate font-mono text-[9.5px] text-muted">
            {label}
          </span>
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink">
            <span
              className={`absolute inset-y-0 rounded-full ${color}`}
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* 3 · Powerful Integrations — node/service selector */
function PreviewIntegrations() {
  const services: [string, string, string][] = [
    ["PostgreSQL", "bg-ok", "Database"],
    ["Stripe", "bg-info", "HTTP"],
    ["Slack", "bg-accent", "Webhook"],
    ["GitHub", "bg-muted", "Trigger"],
  ];
  return (
    <div aria-hidden>
      <div className="flex items-center gap-2 rounded-md border border-line bg-ink px-2.5 py-1.5">
        <svg viewBox="0 0 16 16" className="h-3 w-3 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="7" cy="7" r="4.5" />
          <path d="m10.5 10.5 3 3" strokeLinecap="round" />
        </svg>
        <span className="text-[10px] text-muted/60">Search integrations…</span>
      </div>
      <ul className="mt-2 space-y-0.5">
        {services.map(([name, dot, kind]) => (
          <li
            key={name}
            className="flex items-center gap-2 rounded px-1.5 py-1 text-[10.5px] text-[#A7B2C9]"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            <span>{name}</span>
            <span className="ml-auto font-mono text-[9px] text-muted/60">{kind}</span>
            <CheckIcon width={10} height={10} className="text-ok" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 4 · Background Workers — worker execution panel */
function PreviewWorkers() {
  const jobs: [string, ReactNode][] = [
    ["fulfillment.job #48213", <span key="r" className="spin inline-block h-2 w-2 rounded-full border-[1.5px] border-primary border-t-transparent" />],
    ["fulfillment.job #48212", <CheckIcon key="o" width={10} height={10} className="text-ok" />],
    ["email.digest #9071", <RetryIcon key="w" width={10} height={10} className="text-warn" />],
  ];
  return (
    <ul className="space-y-1" aria-hidden>
      {jobs.map(([label, icon]) => (
        <li
          key={label}
          className="flex items-center gap-2 rounded border border-line/60 bg-ink px-2 py-1.5 font-mono text-[9.5px] text-[#A7B2C9]"
        >
          {icon}
          {label}
          <span className="ml-auto text-muted/50">worker-3</span>
        </li>
      ))}
    </ul>
  );
}

/* 5 · Observability — terminal / log interface */
function PreviewLogs() {
  return (
    <div className="space-y-1 font-mono text-[10px] leading-4" aria-hidden>
      <p>
        <span className="text-info">INFO</span>{" "}
        <span className="text-[#A7B2C9]">http.sync → 200 OK (204ms)</span>
      </p>
      <p>
        <span className="text-warn">WARN</span>{" "}
        <span className="text-[#A7B2C9]">db.upsert retry 1/2 · deadlock</span>
      </p>
      <p>
        <span className="text-ok">OK&nbsp;&nbsp;</span>{" "}
        <span className="text-[#A7B2C9]">db.upsert committed (96ms)</span>
      </p>
      <p>
        <span className="text-highlight">▍</span>
      </p>
    </div>
  );
}

/* 6 · Developer-first API — code / request panel */
function PreviewApi() {
  return (
    <div className="space-y-1 font-mono text-[10px] leading-4" aria-hidden>
      <p>
        <span className="text-muted/60">$</span>{" "}
        <span className="text-info">curl</span>{" "}
        <span className="text-[#A7B2C9]">-X POST api.runbolt.dev/v1/runs \</span>
      </p>
      <p className="pl-4">
        <span className="text-highlight">"workflowId"</span>
        <span className="text-[#7C89A6]">: </span>
        <span className="text-ok">"customer-sync"</span>
        <span className="text-[#7C89A6]">,</span>
      </p>
      <p className="pl-4">
        <span className="text-highlight">"input"</span>
        <span className="text-[#7C89A6]">: {"{ … }"}</span>
      </p>
      <p>
        <span className="text-muted/60">→</span>{" "}
        <span className="text-accent">201</span>{" "}
        <span className="text-[#A7B2C9]">run_7c31aa92 · running</span>
      </p>
    </div>
  );
}

const features: Feature[] = [
  {
    icon: <NodeGraphIcon width={18} height={18} />,
    title: "Visual Workflow Builder",
    description:
      "Design complex workflows visually with composable nodes and clear execution paths.",
    preview: <PreviewBuilder />,
    span: "",
  },
  {
    icon: <PulseIcon width={18} height={18} />,
    title: "Real-time Execution",
    description: "See exactly what your workflows are doing as they run.",
    preview: <PreviewTimeline />,
    span: "",
  },
  {
    icon: <GlobeIconSmall />,
    title: "Powerful Integrations",
    description:
      "Connect APIs, databases, webhooks, and external services without unnecessary complexity.",
    preview: <PreviewIntegrations />,
    span: "",
  },
  {
    icon: <WorkerIcon width={18} height={18} />,
    title: "Background Workers",
    description:
      "Run long-running and resource-intensive jobs reliably in the background.",
    preview: <PreviewWorkers />,
    span: "",
  },
  {
    icon: <EyeIcon width={18} height={18} />,
    title: "Observability",
    description:
      "Inspect logs, execution states, errors, retries, and outputs from one place.",
    preview: <PreviewLogs />,
    span: "",
  },
  {
    icon: <CodeIcon width={18} height={18} />,
    title: "Developer-First API",
    description:
      "Control workflows programmatically and integrate Runbolt into your existing infrastructure.",
    preview: <PreviewApi />,
    span: "",
  },
];

function GlobeIconSmall() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19M12 2.5c2.6 2.6 4 6 4 9.5s-1.4 6.9-4 9.5c-2.6-2.6-4-6-4-9.5s1.4-6.9 4-9.5Z" />
    </svg>
  );
}

export function FeatureGrid() {
  return (
    <section className="py-24 sm:py-32" aria-labelledby="capabilities-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs text-highlight">Capabilities</p>
          <h2
            id="capabilities-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Built for modern workflows.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            From the first trigger to the final execution, Runbolt gives you the
            building blocks to automate complex engineering workflows.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 3) * 80}>
              <FeatureCard feature={feature} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
