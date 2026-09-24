import Link from "next/link";
import { BoltIcon } from "./icons";

type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

/** Single shared site footer — every page uses this exact configuration. */
const columns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Workflow Builder", href: "/features" },
      { label: "Background Workers", href: "/features" },
      { label: "Observability", href: "/features" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/docs/api" },
      { label: "CLI", href: "/docs/sdks" },
      { label: "Changelog", href: "/docs/getting-started" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "/security" },
      { label: "DPA", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line/70 bg-code/60">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2.5 rounded-md">
              <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-primary text-button-text">
                <BoltIcon width={13} height={13} />
              </span>
              <span className="font-display text-[15px] font-semibold tracking-tight">
                Runbolt
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Workflow orchestration for engineers. Build, run, and observe —
              from trigger to worker.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-line bg-ink px-2.5 py-1 font-mono text-[11px] text-muted">
              <span className="blink h-1.5 w-1.5 rounded-full bg-ok" aria-hidden />
              All systems operational
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-[13px] font-semibold text-fg">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors duration-200 hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line/70 pt-6 font-mono text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Runbolt, Inc. All rights reserved.</p>
          <p>
            status: <span className="text-ok">operational</span>
            <span className="mx-1.5 text-line-strong">/</span>
            region: <span className="text-muted">global</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
