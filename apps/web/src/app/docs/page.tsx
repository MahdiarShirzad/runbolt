import type { Metadata } from "next";
import Link from "next/link";
import { openSearch } from "@/components/docs/events";
import {
  CodeIcon,
  DbIcon,
  EyeIcon,
  FilterIcon,
  GlobeIcon,
  NodeGraphIcon,
  SearchIcon,
  WorkerIcon,
} from "@/components/landing/icons";

export const metadata: Metadata = {
  title: "Documentation — Runbolt",
  description:
    "Everything you need to build, automate, execute, and observe reliable workflows with Runbolt.",
};

const categories = [
  {
    title: "Getting Started",
    description: "Set up Runbolt and build your first workflow.",
    href: "/docs/getting-started",
    icon: <BoltGlyph />,
  },
  {
    title: "Core Concepts",
    description: "Understand workflows, nodes, executions, and workers.",
    href: "/docs/core-concepts",
    icon: <NodeGraphIcon width={16} height={16} />,
  },
  {
    title: "Workflow Builder",
    description: "Learn how to design and compose workflows.",
    href: "/docs/workflows",
    icon: <FilterIcon width={16} height={16} />,
  },
  {
    title: "API",
    description: "Control Runbolt programmatically.",
    href: "/docs/api",
    icon: <CodeIcon width={16} height={16} />,
  },
  {
    title: "Integrations",
    description: "Connect Runbolt with the tools you already use.",
    href: "/docs/integrations",
    icon: <GlobeIcon width={16} height={16} />,
  },
  {
    title: "Operations",
    description: "Monitor executions, logs, retries, and failures.",
    href: "/docs/executions",
    icon: <EyeIcon width={16} height={16} />,
  },
];

function BoltGlyph() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      aria-hidden
    >
      <path d="M13.2 2.1 4.6 13.1c-.3.4 0 .9.5.9h5.1l-1.3 7.6c-.1.5.6.8.9.4l8.7-11.1c.3-.4 0-.9-.5-.9h-5.2l1.3-7.5c.1-.5-.6-.8-.9-.4Z" />
    </svg>
  );
}

const popularLinks = [
  { label: "Quickstart", href: "/docs/getting-started" },
  { label: "Build your first workflow", href: "/docs/getting-started" },
  { label: "API Reference", href: "/docs/api" },
  { label: "Workflow concepts", href: "/docs/core-concepts" },
];

function CommunityArea() {
  return (
    <section
      className="border-t border-line/70 bg-surface/40 py-14"
      aria-labelledby="community-heading"
    >
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center">
        <div>
          <h2 id="community-heading" className="text-lg font-semibold tracking-tight">
            Runbolt is built for developers.
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">
            Read the source, file issues, and ship workflows with a community of
            engineers automating serious infrastructure.
          </p>
        </div>
        <ul className="flex flex-wrap gap-2.5 md:ml-auto">
          {[
            ["GitHub", "#"],
            ["Documentation", "/docs"],
            ["Changelog", "#"],
            ["Community", "#"],
          ].map(([label, href]) => (
            <li key={label}>
              <Link
                href={href}
                className="inline-flex h-8 items-center rounded-md border border-line bg-surface/70 px-3 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-fg"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function DocsHomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line/70">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-grid mask-fade-radial absolute inset-0 opacity-50" />
        </div>

        <div className="relative mx-auto max-w-[1100px] px-4 pb-14 pt-16 sm:px-6 sm:pt-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <span className="relative mr-2.5 inline-flex h-[7px] w-[7px] items-center justify-center align-middle" aria-hidden>
              <span className="absolute inset-0 border border-volt/60" />
              <span className="h-[3px] w-[3px] bg-volt" />
            </span>
            Runbolt documentation
          </p>
          <h1 className="mt-4 text-balance font-display text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            Build with Runbolt.
          </h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted">
            Everything you need to build, automate, execute, and observe
            reliable workflows.
          </p>

          {/* Search box (opens the command palette) */}
          <button
            type="button"
            onClick={openSearch}
            className="group mt-8 flex h-12 w-full max-w-lg items-center gap-3 rounded-lg border border-line bg-input px-4 text-left transition-colors duration-200 hover:border-line-strong"
            aria-label="Search documentation"
          >
            <SearchIcon width={15} height={15} className="shrink-0 text-muted" />
            <span className="text-sm text-muted/70">Search documentation…</span>
            <kbd className="ml-auto rounded border border-line bg-raised px-1.5 py-0.5 font-mono text-[10.5px] text-muted">
              ⌘ K
            </kbd>
          </button>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
            {popularLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14" aria-label="Documentation categories">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.title}
                href={category.href}
                className="group flex flex-col rounded-lg border border-line bg-surface/50 p-4 transition-colors duration-200 hover:border-line-strong hover:bg-surface"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded border border-line bg-raised text-muted transition-colors group-hover:border-primary/40 group-hover:text-primary">
                  {category.icon}
                </span>
                <span className="mt-3.5 flex items-center gap-2 text-[14.5px] font-semibold text-fg">
                  {category.title}
                  <svg
                    width={13}
                    height={13}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  >
                    <path d="M5 12h13m0 0-5-5m5 5-5 5" />
                  </svg>
                </span>
                <span className="mt-1 text-[13px] leading-relaxed text-muted">
                  {category.description}
                </span>
              </Link>
            ))}
          </div>

          {/* Quick link strip */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Link
              href="/docs/api"
              className="group flex items-center gap-4 rounded-lg border border-line bg-code/60 p-4 transition-colors hover:border-line-strong"
            >
              <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-raised text-ok sm:flex">
                <DbIcon width={15} height={15} />
              </span>
              <span>
                <span className="block text-sm font-medium text-fg">Execution API</span>
                <span className="block font-mono text-[11.5px] text-muted">
                  POST /v1/workflows/:id/execute
                </span>
              </span>
            </Link>
            <Link
              href="/docs/workers"
              className="group flex items-center gap-4 rounded-lg border border-line bg-code/60 p-4 transition-colors hover:border-line-strong"
            >
              <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-raised text-primary sm:flex">
                <WorkerIcon width={15} height={15} />
              </span>
              <span>
                <span className="block text-sm font-medium text-fg">Background workers</span>
                <span className="block text-[11.5px] text-muted">
                  Reliable queues, retries, and backpressure
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <CommunityArea />
    </>
  );
}
