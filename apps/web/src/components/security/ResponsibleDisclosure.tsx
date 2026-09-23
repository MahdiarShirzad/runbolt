import { Reveal } from "../landing/Reveal";
import { MailIcon } from "../landing/icons";

export function ResponsibleDisclosure() {
  return (
    <section id="disclosure" className="py-20 sm:py-28" aria-labelledby="disclosure-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-xl border border-line bg-surface/60 px-6 py-10 sm:px-12 sm:py-12">
            {/* Subtle corner glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(76,201,240,0.08),transparent)] blur-2xl"
            />

            <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-info/30 bg-info/10 text-info">
                <MailIcon width={18} height={18} />
              </span>

              <div className="max-w-xl">
                <h2
                  id="disclosure-heading"
                  className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                  Found a security issue?
                </h2>
                <p className="mt-3 text-pretty leading-relaxed text-muted">
                  Security researchers and developers should have a clear path
                  to report potential vulnerabilities. Include reproduction
                  steps and the affected area — and please don&rsquo;t include
                  real credentials in reports.
                </p>
              </div>

              <div className="md:ml-auto">
                <a
                  href="mailto:security@your-domain.example"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-raised px-6 text-sm font-medium text-fg transition-colors duration-200 hover:border-[#3a466b] hover:bg-hover"
                >
                  <MailIcon width={15} height={15} className="text-info" />
                  Contact Security
                </a>
                <p className="mt-2.5 font-mono text-[10px] leading-relaxed text-muted/60">
                  security@your-domain.example
                  <span className="ml-1.5 rounded border border-warn/30 bg-warn/10 px-1 py-0.5 text-warn">
                    placeholder — update before launch
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
