import { Reveal } from "../landing/Reveal";
import { ButtonLink } from "../ui/kit";
import { BookIcon } from "../landing/icons";

const facts: [string, string, string][] = [
  ["open roles", "3", "text-fg"],
  ["locations", "remote", "text-fg"],
  ["stage", "early product", "text-muted"],
  ["interview loop", "4 steps · 2 weeks", "text-fg"],
];

function TeamPanel() {
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_24px_70px_-28px_rgba(3,5,9,0.95)]">
      <div className="ruler flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 pb-2 pt-2.5">
        <p className="font-mono text-[11px] text-muted">
          runbolt<span className="text-line-strong">/</span>
          <span className="text-fg">team</span>
        </p>
        <span className="ml-auto flex items-center gap-1.5 rounded border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
          <span className="blink h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          HIRING
        </span>
      </div>

      <dl className="space-y-1 px-2 py-3">
        {facts.map(([key, value, cls]) => (
          <div
            key={key}
            className="flex items-baseline gap-4 rounded-md px-3 py-2 transition-colors duration-200 hover:bg-hover/60"
          >
            <dt className="font-mono text-[11px] uppercase tracking-wider text-faint">{key}</dt>
            <dd className={`ml-auto font-mono text-[12.5px] ${cls}`}>{value}</dd>
          </div>
        ))}
      </dl>

      <p className="border-t border-line/80 bg-code px-4 py-2.5 font-mono text-[10px] text-faint">
        small team · wide surface · everything you ship is visible to users
      </p>
    </div>
  );
}

const principles: { title: string; text: string }[] = [
  {
    title: "Small team, wide surface",
    text: "Execution engines, builders, CLIs, docs — here, one engineer's work reaches all of it.",
  },
  {
    title: "Write things down",
    text: "Design docs and honest changelogs are how a distributed system stays understandable — including the humans part.",
  },
  {
    title: "Failure is a feature",
    text: "We build tooling that treats failure as a first-class state, and we hold our own work to the same standard.",
  },
  {
    title: "Ship, observe, iterate",
    text: "Every change is observable in production. We improve what exists with care before adding what doesn't.",
  },
];

export function CareersHero() {
  return (
    <section className="relative overflow-hidden pt-14 sm:pt-20" aria-labelledby="careers-heading">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-50" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              <span className="relative mr-2.5 inline-flex h-[7px] w-[7px] items-center justify-center align-middle" aria-hidden>
                <span className="absolute inset-0 border border-volt/60" />
                <span className="h-[3px] w-[3px] bg-volt" />
              </span>
              Careers
            </p>

            <h1
              id="careers-heading"
              className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.06] tracking-[-0.02em] sm:text-5xl lg:text-[56px]"
            >
              Build the layer other systems run on
              <span className="text-primary">.</span>
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              Runbolt is workflow execution infrastructure — queues, state
              machines, and observability that teams trust with serious work.
              It2019s early, the surface is wide, and the problems are real.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#roles">
                See Open Roles
              </ButtonLink>
              <ButtonLink href="/about" variant="secondary">
                <BookIcon width={15} height={15} className="text-muted" />
                Read Our Story
              </ButtonLink>
            </div>
          </div>

          <Reveal delay={200}>
            <TeamPanel />
          </Reveal>
        </div>

        <Reveal delay={120} className="mt-20 sm:mt-24">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              How we work
            </h2>
          </div>
          <ul className="mt-8">
            {principles.map((principle, i) => (
              <li
                key={principle.title}
                className="grid gap-1.5 border-t border-line/70 py-6 sm:grid-cols-[64px_240px_1fr] sm:gap-8"
              >
                <p aria-hidden className="font-mono text-xs leading-6 text-muted/60">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display text-[15px] font-semibold text-fg">
                  {principle.title}
                </h3>
                <p className="max-w-xl text-sm leading-relaxed text-muted">
                  {principle.text}
                </p>
              </li>
            ))}
          </ul>
          <div className="border-t border-line/70" aria-hidden />
        </Reveal>
      </div>
    </section>
  );
}
