/**
 * Decorative node constellation behind the hero — pure SVG, static,
 * palette-only colors at low opacity.
 */
function NodeConstellation() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 500"
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      {/* execution lines */}
      <path d="M80 120 C240 120 300 220 470 220" stroke="#232C3B" strokeWidth="1" />
      <path d="M470 220 C640 220 700 90 900 90" stroke="#232C3B" strokeWidth="1" />
      <path d="M470 220 C640 220 720 360 920 360" stroke="#232C3B" strokeWidth="1" />
      <path d="M1120 200 C1000 200 980 90 900 90" stroke="#232C3B" strokeWidth="1" />
      {/* faint execution pulse */}
      <path
        d="M80 120 C240 120 300 220 470 220 C640 220 700 90 900 90"
        stroke="#C7F04E"
        strokeOpacity="0.55"
        strokeWidth="1"
        strokeLinecap="round"
        className="edge-flow"
        style={{ "--edge-delay": "0.4s" } as React.CSSProperties}
      />
      {/* nodes */}
      <rect x="56" y="108" width="24" height="24" rx="4" stroke="#C7F04E" strokeOpacity="0.4" fill="#10151D" />
      <rect x="446" y="196" width="48" height="48" rx="6" stroke="#5CC9EE" strokeOpacity="0.4" fill="#10151D" />
      <rect x="876" y="66" width="48" height="48" rx="6" stroke="#232C3B" fill="#10151D" />
      <rect x="1096" y="176" width="24" height="24" rx="4" stroke="#232C3B" fill="#10151D" />
      <rect x="896" y="336" width="48" height="48" rx="6" stroke="#232C3B" fill="#10151D" />
      {/* status dots */}
      <circle cx="470" cy="220" r="3" fill="#3ECF8E" fillOpacity="0.7" />
      <circle cx="900" cy="90" r="3" fill="#C7F04E" fillOpacity="0.8" />
      <circle cx="920" cy="360" r="3" fill="#3ECF8E" fillOpacity="0.5" />
      {/* code fragments */}
      <text x="960" y="140" fill="#4E5A70" fontSize="12" fontFamily="monospace">{"run.status"}</text>
      <text x="120" y="330" fill="#4E5A70" fontSize="12" fontFamily="monospace">{"// queue: fulfillment"}</text>
      <text x="1000" y="430" fill="#4E5A70" fontSize="12" fontFamily="monospace">{"200 OK"}</text>
    </svg>
  );
}

export function PricingHero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28">
      {/* Technical background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-50" />
        <NodeConstellation />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <p className="flex items-center justify-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          <span className="relative flex h-[7px] w-[7px] items-center justify-center" aria-hidden>
            <span className="absolute inset-0 border border-volt/60" />
            <span className="h-[3px] w-[3px] bg-volt" />
          </span>
          Simple, transparent pricing
        </p>
        <h1 className="mt-6 text-balance font-display text-4xl font-bold leading-[1.08] tracking-[-0.025em] sm:text-6xl">
          Pricing that scales with your execution volume
          <span className="text-primary">.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          Start building automation workflows today. Upgrade when your
          execution needs grow.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#plans"
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px sm:w-auto"
          >
            View Plans
          </a>
          <a
            href="/contact"
            className="inline-flex h-11 w-full items-center justify-center rounded-md border border-line bg-surface/70 px-6 text-sm font-medium text-fg transition-colors duration-200 hover:border-line-strong hover:bg-hover sm:w-auto"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
}
