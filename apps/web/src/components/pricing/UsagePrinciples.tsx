import { Reveal } from "../landing/Reveal";

const principles = [
  {
    title: "Transparent pricing",
    description: "No hidden limits or confusing packages.",
  },
  {
    title: "Scale with usage",
    description: "Grow from experiments to production workflows.",
  },
  {
    title: "Developer focused",
    description: "Tools designed around engineering workflows.",
  },
];

export function UsagePrinciples() {
  return (
    <section
      className="border-y border-line/70 bg-surface/40 py-24 sm:py-28"
      aria-labelledby="principles-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <h2
            id="principles-heading"
            className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Built for developers, not complicated billing.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {principles.map((principle, i) => (
            <Reveal key={principle.title} delay={i * 100}>
              <div className="border-l-2 border-primary/40 pl-5">
                <h3 className="text-[15px] font-semibold text-fg">
                  {principle.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {principle.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
