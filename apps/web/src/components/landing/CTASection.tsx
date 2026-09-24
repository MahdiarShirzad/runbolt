import { ButtonAnchor, ButtonLink } from "../ui/kit";

type CTASectionProps = {
  headline?: string;
  sub?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryHref?: string;
  secondaryHref?: string;
};

export function CTASection({
  headline = "Ready to automate your next workflow?",
  sub = "Spin up your first workflow in minutes. No credit card, no sales call — just you and a terminal.",
  primaryLabel = "Start Building",
  secondaryLabel = "Read Documentation",
  primaryHref = "/register",
  secondaryHref = "#developers",
}: CTASectionProps) {
  return (
    <section id="cta" className="relative overflow-hidden py-24 sm:py-32" aria-labelledby="cta-heading">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-40" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[10px] border border-line bg-surface/70 px-6 py-14 text-center sm:px-12 sm:py-16">
          {/* Power line across the panel top */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-volt/40 to-transparent"
          />

          <h2
            id="cta-heading"
            className="text-balance font-display text-3xl font-semibold tracking-[-0.015em] sm:text-4xl"
          >
            {headline}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-pretty leading-relaxed text-muted">
            {sub}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={primaryHref}>
              {primaryLabel}
            </ButtonLink>
            <ButtonAnchor href={secondaryHref} variant="secondary">
              {secondaryLabel}
            </ButtonAnchor>
          </div>
          <p className="mt-6 font-mono text-[11px] text-faint">
            static demo · no signup required to explore
          </p>
        </div>
      </div>
    </section>
  );
}
