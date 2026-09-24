import { BuilderMock } from "./BuilderMock";
import { ArrowRightIcon, BookIcon } from "./icons";

/**
 * Landing hero — laid out on an execution rail: the status line is the
 * trigger, the headline the transform, the actions the steps. Left-aligned,
 * asymmetric; the product canvas carries the visual weight.
 */
export function Hero() {
  return (
    <section id="product" className="relative overflow-hidden pt-14 sm:pt-20">
      {/* Top power line — the energized rail the brand hangs from */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-volt/50 to-transparent"
      />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-50" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="relative max-w-4xl">
          {/* Execution rail */}
          <span
            aria-hidden
            className="absolute bottom-2 left-[3px] top-[9px] w-px bg-gradient-to-b from-volt/50 via-line to-line/40"
          />
          <span
            aria-hidden
            className="absolute left-0 top-[5px] h-[7px] w-[7px] border border-volt/60"
          >
            <span className="absolute inset-[1.5px] bg-volt" />
          </span>

          <div className="pl-7 sm:pl-9">
            <p className="font-mono text-xs text-muted">
              <span className="text-faint">runbolt</span>
              <span className="text-line-strong">/</span>
              <span className="text-fg">v2.0</span>
              <span className="text-faint"> — </span>
              workflows generally available
              <span className="blink ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" aria-hidden />
            </p>

            <h1 className="mt-6 text-balance font-display text-[44px] font-bold leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-[72px]">
              Automate workflows.
              <span className="mt-1 block sm:mt-2">
                Ship faster
                <span className="text-primary">.</span>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              Runbolt is workflow orchestration for engineers. Design pipelines
              as connected nodes, trigger them from code or webhooks, and
              observe every execution — logs, retries, and tracing built in.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/register"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px sm:w-auto"
              >
                Start Building
                <ArrowRightIcon
                  width={15}
                  height={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="#developers"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface/70 px-6 text-sm font-medium text-fg transition-colors duration-200 hover:border-line-strong hover:bg-hover sm:w-auto"
              >
                <BookIcon width={15} height={15} className="text-muted" />
                View Documentation
              </a>
            </div>

            <p className="mt-5 inline-flex items-center rounded-md border border-line/70 bg-code px-3 py-1.5 font-mono text-xs text-muted">
              <span className="text-ok">$</span>
              <span className="ml-2">npm install @runbolt/sdk</span>
            </p>
          </div>
        </div>

        <div className="mt-14 sm:mt-16">
          <BuilderMock />
        </div>
      </div>
    </section>
  );
}
