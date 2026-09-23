import { ArrowRightIcon } from "../landing/icons";

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
      <path d="M80 120 C240 120 300 220 470 220" stroke="#26304A" strokeWidth="1" />
      <path d="M470 220 C640 220 700 90 900 90" stroke="#26304A" strokeWidth="1" />
      <path d="M470 220 C640 220 720 360 920 360" stroke="#26304A" strokeWidth="1" />
      <path d="M1120 200 C1000 200 980 90 900 90" stroke="#26304A" strokeWidth="1" />
      {/* faint execution pulse */}
      <path
        d="M80 120 C240 120 300 220 470 220 C640 220 700 90 900 90"
        stroke="#4CC9F0"
        strokeWidth="1"
        strokeLinecap="round"
        className="edge-flow"
        style={{ "--edge-delay": "0.4s" } as React.CSSProperties}
      />
      {/* nodes */}
      <rect x="56" y="108" width="24" height="24" rx="6" stroke="#3B82F6" strokeOpacity="0.5" fill="#111726" />
      <rect x="446" y="196" width="48" height="48" rx="10" stroke="#8B7CF6" strokeOpacity="0.55" fill="#111726" />
      <rect x="876" y="66" width="48" height="48" rx="10" stroke="#26304A" fill="#111726" />
      <rect x="1096" y="176" width="24" height="24" rx="6" stroke="#26304A" fill="#111726" />
      <rect x="896" y="336" width="48" height="48" rx="10" stroke="#4CC9F0" strokeOpacity="0.4" fill="#111726" />
      {/* status dots */}
      <circle cx="470" cy="220" r="3" fill="#22C55E" fillOpacity="0.7" />
      <circle cx="900" cy="90" r="3" fill="#3B82F6" fillOpacity="0.8" />
      <circle cx="920" cy="360" r="3" fill="#22C55E" fillOpacity="0.5" />
      {/* code fragments */}
      <text x="960" y="140" fill="#546080" fontSize="12" fontFamily="monospace">{"run.status"}</text>
      <text x="120" y="330" fill="#546080" fontSize="12" fontFamily="monospace">{"// queue: fulfillment"}</text>
      <text x="1000" y="430" fill="#546080" fontSize="12" fontFamily="monospace">{"200 OK"}</text>
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
        <div className="absolute left-1/2 top-[-280px] h-[560px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.13),transparent)] blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-highlight">
          Simple, transparent pricing
        </p>
        <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
          Choose a plan that scales with your workflows.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          Start building automation workflows today. Upgrade when your
          execution needs grow.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#plans"
            className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-button-text shadow-[0_2px_20px_rgba(59,130,246,0.4)] transition-all duration-200 hover:bg-[#2f76ef] hover:shadow-[0_2px_28px_rgba(59,130,246,0.55)] sm:w-auto"
          >
            Start Building
            <ArrowRightIcon
              width={15}
              height={15}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </a>
          <a
            href="#plans"
            className="inline-flex h-11 w-full items-center justify-center rounded-md border border-line bg-surface/60 px-6 text-sm font-medium text-fg backdrop-blur transition-colors duration-200 hover:border-[#3a466b] hover:bg-hover sm:w-auto"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
}
