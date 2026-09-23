import { Reveal } from "../landing/Reveal";

const runWords = ["execution", "movement", "work", "automation"];
const boltWords = ["speed", "energy", "action", "instant execution"];

function WordColumn({
  word,
  words,
  accent = false,
}: {
  word: string;
  words: string[];
  accent?: boolean;
}) {
  return (
    <div className="flex-1">
      <p
        className={`font-mono text-[11px] uppercase tracking-[0.2em] ${
          accent ? "text-primary" : "text-highlight"
        }`}
      >
        {accent ? "+" : "·"} {word}
      </p>
      <p
        className={`mt-3 text-4xl font-semibold tracking-[0.35em] sm:text-5xl ${
          accent ? "text-primary" : "text-fg"
        }`}
        aria-hidden
      >
        {word}
      </p>
      <span className="sr-only">{word}</span>
      <ul className="mt-5 space-y-2">
        {words.map((w) => (
          <li
            key={w}
            className="flex items-center gap-2.5 font-mono text-[12.5px] text-muted"
          >
            <span
              className={`h-1 w-1 rounded-full ${accent ? "bg-primary" : "bg-highlight"}`}
              aria-hidden
            />
            {w}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NameSection() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="name-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-mono text-xs text-highlight">The name</p>
            <h2
              id="name-heading"
              className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Why Runbolt?
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted">
              The name is a pairing of two ideas at the core of the product:
              work that executes, and work that moves the moment it should.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-12 overflow-hidden rounded-xl border border-line bg-surface/50">
            <div className="grid divide-y divide-line/70 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="p-6 sm:p-8">
                <WordColumn word="RUN" words={runWords} />
              </div>
              <div className="p-6 sm:p-8">
                <WordColumn word="BOLT" words={boltWords} accent />
              </div>
            </div>

            {/* RUN + BOLT → RUNBOLT */}
            <div className="border-t border-line/70 bg-code px-6 py-8 text-center sm:px-8 sm:py-10">
              <p className="font-mono text-[11px] text-muted/70">name · composition</p>
              <p className="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
                <span className="text-3xl font-semibold tracking-[0.3em] text-fg sm:text-4xl">
                  RUN
                </span>
                <span className="text-xl text-muted sm:text-2xl" aria-hidden>
                  +
                </span>
                <span className="text-3xl font-semibold tracking-[0.3em] text-primary sm:text-4xl">
                  BOLT
                </span>
                <span className="text-xl text-muted sm:text-2xl" aria-hidden>
                  →
                </span>
                <span className="bg-gradient-to-r from-primary via-highlight to-primary bg-clip-text text-3xl font-bold tracking-[0.22em] text-transparent sm:text-4xl">
                  RUNBOLT
                </span>
              </p>
              <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted">
                Execution with energy — automation that runs with intent and
                responds the moment it matters.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <p className="mt-3 text-center font-mono text-[10.5px] text-muted/60">
            A reading of the name — not a trademark history.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
