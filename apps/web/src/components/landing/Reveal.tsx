import type { CSSProperties, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger delay in ms — mapped onto the scroll-driven animation range. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span" | "ol" | "ul" | "nav" | "article";
};

/**
 * Scroll-reveal wrapper — a server component with zero JavaScript.
 *
 * The entrance is driven by a CSS view-timeline (see `.reveal` in
 * globals.css): each element animates as it enters the viewport, and the
 * optional delay is expressed as an offset within the entry range so
 * staggered grids still read as a sequence. Browsers without
 * `animation-timeline` support (and users with reduced-motion) simply see
 * the final state — no JS required, no content ever hidden from crawlers.
 */
export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const rangeStart = Math.min(Math.round(delay / 12), 30);
  const style =
    delay > 0 ? ({ "--reveal-range": `${rangeStart}%` } as CSSProperties) : undefined;
  const Tag = as;
  return (
    <Tag className={`reveal ${className ?? ""}`} style={style}>
      {children}
    </Tag>
  );
}
