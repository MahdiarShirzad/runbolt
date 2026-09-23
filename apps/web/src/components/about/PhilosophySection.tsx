import { Reveal } from "../landing/Reveal";
import { ArrowRightIcon } from "../landing/icons";

const traits: { label: string; text: string }[] = [
  { label: "composable", text: "Built from focused pieces you can rearrange." },
  { label: "understandable", text: "Readable structure, not hidden magic." },
  { label: "observable", text: "States and outputs visible while it runs." },
  { label: "testable", text: "Behavior you can verify before it matters." },
  { label: "reusable", text: "Patterns that carry across workflows." },
  { label: "operationally clear", text: "Failures and retries behave predictably." },
];

const traditional = ["opaque", "fragmented", "hard to debug"];
const approach = ["visual", "composable", "observable"];

export function PhilosophySection() {
  return (
    <section
      className="py-20 sm:py-28"
      aria-labelledby="philosophy-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="font-mono text-xs text-highlight">The idea</p>
              <h2
                id="philosophy-heading"
                className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Build workflows like you build software.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-5 max-w-lg text-pretty leading-relaxed text-muted">
                The philosophy behind Runbolt is simple: automated workflows
                deserve the same care as the rest of your codebase. They
                should be structured, inspectable, and designed to last — not
                assembled as one-off scripts that only make sense to their
                author.
              </p>
            </Reveal>
          </div>

          <Reveal delay={140}>
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {traits.map((trait) => (
                <li key={trait.label} className="border-t border-line/70 pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-highlight">
                    {trait.label}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {trait.text}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Philosophy comparison */}
        <Reveal delay={120}>
          <div className="mt-14 overflow-hidden rounded-xl border border-line bg-surface/60">
            <div className="border-b border-line/70 bg-raised/50 px-5 py-3">
              <p className="font-mono text-[10.5px] uppercase tracking-widest text-muted/70">
                product philosophy · how we frame the tradeoffs
              </p>
            </div>

            <div className="grid md:grid-cols-[1fr_auto_1fr]">
              {/* Traditional */}
              <div className="p-6 sm:p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted/70">
                  Traditional automation
                </p>
                <ul className="mt-5 space-y-3">
                  {traditional.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted/50"
                        aria-hidden
                      />
                      <span className="text-lg text-muted line-through decoration-line">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Arrow */}
              <div
                aria-hidden
                className="flex items-center justify-center border-line px-4 md:border-x md:border-y-0 md:px-0"
              >
                <span className="flex h-10 w-10 rotate-90 items-center justify-center rounded-full border border-line bg-raised text-highlight md:rotate-0">
                  <ArrowRightIcon width={16} height={16} />
                </span>
              </div>

              {/* Runbolt */}
              <div className="border-t border-line/70 p-6 sm:p-8 md:border-t-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
                  Runbolt approach
                </p>
                <ul className="mt-5 space-y-3">
                  {approach.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                        aria-hidden
                      />
                      <span className="text-lg font-medium text-fg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="border-t border-line/70 bg-code px-5 py-3 font-mono text-[10.5px] leading-relaxed text-muted/70">
              A statement of product philosophy — not a benchmark or a claim
              about other tools.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
