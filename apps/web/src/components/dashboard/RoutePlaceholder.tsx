import Link from "next/link";
import { BoltIcon } from "@/components/landing/icons";
import { primaryActionCls, secondaryActionCls } from "./actions";

/**
 * Honest placeholder for application routes that are part of the product
 * surface but not implemented yet — no broken links, no fake controls.
 */
export function RoutePlaceholder({
  title,
  description,
  planned,
}: {
  title: string;
  description: string;
  planned: string[];
}) {
  return (
    <div className="mx-auto max-w-2xl py-10 sm:py-16">
      <div className="overflow-hidden rounded-lg border border-line bg-surface/60">
        <div className="border-b border-line/70 px-6 py-5 sm:px-8">
          <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            <span className="relative flex h-[7px] w-[7px] items-center justify-center" aria-hidden>
              <span className="absolute inset-0 border border-warn/60" />
              <span className="h-[3px] w-[3px] bg-warn" />
            </span>
            Coming soon
          </p>
          <h1 className="mt-3 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{description}</p>
        </div>
        <div className="px-6 py-5 sm:px-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
            Planned for this surface
          </p>
          <ul className="mt-3.5 space-y-2.5">
            {planned.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13.5px] text-muted">
                <span className="mt-[7px] h-[5px] w-[5px] shrink-0 bg-primary/70" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 border-t border-line/70 px-6 py-4 sm:px-8">
          <Link href="/dashboard" className={primaryActionCls}>
            Back to dashboard
          </Link>
          <Link href="/docs" className={secondaryActionCls}>
            <BoltIcon width={13} height={13} aria-hidden />
            Read the docs
          </Link>
        </div>
      </div>
      <p className="mt-4 text-center text-[12.5px] text-faint">
        The dashboard is live — these destinations ship next. Sample data is labeled throughout.
      </p>
    </div>
  );
}
