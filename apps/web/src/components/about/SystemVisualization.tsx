import { Reveal } from "../landing/Reveal";

type Layer = {
  id: string;
  name: string;
  role: string;
  text: string;
  chips?: { label: string; cls: string }[];
};

const layers: Layer[] = [
  {
    id: "01",
    name: "Triggers",
    role: "entry",
    text: "Schedules, webhooks, and events that start work on your terms.",
    chips: [
      { label: "cron", cls: "text-primary" },
      { label: "webhook", cls: "text-warn" },
      { label: "event", cls: "text-info" },
    ],
  },
  {
    id: "02",
    name: "Workflows",
    role: "definition",
    text: "Readable graphs you compose once and run many times.",
    chips: [
      { label: "graph", cls: "text-highlight" },
      { label: "versioned", cls: "text-muted" },
    ],
  },
  {
    id: "03",
    name: "Nodes",
    role: "building blocks",
    text: "Focused units with clear inputs, outputs, and failure behavior.",
    chips: [
      { label: "http", cls: "text-info" },
      { label: "condition", cls: "text-accent" },
      { label: "database", cls: "text-ok" },
      { label: "transform", cls: "text-highlight" },
    ],
  },
  {
    id: "04",
    name: "Workers",
    role: "execution fabric",
    text: "Run each step, absorb retries, and report state back to the graph.",
    chips: [
      { label: "queue", cls: "text-muted" },
      { label: "retry", cls: "text-warn" },
    ],
  },
  {
    id: "05",
    name: "Executions",
    role: "runs",
    text: "Every run is a traceable sequence of states — queued to done.",
    chips: [
      { label: "queued", cls: "text-muted" },
      { label: "running", cls: "text-primary" },
      { label: "ok", cls: "text-ok" },
    ],
  },
  {
    id: "06",
    name: "Logs",
    role: "records",
    text: "Structured lines, outputs, and timing captured as work happens.",
    chips: [
      { label: "info", cls: "text-info" },
      { label: "output", cls: "text-highlight" },
    ],
  },
  {
    id: "07",
    name: "Results",
    role: "outcome",
    text: "The visible outcome — success, failure, or the next path taken.",
    chips: [
      { label: "result", cls: "text-ok" },
      { label: "next", cls: "text-primary" },
    ],
  },
];

const nodeLegend = [
  { name: "Trigger", cls: "bg-primary", text: "text-primary" },
  { name: "HTTP", cls: "bg-info", text: "text-info" },
  { name: "Condition", cls: "bg-accent", text: "text-accent" },
  { name: "Database", cls: "bg-ok", text: "text-ok" },
  { name: "Webhook", cls: "bg-warn", text: "text-warn" },
  { name: "Worker", cls: "bg-primary", text: "text-primary" },
];

export function SystemVisualization() {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-28"
      aria-labelledby="system-heading"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs text-highlight">Architecture</p>
          <h2
            id="system-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            The Runbolt system.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            One conceptual view of how the pieces fit together — from the
            trigger that starts a run to the result you can inspect.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 overflow-hidden rounded-[10px] border border-line bg-surface/60 shadow-[0_24px_80px_-24px_rgba(3,5,9,0.95)]">
            {/* Poster header */}
            <div className="flex flex-wrap items-center gap-3 border-b border-line/80 bg-raised/60 px-5 py-3">
              <p className="font-mono text-xs text-muted">
                runbolt<span className="text-line">/</span>
                <span className="text-fg">system-map</span>
              </p>
              <span className="ml-auto rounded border border-line bg-code px-2 py-0.5 font-mono text-[10px] text-muted">
                conceptual · not a deployment diagram
              </span>
            </div>

            {/* Layer stack */}
            <div className="relative px-4 py-6 sm:px-6 sm:py-8">
              <div className="bg-grid mask-fade-radial absolute inset-0 opacity-50" aria-hidden />

              <ol className="relative" aria-label="Runbolt system layers">
                {layers.map((layer, i) => (
                  <Reveal as="li" key={layer.id} delay={i * 70}>
                    <div className="relative">
                      {/* connector rail between layers */}
                      {i < layers.length - 1 ? (
                        <span
                          aria-hidden
                          className="absolute bottom-[-10px] left-[19px] top-[38px] w-px bg-line sm:left-[23px]"
                        >
                          <span className="rail-pulse absolute left-1/2 h-5 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary to-transparent" />
                        </span>
                      ) : null}

                      <div className="flex items-start gap-3.5 rounded-lg border border-transparent px-2 py-2.5 transition-colors duration-200 hover:border-line/70 hover:bg-hover/40 sm:gap-4 sm:px-3">
                        <span
                          aria-hidden
                          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-raised font-mono text-[10px] text-highlight sm:h-11 sm:w-11 sm:text-[11px]"
                        >
                          {layer.id}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h3 className="text-[15px] font-semibold text-fg sm:text-base">
                              {layer.name}
                            </h3>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-muted/70">
                              {layer.role}
                            </span>
                          </div>
                          <p className="mt-1 text-[13px] leading-relaxed text-muted sm:text-sm">
                            {layer.text}
                          </p>
                          {layer.chips ? (
                            <ul className="mt-2 flex flex-wrap gap-1.5">
                              {layer.chips.map((chip) => (
                                <li
                                  key={chip.label}
                                  className={`rounded border border-line bg-code px-1.5 py-0.5 font-mono text-[10px] ${chip.cls}`}
                                >
                                  {chip.label}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>

            {/* Node color legend */}
            <div className="border-t border-line/80 bg-code px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
                node colors
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {nodeLegend.map((node) => (
                  <li key={node.name} className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-sm ${node.cls}`} aria-hidden />
                    <span className={`font-mono text-[11px] ${node.text}`}>
                      {node.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
