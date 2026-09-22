import Link from "next/link";
import { BoltIcon } from "../landing/icons";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Documentation", href: "/docs" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API", href: "/docs/api" },
      { label: "SDKs", href: "/docs/sdks" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Guides", href: "/docs/getting-started" },
      { label: "FAQ", href: "/pricing#faq-heading" },
      { label: "Troubleshooting", href: "/docs/troubleshooting" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function DocsFooter() {
  return (
    <footer className="border-t border-line/70 bg-surface/30">
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3 lg:grid-cols-[1.4fr_repeat(5,1fr)]">
          <div>
            <Link href="/docs" className="flex items-center gap-2.5 rounded-md">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-highlight text-white">
                <BoltIcon width={12} height={12} />
              </span>
              <span className="text-[14px] font-semibold tracking-tight">Runbolt</span>
            </Link>
            <p className="mt-3 max-w-[220px] text-[12.5px] leading-relaxed text-muted">
              Workflow orchestration for engineers.
            </p>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-[12.5px] font-semibold text-fg">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-muted transition-colors hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-8 border-t border-line/70 pt-5 text-[11.5px] text-muted/70">
          © 2026 Runbolt, Inc.
        </p>
      </div>
    </footer>
  );
}
