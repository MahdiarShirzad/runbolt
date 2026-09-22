import { BuilderMock } from "./BuilderMock";
import { ArrowRightIcon, BookIcon } from "./icons";

export function Hero() {
  return (
    <section id="product" className="relative overflow-hidden pt-16 sm:pt-24">
      {/* Background atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-60" />
        <div className="absolute left-1/2 top-[-320px] h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.14),transparent)] blur-2xl" />
        <div className="absolute left-[20%] top-[-160px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(139,124,246,0.10),transparent)] blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 py-1 pl-1.5 pr-3.5 text-xs text-muted backdrop-blur">
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-info">
              v2.0
            </span>
            Workflows are generally available
          </p>

          <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-[72px]">
            Automate workflows.
            <span className="block bg-gradient-to-r from-primary via-highlight to-accent bg-clip-text text-transparent">
              Ship faster.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
            Runbolt is workflow orchestration for engineers. Design pipelines as
            connected nodes, trigger them from code or webhooks, and observe
            every execution — logs, retries, and tracing built in.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#cta"
              className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-white shadow-[0_2px_20px_rgba(59,130,246,0.4)] transition-all duration-200 hover:bg-[#2f76ef] hover:shadow-[0_2px_28px_rgba(59,130,246,0.55)] sm:w-auto"
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
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-line bg-surface/60 px-6 text-sm font-medium text-fg backdrop-blur transition-colors duration-200 hover:border-[#3a466b] hover:bg-hover sm:w-auto"
            >
              <BookIcon width={15} height={15} className="text-muted" />
              View Documentation
            </a>
          </div>

          <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-line/70 bg-code px-3 py-1.5 font-mono text-xs text-muted">
            <span className="text-ok">$</span> npm install @runbolt/sdk
          </p>
        </div>

        <div className="mt-14 sm:mt-16">
          <BuilderMock />
        </div>
      </div>
    </section>
  );
}
