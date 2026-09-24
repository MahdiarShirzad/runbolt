"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Reveal } from "../landing/Reveal";
import { ArrowRightIcon, BookIcon } from "../landing/icons";

type Stage = {
  name: string;
  detail: string;
  state: string;
  stateCls: string;
  nodeCls: string;
  running?: boolean;
};

const stages: Stage[] = [
  {
    name: "Developer",
    detail: "you · inquiry",
    state: "origin",
    stateCls: "border-line bg-raised text-muted",
    nodeCls: "bg-primary",
  },
  {
    name: "Message",
    detail: "form · topic + body",
    state: "queued",
    stateCls: "border-primary/30 bg-primary/10 text-primary",
    nodeCls: "bg-primary",
  },
  {
    name: "Runbolt Team",
    detail: "routing · right path",
    state: "review",
    stateCls: "border-accent/30 bg-accent/10 text-accent",
    nodeCls: "bg-accent pulse-primary",
    running: true,
  },
  {
    name: "Response",
    detail: "reply · follow-up",
    state: "pending",
    stateCls: "border-line bg-raised text-muted",
    nodeCls: "bg-ok shadow-[0_0_10px_rgba(62,207,142,0.5)]",
  },
];

function CommunicationPanel() {
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_24px_80px_-24px_rgba(3,5,9,0.95)]">
      <div className="flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 py-3">
        <p className="truncate font-mono text-xs text-muted">
          runbolt<span className="text-line-strong">/</span>
          <span className="text-fg">contact-route</span>
        </p>
        <span className="ml-auto flex items-center gap-1.5 rounded border border-info/30 bg-info/10 px-2 py-0.5 font-mono text-[10px] text-info">
          <span className="blink h-1.5 w-1.5 rounded-full bg-info" aria-hidden />
          CHANNEL
        </span>
      </div>

      {/* Desktop: horizontal chain */}
      <div className="relative hidden px-5 py-7 sm:block">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-60" aria-hidden />
        <ol className="relative grid grid-cols-4 gap-2" aria-label="Message routing path">
          {stages.map((stage, i) => (
            <Reveal as="li" key={stage.name} delay={i * 100} className="relative">
              {i < stages.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute left-[calc(50%+22px)] right-[calc(-50%+22px)] top-[19px] h-px bg-line"
                >
                  <span
                    className="flow-x-dot absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-highlight shadow-[0_0_6px_rgba(199,240,78,0.7)]"
                    style={{ "--flow-delay": `${i * 0.55}s` } as CSSProperties}
                  />
                </span>
              ) : null}
              <div className="flex flex-col items-center px-1 text-center">
                <span
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink ${stage.nodeCls}`}
                  aria-hidden
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/70" />
                </span>
                <span className="mt-3 text-[13px] font-medium text-fg">{stage.name}</span>
                <span className="mt-1 font-mono text-[9.5px] leading-snug text-muted/80">
                  {stage.detail}
                </span>
                <span
                  className={`mt-2 rounded-full border px-1.5 py-0.5 font-mono text-[9px] ${stage.stateCls}`}
                >
                  {stage.running && (
                    <span
                      className="blink mr-1 inline-block h-1 w-1 rounded-full bg-current align-middle"
                      aria-hidden
                    />
                  )}
                  {stage.state}
                </span>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>

      {/* Mobile: vertical rail */}
      <div className="relative px-4 py-5 sm:hidden">
        <div
          aria-hidden
          className="absolute bottom-8 left-[31px] top-8 w-px bg-gradient-to-b from-line via-line to-transparent"
        >
          <span className="rail-pulse absolute left-1/2 h-6 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary to-transparent" />
        </div>
        <ol className="space-y-1">
          {stages.map((stage) => (
            <li key={stage.name} className="relative flex items-center gap-3 py-1.5">
              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink ${stage.nodeCls}`}
                aria-hidden
              >
                <span className="h-1 w-1 rounded-full bg-ink/70" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium text-fg">
                  {stage.name}
                  <span
                    className={`ml-auto rounded-full border px-1.5 py-0.5 font-mono text-[9px] ${stage.stateCls}`}
                  >
                    {stage.state}
                  </span>
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-muted">{stage.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="border-t border-line/80 bg-code px-4 py-2.5 font-mono text-[10px] text-muted/70">
        Conceptual routing — how a message moves from you to a reply.
      </p>
    </div>
  );
}

export function ContactHero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-14 sm:pt-20"
      aria-labelledby="contact-hero-heading"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid mask-fade-radial absolute inset-0 opacity-50" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                <span className="relative mr-2.5 inline-flex h-[7px] w-[7px] items-center justify-center align-middle" aria-hidden>
                  <span className="absolute inset-0 border border-volt/60" />
                  <span className="h-[3px] w-[3px] bg-volt" />
                </span>
                Contact Runbolt
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h1
                id="contact-hero-heading"
                className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-5xl lg:text-[56px]"
              >
                Let&apos;s build better workflows.
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
                Have a question, feedback, or want to discuss how Runbolt fits
                into your stack? Reach out.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#contact-form"
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px"
                >
                  Send Message
                  <ArrowRightIcon
                    width={15}
                    height={15}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </a>
                <Link
                  href="/docs"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface/70 px-6 text-sm font-medium text-fg transition-colors duration-200 hover:border-line-strong hover:bg-hover"
                >
                  <BookIcon width={15} height={15} className="text-muted" />
                  Read Documentation
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <CommunicationPanel />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
