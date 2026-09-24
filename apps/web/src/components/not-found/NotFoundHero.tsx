import Link from "next/link";
import { Reveal } from "../landing/Reveal";
import { BoltIcon, CloseIcon } from "../landing/icons";

/**
 * Failed-workflow visual: a short execution graph that dies at an unknown route.
 * Trigger → (broken edge) → 404 node → Missing Route
 */
function FailureGraph() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_80px_-24px_rgba(5,7,12,0.9)]">
      <div className="flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 py-2.5">
        <p className="truncate font-mono text-xs text-muted">
          runbolt<span className="text-line-strong">/</span>
          <span className="text-fg">router</span>
          <span className="text-line-strong">/</span>
          <span className="text-bad">resolve</span>
        </p>
        <span className="ml-auto flex items-center gap-1.5 rounded border border-bad/35 bg-bad/10 px-2 py-0.5 font-mono text-[10px] text-bad">
          <span className="h-1.5 w-1.5 rounded-full bg-bad" aria-hidden />
          FAILED
        </span>
      </div>

      <div className="relative px-5 py-7 sm:px-8 sm:py-9">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-55" aria-hidden />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[220px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(240,68,56,0.1),transparent)] blur-2xl"
        />

        {/* Desktop: vertical rail with break */}
        <ol className="relative mx-auto w-full max-w-sm" aria-label="Failed route resolution">
          {/* healthy rail (top) */}
          <span
            aria-hidden
            className="absolute left-[7px] top-3 h-[52px] w-px bg-line"
          />
          {/* broken segment */}
          <span
            aria-hidden
            className="absolute left-[7px] top-[72px] h-[36px] w-px border-l border-dashed border-bad/50"
          />
          {/* lower rail */}
          <span
            aria-hidden
            className="absolute bottom-10 left-[7px] top-[116px] w-px bg-line/50"
          />

          {/* Trigger — active start */}
          <li className="relative pb-4 pl-8">
            <span
              className="absolute left-0 top-1.5 h-[15px] w-[15px] -translate-y-0 rounded-full border-2 border-ink bg-primary"
              aria-hidden
            />
            <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface/95 px-3 py-2 backdrop-blur-sm">
              <span className="text-primary">
                <BoltIcon width={13} height={13} />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-xs font-medium text-fg">Trigger</span>
                <span className="block truncate font-mono text-[9.5px] text-muted">
                  request · GET
                </span>
              </span>
              <span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] text-primary">
                ok
              </span>
            </div>
          </li>

          {/* Break marker */}
          <li className="relative flex items-center gap-3 pb-4 pl-8" aria-hidden>
            <span className="absolute left-0 top-1/2 flex h-[15px] w-[15px] -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink bg-bad/20 text-bad">
              <CloseIcon width={8} height={8} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-bad/80">
              edge · unresolved
            </span>
          </li>

          {/* 404 node — failed */}
          <li className="relative pb-4 pl-8">
            <span
              className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-ink bg-bad"
              aria-hidden
            />
            <div className="rounded-lg border border-bad/50 bg-surface/95 px-3 py-2.5 backdrop-blur-sm shadow-[0_0_24px_-6px_rgba(240,68,56,0.35)]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-bold tracking-tight text-bad sm:text-3xl">
                  404
                </span>
                <span className="ml-auto rounded border border-bad/35 bg-bad/10 px-1.5 py-0.5 font-mono text-[9px] text-bad">
                  FAILED
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted">
                status · <span className="text-bad">Route not found</span>
              </p>
            </div>
          </li>

          {/* Missing Route — terminal */}
          <li className="relative pl-8">
            <span
              className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-ink border-dashed bg-raised"
              aria-hidden
            />
            <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-line bg-code/70 px-3 py-2">
              <span className="text-xs font-medium text-muted">Missing Route</span>
              <span className="ml-auto font-mono text-[9.5px] text-muted/70">
                terminal
              </span>
            </div>
          </li>
        </ol>

        {/* Inactive side nodes */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
          <span className="absolute left-[12%] top-[28%] h-2 w-2 rounded-full bg-line" />
          <span className="absolute right-[14%] top-[36%] h-2 w-2 rounded-full bg-line" />
          <span className="absolute left-[18%] bottom-[24%] h-1.5 w-1.5 rounded-full bg-line/70" />
          <span
            className="absolute right-[18%] bottom-[30%] h-2 w-2 rounded-full border border-line bg-transparent"
          />
        </div>
      </div>

      <p className="border-t border-line/80 bg-code px-4 py-2.5 font-mono text-[10px] text-muted/70">
        execution halted · no handler matched the requested path
      </p>
    </div>
  );
}

export function NotFoundHero() {
  return (
    <section
      className="relative overflow-hidden pt-14 sm:pt-20"
      aria-labelledby="not-found-heading"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-45" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              <span className="relative mr-2.5 inline-flex h-[7px] w-[7px] items-center justify-center align-middle" aria-hidden>
                <span className="absolute inset-0 border border-bad/60" />
                <span className="h-[3px] w-[3px] bg-bad" />
              </span>
              Error · 404
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h1
              id="not-found-heading"
              className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-5xl"
            >
              Workflow not found.
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mx-auto mt-4 max-w-md text-pretty leading-relaxed text-muted">
              The page you&apos;re looking for may have been moved, deleted, or
              never existed.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px sm:w-auto"
              >
                Back to Home
              </Link>
              <Link
                href="/docs"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-line bg-transparent px-6 text-sm font-medium text-fg transition-colors duration-200 hover:border-line-strong hover:bg-hover sm:w-auto"
              >
                View Documentation
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={260} className="mx-auto mt-12 max-w-md sm:mt-14">
          <FailureGraph />
        </Reveal>
      </div>
    </section>
  );
}
