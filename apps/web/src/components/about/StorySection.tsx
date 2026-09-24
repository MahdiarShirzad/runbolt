import { Reveal } from "../landing/Reveal";

const fragments: { text: string; cls: string; pos: string }[] = [
  {
    text: "cron → queue → script → dashboard",
    cls: "left-[4%] top-[14%] rotate-[-2deg]",
    pos: "",
  },
  {
    text: "step 3/5 · running",
    cls: "right-[6%] top-[26%] rotate-[1.5deg]",
    pos: "",
  },
  {
    text: "debug: which log?",
    cls: "left-[10%] bottom-[22%] rotate-[1deg]",
    pos: "",
  },
  {
    text: "retry ?? timeout ?? silent pass",
    cls: "right-[8%] bottom-[16%] rotate-[-1.5deg]",
    pos: "",
  },
];

export function StorySection() {
  return (
    <section
      className="relative overflow-hidden border-y border-line/70 bg-surface/30 py-20 sm:py-28"
      aria-labelledby="story-heading"
    >
      {/* Interface fragments in the background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0 opacity-[0.35]" />
        {fragments.map((f) => (
          <span
            key={f.text}
            className={`absolute hidden rounded-md border border-line/60 bg-code/70 px-2.5 py-1 font-mono text-[10px] text-muted/50 lg:block ${f.cls}`}
          >
            {f.text}
          </span>
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="font-mono text-xs text-highlight">Why Runbolt exists</p>
              <h2
                id="story-heading"
                className="mt-4 text-balance text-3xl font-semibold leading-[1.12] tracking-tight sm:text-4xl lg:text-[42px]"
              >
                Automation became powerful.
                <span className="mt-1 block text-muted">
                  It also became complicated.
                </span>
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <div
                aria-hidden
                className="mt-8 h-px w-16 bg-gradient-to-r from-primary to-transparent"
              />
              <p className="mt-6 max-w-md font-mono text-[11px] leading-relaxed text-muted/70">
                problem_space
                <span className="text-line"> · </span>
                complexity
                <span className="text-line"> · </span>
                fragmentation
                <span className="text-line"> · </span>
                opacity
              </p>
            </Reveal>
          </div>

          <div className="space-y-5">
            <Reveal delay={80}>
              <p className="text-pretty text-base leading-relaxed text-muted sm:text-lg">
                Automation can now reach almost anything — services, queues,
                schedules, internal tools. But as it grows, so does the
                machinery around it. Workflows scatter across scripts, cron
                jobs, background jobs, and dashboards, each solving one piece
                while none of them show the whole.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-pretty leading-relaxed text-muted">
                Execution behavior often stays hidden until something breaks.
                Debugging becomes an exercise in stitching together logs from
                different places, and operational visibility is treated as an
                afterthought instead of a default part of the system.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="text-pretty leading-relaxed text-muted">
                Runbolt exists to bring that system back into focus: one place
                to design workflows, run them, and understand exactly what
                happened — from the first trigger to the final result.
              </p>
            </Reveal>

            <Reveal delay={320}>
              <ul className="flex flex-wrap gap-2 pt-2" aria-label="Problems Runbolt addresses">
                {[
                  "growing complexity",
                  "fragmented tools",
                  "hidden execution",
                  "hard debugging",
                  "unclear visibility",
                ].map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-line bg-code px-2.5 py-1 font-mono text-[10.5px] text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
