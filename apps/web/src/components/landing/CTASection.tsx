import Link from "next/link";
import { Reveal } from "./Reveal";
import { ArrowRightIcon, BookIcon } from "./icons";

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
    <section id="cta" className="relative overflow-hidden py-28 sm:py-36" aria-labelledby="cta-heading">
      {/* Glow field */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="gradient-pan absolute left-1/2 top-1/2 h-[480px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.16),rgba(139,124,246,0.08),transparent)] blur-3xl" />
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-40" />
      </div>

      <Reveal className="relative mx-auto max-w-2xl px-5 text-center sm:px-8">
        <h2
          id="cta-heading"
          className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          {headline}
        </h2>
        <p className="mx-auto mt-5 max-w-md text-pretty leading-relaxed text-muted">
          {sub}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-button-text shadow-[0_2px_24px_rgba(59,130,246,0.45)] transition-all duration-200 hover:bg-[#2f76ef] hover:shadow-[0_2px_32px_rgba(59,130,246,0.6)] sm:w-auto"
          >
            {primaryLabel}
            <ArrowRightIcon
              width={15}
              height={15}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href={secondaryHref}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-line bg-surface/60 px-6 text-sm font-medium text-fg backdrop-blur transition-colors duration-200 hover:border-[#3a466b] hover:bg-hover sm:w-auto"
          >
            <BookIcon width={15} height={15} className="text-muted" />
            {secondaryLabel}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
