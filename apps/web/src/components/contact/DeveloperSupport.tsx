import { Reveal } from "../landing/Reveal";
import { BookIcon, NodeGraphIcon, CodeIcon } from "../landing/icons";
import { TerminalIcon } from "../security/icons";

const buildingBlocks = [
  { label: "Documentation", icon: <BookIcon width={15} height={15} />, tone: "text-highlight" },
  { label: "Workflow Builder", icon: <NodeGraphIcon width={15} height={15} />, tone: "text-primary" },
  { label: "API", icon: <CodeIcon width={15} height={15} />, tone: "text-accent" },
  { label: "Community", icon: <TerminalIcon width={15} height={15} />, tone: "text-info" },
];

const pillars = [
  {
    title: "Clear documentation",
    text: "Concepts, guides, and API references written so behavior is never a mystery.",
  },
  {
    title: "Understandable workflows",
    text: "Graphs you can read at a glance — nodes, branches, and execution paths in one view.",
  },
  {
    title: "Transparent product behavior",
    text: "States, retries, and outputs visible while work runs, not buried after the fact.",
  },
  {
    title: "Technical resources",
    text: "Examples and references that meet you where you already work — code and terminals.",
  },
];

function DxVisual() {
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-surface/60">
      <div className="border-b border-line/70 bg-raised/50 px-5 py-3">
        <p className="font-mono text-[10.5px] uppercase tracking-widest text-muted/70">
          developer experience · composition
        </p>
      </div>

      <div className="relative px-5 py-6">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-40" aria-hidden />

        <ul className="relative space-y-2.5">
          {buildingBlocks.map((block, i) => (
            <Reveal as="li" key={block.label} delay={i * 80}>
              <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-md border border-line bg-raised ${block.tone}`}>
                  {block.icon}
                </span>
                <span className="text-sm font-medium text-fg">{block.label}</span>
                {i < buildingBlocks.length - 1 ? (
                  <span className="ml-auto font-mono text-[11px] text-muted/60" aria-hidden>
                    +
                  </span>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ul>

        <div aria-hidden className="relative my-4 flex justify-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-raised font-mono text-[11px] text-highlight">
            ↓
          </span>
        </div>

        <Reveal delay={320}>
          <div className="relative rounded-lg border border-primary/40 bg-primary/10 px-4 py-4 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
              result
            </p>
            <p className="mt-1.5 text-lg font-semibold tracking-tight text-fg">
              Developer Experience
            </p>
          </div>
        </Reveal>
      </div>

      <p className="border-t border-line/70 bg-code px-5 py-2.5 font-mono text-[10px] text-muted/70">
        Conceptual composition — how the pieces add up.
      </p>
    </div>
  );
}

export function DeveloperSupport() {
  return (
    <section
      className="border-y border-line/70 bg-surface/30 py-20 sm:py-28"
      aria-labelledby="dev-support-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="font-mono text-xs text-highlight">Developer support</p>
              <h2
                id="dev-support-heading"
                className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Built around developers.
              </h2>
              <p className="mt-5 text-pretty leading-relaxed text-muted">
                Reaching out should not feel like opening a ticket into a void.
                Runbolt is designed so that most answers live in the product
                surface itself — docs you can trust, workflows you can read,
                and behavior you can inspect.
              </p>
            </Reveal>

            <ul className="mt-8 space-y-5">
              {pillars.map((pillar, i) => (
                <Reveal as="li" key={pillar.title} delay={80 + i * 70}>
                  <div className="border-t border-line/70 pt-5">
                    <div className="flex items-baseline gap-3">
                      <span aria-hidden className="font-mono text-[11px] text-muted/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-[15px] font-semibold text-fg">
                          {pillar.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                          {pillar.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal delay={120}>
            <DxVisual />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
