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

      {/* Persistent background motion system */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-drift opacity-30">
        <div className="bg-grid mask-fade-radial absolute inset-0" />
      </div>

      {/* Execution visualization layer — behind hero content */}
      <div aria-hidden className="pointer-events-none absolute inset-0 ambient-drift">
        {/* Horizontal execution paths with comets */}
        <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 1200 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="comet-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C7F04E" stopOpacity="0" />
              <stop offset="30%" stopColor="#C7F04E" stopOpacity="1" />
              <stop offset="70%" stopColor="#C7F04E" stopOpacity="1" />
              <stop offset="100%" stopColor="#C7F04E" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Path 1 - top */}
          <path
            className="execution-path"
            d="M-50 60 C200 40 400 80 600 60 C800 40 1000 80 1250 60"
            fill="none"
            stroke="url(#comet-gradient)"
            strokeWidth="1"
            style={{ "--path-delay": "0s" } as React.CSSProperties}
          />
          <ellipse
            className="execution-comet"
            cx="-50"
            cy="60"
            rx="4"
            ry="2"
            fill="#C7F04E"
            filter="drop-shadow(0 0 4px #C7F04E)"
            style={{ "--comet-delay": "0s" } as React.CSSProperties}
          />

          {/* Path 2 - middle */}
          <path
            className="execution-path"
            d="M-50 200 C200 180 400 220 600 200 C800 180 1000 220 1250 200"
            fill="none"
            stroke="url(#comet-gradient)"
            strokeWidth="1"
            style={{ "--path-delay": "1.3s" } as React.CSSProperties}
          />
          <ellipse
            className="execution-comet"
            cx="-50"
            cy="200"
            rx="3"
            ry="1.5"
            fill="#C7F04E"
            filter="drop-shadow(0 0 3px #C7F04E)"
            style={{ "--comet-delay": "1.3s" } as React.CSSProperties}
          />

          {/* Path 3 - bottom */}
          <path
            className="execution-path"
            d="M-50 340 C200 360 400 320 600 340 C800 360 1000 320 1250 340"
            fill="none"
            stroke="url(#comet-gradient)"
            strokeWidth="1"
            style={{ "--path-delay": "2.6s" } as React.CSSProperties}
          />
          <ellipse
            className="execution-comet"
            cx="-50"
            cy="340"
            rx="2.5"
            ry="1.2"
            fill="#C7F04E"
            filter="drop-shadow(0 0 2px #C7F04E)"
            style={{ "--comet-delay": "2.6s" } as React.CSSProperties}
          />

          {/* Execution bursts - occasional energy releases */}
          <circle
            className="execution-burst"
            cx="300"
            cy="130"
            r="1"
            fill="#C7F04E"
            filter="drop-shadow(0 0 6px #C7F04E)"
            style={{ "--burst-delay": "0s" } as React.CSSProperties}
          />
          <circle
            className="execution-burst"
            cx="750"
            cy="265"
            r="1"
            fill="#C7F04E"
            filter="drop-shadow(0 0 6px #C7F04E)"
            style={{ "--burst-delay": "1.8s" } as React.CSSProperties}
          />
          <circle
            className="execution-burst"
            cx="500"
            cy="80"
            r="1"
            fill="#C7F04E"
            filter="drop-shadow(0 0 6px #C7F04E)"
            style={{ "--burst-delay": "3.2s" } as React.CSSProperties}
          />
          <circle
            className="execution-burst"
            cx="900"
            cy="160"
            r="1"
            fill="#C7F04E"
            filter="drop-shadow(0 0 6px #C7F04E)"
            style={{ "--burst-delay": "4.5s" } as React.CSSProperties}
          />
        </svg>
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
            <p className="hero-headline-reveal font-mono text-xs text-muted" style={{ "--reveal-delay": "0ms" } as React.CSSProperties}>
              <span className="text-faint">runbolt</span>
              <span className="text-line-strong">/</span>
              <span className="text-fg">v1.0</span>
              <span className="text-faint"> — </span>
              workflows generally available
              <span className="blink ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" aria-hidden />
            </p>

            <h1 className="mt-6 text-balance font-display text-[44px] font-bold leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-[72px]">
              <span className="hero-headline-reveal block" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>Automate workflows.</span>
              <span className="hero-headline-reveal mt-1 block sm:mt-2" style={{ "--reveal-delay": "160ms" } as React.CSSProperties}>
                Ship faster
                <span className="text-primary">.</span>
              </span>
            </h1>

            <p className="hero-headline-reveal mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg" style={{ "--reveal-delay": "240ms" } as React.CSSProperties}>
              Runbolt is workflow orchestration for engineers. Design pipelines
              as connected nodes, trigger them from code or webhooks, and
              observe every execution — logs, retries, and tracing built in.
            </p>

            <div className="hero-headline-reveal mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ "--reveal-delay": "320ms" } as React.CSSProperties}>
              <a
                href="/register"
                className="group relative inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px cta-volt-glow sm:w-auto"
              >
                <span className="absolute inset-0 rounded-md bg-primary/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
                Start Building
                <ArrowRightIcon
                  width={15}
                  height={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 relative z-10"
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

            <p className="hero-headline-reveal mt-5 inline-flex items-center rounded-md border border-line/70 bg-code px-3 py-1.5 font-mono text-xs text-muted" style={{ "--reveal-delay": "400ms" } as React.CSSProperties}>
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
