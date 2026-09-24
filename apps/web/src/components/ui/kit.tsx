import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

const buttonBase =
  "group inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium transition-all duration-200 active:translate-y-px";

const variants = {
  primary:
    "bg-primary text-button-text hover:bg-primary-strong",
  secondary:
    "border border-line bg-surface/70 text-fg hover:border-line-strong hover:bg-hover",
  quiet: "text-muted hover:text-fg",
} as const;

type Variant = keyof typeof variants;

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} className={`${buttonBase} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}

export function ButtonAnchor({
  href,
  variant = "primary",
  className = "",
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <a href={href} className={`${buttonBase} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </a>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...rest
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={`${buttonBase} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Section header — node tick + title + lede                           */
/* ------------------------------------------------------------------ */

/**
 * Eyebrow marker shaped like a graph node: a small square "port" wired to
 * a hairline. Used only where the label adds information; never stacked
 * on every heading by default.
 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
      <span className="relative flex h-[7px] w-[7px] items-center justify-center" aria-hidden>
        <span className="absolute inset-0 border border-volt/60" />
        <span className="h-[3px] w-[3px] bg-volt" />
      </span>
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = "left",
  className = "",
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}>
      {eyebrow ? (
        <div className={centered ? "flex justify-center" : undefined}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <h2
        id={id}
        className={`text-balance font-display text-3xl font-semibold leading-[1.15] tracking-[-0.015em] sm:text-4xl ${
          eyebrow ? "mt-4" : ""
        }`}
      >
        {title}
      </h2>
      {lede ? (
        <p className="mt-4 text-pretty leading-relaxed text-muted">{lede}</p>
      ) : null}
    </div>
  );
}
