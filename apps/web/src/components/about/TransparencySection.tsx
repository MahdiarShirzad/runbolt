import { Reveal } from "../landing/Reveal";

type Step = {
  index: string;
  title: string;
  text: string;
  tag: string;
};

const steps: Step[] = [
  {
    index: "01",
    title: "Clear documentation",
    text: "Docs that explain how the product behaves — not just which buttons exist.",
    tag: "docs",
  },
  {
    index: "02",
    title: "Understandable behavior",
    text: "States, retries, and outputs that make sense where you already work.",
    tag: "product",
  },
  {
    index: "03",
    title: "Visible evolution",
    text: "Changes to the product should be legible as the system grows.",
    tag: "change",
  },
  {
    index: "04",
    title: "Developer feedback",
    text: "A direct path from how builders work to what gets shaped next.",
    tag: "signal",
  },
  {
    index: "05",
    title: "Thoughtful iteration",
    text: "Improve what exists with care before adding what doesn't.",
    tag: "iterate",
  },
];

export function TransparencySection() {
  return (
    <section
      className="py-20 sm:py-28"
      aria-labelledby="transparency-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <p className="font-mono text-xs text-highlight">How we build</p>
            <h2
              id="transparency-heading"
              className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Build with transparency.
            </h2>
            <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted">
              Engineering culture shows up in what the product lets you see.
              We care about documentation that stays honest, behavior that
              explains itself, and iteration that developers can follow.
            </p>
            <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted">
              The bar is simple: if you use Runbolt, you should never have to
              guess what it is doing on your behalf.
            </p>
          </Reveal>

          {/* Timeline-inspired visual */}
          <Reveal delay={120}>
            <div className="relative overflow-hidden rounded-xl border border-line bg-surface/60 p-5 sm:p-6">
              <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
              <p className="relative font-mono text-[10.5px] uppercase tracking-widest text-muted/70">
                working principles · continuous loop
              </p>

              <ol className="relative mt-6" aria-label="Transparency principles">
                {steps.map((step, i) => (
                  <li key={step.index} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* vertical rail */}
                    {i < steps.length - 1 ? (
                      <span
                        aria-hidden
                        className="absolute bottom-0 left-[13px] top-8 w-px bg-line"
                      >
                        <span className="rail-pulse absolute left-1/2 h-4 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-highlight to-transparent" />
                      </span>
                    ) : null}

                    <span
                      aria-hidden
                      className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] ${
                        i === 0
                          ? "border-primary/50 bg-primary/15 text-primary"
                          : "border-line bg-raised text-muted"
                      }`}
                    >
                      {step.index}
                    </span>

                    <div className="min-w-0 flex-1 rounded-md border border-transparent px-1 pb-1 transition-colors duration-200 hover:border-line/60 hover:bg-hover/40">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <h3 className="text-sm font-semibold text-fg">
                          {step.title}
                        </h3>
                        <span className="font-mono text-[10px] text-muted/60">
                          {step.tag}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="relative mt-5 border-t border-line/70 pt-4 font-mono text-[10.5px] leading-relaxed text-muted/60">
                A set of ideals we build toward — not a published process or
                fixed roadmap.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
