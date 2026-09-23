import { Reveal } from "../landing/Reveal";

const values: { index: string; title: string; text: string; meta: string }[] = [
  {
    index: "01",
    title: "Clarity",
    text: "Make complex systems easier to understand.",
    meta: "readability · structure · legible state",
  },
  {
    index: "02",
    title: "Speed",
    text: "Reduce the distance between an idea and a working system.",
    meta: "idea → running workflow",
  },
  {
    index: "03",
    title: "Reliability",
    text: "Treat execution behavior and failure handling as first-class concerns.",
    meta: "retries · timeouts · explicit failure states",
  },
  {
    index: "04",
    title: "Craft",
    text: "Obsess over the details that developers interact with every day.",
    meta: "keys · labels · empty states · feedback",
  },
];

export function ValuesSection() {
  return (
    <section
      className="border-y border-line/70 bg-surface/30 py-20 sm:py-28"
      aria-labelledby="values-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs text-highlight">What we value</p>
          <h2
            id="values-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Good software should feel intentional.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Values are only useful when they show up in the product. These are
            the ones we measure decisions against.
          </p>
        </Reveal>

        <ul className="mt-12">
          {values.map((value, i) => (
            <Reveal as="li" key={value.title} delay={i * 80}>
              <article className="group grid gap-3 border-t border-line/70 py-7 sm:grid-cols-[70px_1fr] sm:gap-6 sm:py-8 lg:grid-cols-[70px_minmax(0,280px)_1fr] lg:items-baseline lg:gap-8">
                <p
                  aria-hidden
                  className="font-mono text-xs text-muted/60 lg:text-right"
                >
                  {value.index}
                </p>
                <h3 className="text-2xl font-semibold tracking-tight text-fg transition-colors duration-200 group-hover:text-primary sm:text-3xl">
                  {value.title}
                </h3>
                <div className="lg:flex lg:items-baseline lg:justify-between lg:gap-8">
                  <p className="max-w-md text-pretty leading-relaxed text-muted">
                    {value.text}
                  </p>
                  <p className="mt-2 shrink-0 font-mono text-[11px] text-muted/60 lg:mt-0">
                    {value.meta}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
        <div aria-hidden className="border-t border-line/70" />
      </div>
    </section>
  );
}
