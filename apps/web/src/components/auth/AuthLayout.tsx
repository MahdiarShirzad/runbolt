import Link from "next/link";
import type { ReactNode } from "react";
import { BoltIcon, CheckIcon, DbIcon, GlobeIcon, WorkerIcon } from "../landing/icons";

/**
 * Static mini pipeline used on the brand panel — same visual language as
 * the landing page's execution mock, reduced to its essentials.
 */
const pipeline: { label: string; sub: string; icon: ReactNode; dot: string; ok: boolean }[] = [
  { label: "Trigger", sub: "webhook · /hooks/orders", icon: <BoltIcon width={12} height={12} />, dot: "bg-primary", ok: true },
  { label: "HTTP", sub: "POST api.stripe.com", icon: <GlobeIcon width={12} height={12} />, dot: "bg-highlight", ok: true },
  { label: "Database", sub: "orders · upsert", icon: <DbIcon width={12} height={12} />, dot: "bg-ok", ok: true },
  { label: "Worker", sub: "queue: fulfillment", icon: <WorkerIcon width={12} height={12} />, dot: "bg-highlight", ok: true },
  { label: "Success", sub: "exit 0 · 295ms", icon: <CheckIcon width={11} height={11} />, dot: "bg-ok", ok: true },
];

function BrandVisual() {
  return (
    <div className="relative hidden overflow-hidden border-r border-line/70 lg:block" aria-hidden>
      <div className="bg-grid mask-fade-radial absolute inset-0 opacity-40" />

      <div className="relative flex h-full flex-col justify-center px-14 xl:px-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          live execution
        </p>
        <ol className="relative mt-6 max-w-[280px]">
          <span className="absolute bottom-4 left-[7px] top-4 w-px bg-line" aria-hidden />
          <span
            className="rail-pulse absolute left-[5px] h-3 w-3 bg-primary shadow-[0_0_10px_rgba(199,240,78,0.7)]"
            aria-hidden
          />
          {pipeline.map((step) => (
            <li key={step.label} className="relative pb-4 pl-8">
              <span
                className={`absolute left-0 top-1/2 h-[13px] w-[13px] -translate-y-1/2 border-2 border-ink ${step.dot}`}
                aria-hidden
              />
              <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface/90 py-2 pl-3 pr-3.5">
                <span className="text-muted">{step.icon}</span>
                <span className="leading-tight">
                  <span className="block text-xs font-medium text-fg">{step.label}</span>
                  <span className="block font-mono text-[9.5px] text-muted/80">{step.sub}</span>
                </span>
                <span className="ml-auto flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ok/15 text-ok">
                  <CheckIcon width={8} height={8} />
                </span>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-[300px] text-[13px] leading-relaxed text-muted">
          Trusted execution infrastructure for teams that automate serious work.
        </p>
      </div>
    </div>
  );
}

export function AuthLayout({
  switchText,
  switchLabel,
  switchHref,
  children,
}: {
  switchText: string;
  switchLabel: string;
  switchHref: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-ink">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 rounded-md">
          <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-primary text-button-text">
            <BoltIcon width={13} height={13} />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">Runbolt</span>
        </Link>
        <p className="text-[13.5px] text-muted">
          {switchText}{" "}
          <Link
            href={switchHref}
            className="font-medium text-fg underline decoration-primary/50 underline-offset-4 transition-colors hover:decoration-primary"
          >
            {switchLabel}
          </Link>
        </p>
      </header>

      <main className="mx-auto grid w-full max-w-[1200px] flex-1 lg:grid-cols-2">
        <BrandVisual />
        <div className="flex items-start justify-center px-5 pb-16 pt-6 sm:px-8 lg:pt-16 xl:pt-20">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
