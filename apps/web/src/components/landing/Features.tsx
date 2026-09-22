import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { CodeIcon, EyeIcon, NodeGraphIcon, PulseIcon, WorkerIcon } from "./icons";

function MiniGraph() {
  return (
    <div className="flex items-center gap-0" aria-hidden>
      {[
        ["Webhook", "border-warn/40 text-warn"],
        ["Condition", "border-accent/40 text-accent"],
        ["Worker", "border-primary/40 text-primary"],
      ].map(([label, cls], i) => (
        <div key={label} className="flex items-center">
          {i > 0 && <span className="h-px w-5 bg-line" />}
          <span
            className={`rounded border bg-code px-2 py-1 font-mono text-[10px] ${cls}`}
          >
            {label}
          </span>
        </div>
      ))}
      <span className="h-px w-5 bg-line" />
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ok/15 text-ok">
        <svg viewBox="0 0 10 10" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="m2 5.5 2 2 4-5" />
        </svg>
      </span>
    </div>
  );
}

function MiniLogs() {
  return (
    <div className="space-y-1 font-mono text-[10px] leading-4" aria-hidden>
      <p>
        <span className="text-info">INFO</span>{" "}
        <span className="text-[#A7B2C9]">step http.request → 200 (171ms)</span>
      </p>
      <p>
        <span className="text-ok">OK&nbsp;&nbsp;</span>{" "}
        <span className="text-[#A7B2C9]">step db.insert committed (94ms)</span>
      </p>
      <p>
        <span className="text-primary">RUN&nbsp;</span>{" "}
        <span className="text-[#A7B2C9]">step worker.enqueue #48213 …</span>
      </p>
    </div>
  );
}

function MiniCode() {
  return (
    <div className="space-y-1 font-mono text-[10px] leading-4" aria-hidden>
      <p>
        <span className="text-accent">const</span>{" "}
        <span className="text-fg">run = </span>
        <span className="text-info">await</span>{" "}
        <span className="text-fg">runbolt.</span>
        <span className="text-highlight">trigger</span>
        <span className="text-[#7C89A6]">(</span>
        <span className="text-ok">&quot;deploy&quot;</span>
        <span className="text-[#7C89A6]">)</span>
      </p>
      <p>
        <span className="text-com text-[#546080]">// → run_9f2ac1e7 · running</span>
      </p>
    </div>
  );
}

function MiniQueue() {
  return (
    <div className="space-y-1.5" aria-hidden>
      {[
        ["w-4/5", "bg-ok/60"],
        ["w-1/2", "bg-primary/70"],
        ["w-3/5", "bg-line"],
      ].map(([w, c], i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-line" />
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-code">
            <span className={`block h-full rounded-full ${w} ${c}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniSpark() {
  return (
    <div aria-hidden>
      <svg viewBox="0 0 160 40" className="h-10 w-full">
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4CC9F0" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4CC9F0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 30 L20 26 L40 28 L60 18 L80 22 L100 12 L120 16 L140 8 L160 10 L160 40 L0 40 Z"
          fill="url(#spark-fill)"
        />
        <path
          d="M0 30 L20 26 L40 28 L60 18 L80 22 L100 12 L120 16 L140 8 L160 10"
          fill="none"
          stroke="#4CC9F0"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <p className="mt-1 font-mono text-[10px] text-muted">
        executions/min <span className="text-fg">12,480</span>
      </p>
    </div>
  );
}

type Feature = {
  icon: ReactNode;
  title: string;
  description: string;
  preview: ReactNode;
  span: string;
};

const features: Feature[] = [
  {
    icon: <NodeGraphIcon width={18} height={18} />,
    title: "Visual Workflow Builder",
    description:
      "Drag, drop, and connect automation nodes. Triggers, conditions, and actions compose into pipelines — no glue code.",
    preview: <MiniGraph />,
    span: "lg:col-span-4",
  },
  {
    icon: <PulseIcon width={18} height={18} />,
    title: "Real-time Execution Monitoring",
    description:
      "Live workflow states, step timings, and failure alerts the moment something breaks.",
    preview: <MiniLogs />,
    span: "lg:col-span-2",
  },
  {
    icon: <CodeIcon width={18} height={18} />,
    title: "Developer-First API",
    description:
      "Trigger and control every workflow from code — a typed SDK, REST endpoints, and predictable webhooks.",
    preview: <MiniCode />,
    span: "lg:col-span-2",
  },
  {
    icon: <WorkerIcon width={18} height={18} />,
    title: "Background Workers",
    description:
      "Heavy jobs run on managed queues with automatic retries and exponential backoff.",
    preview: <MiniQueue />,
    span: "lg:col-span-2",
  },
  {
    icon: <EyeIcon width={18} height={18} />,
    title: "Observability",
    description:
      "Distributed tracing, structured logs, and per-step metrics on every single execution.",
    preview: <MiniSpark />,
    span: "lg:col-span-2",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <article
      className={`group flex flex-col rounded-xl border border-line bg-surface/60 p-5 transition-colors duration-200 hover:border-[#33406a] hover:bg-surface ${feature.span}`}
    >
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-raised text-info transition-colors duration-200 group-hover:border-primary/40 group-hover:text-highlight">
        {feature.icon}
      </div>
      <h3 className="text-[15px] font-semibold tracking-tight">{feature.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        {feature.description}
      </p>
      <div className="mt-5 flex-1 rounded-lg border border-line/60 bg-code/60 p-3.5 pt-4">
        {feature.preview}
      </div>
    </article>
  );
}

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32" aria-labelledby="features-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs text-highlight">Platform</p>
          <h2
            id="features-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Built like the infrastructure you already trust.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 80} className={feature.span}>
              <FeatureCard feature={feature} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
