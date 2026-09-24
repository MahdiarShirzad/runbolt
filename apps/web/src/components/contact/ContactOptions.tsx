import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "../landing/Reveal";
import { BookIcon, EyeIcon, CodeIcon, ArrowRightIcon } from "../landing/icons";
import { TerminalIcon } from "../security/icons";

type Option = {
  title: string;
  text: string;
  cta: string;
  href: string;
  tag: string;
  icon: ReactNode;
  tone: string;
};

const options: Option[] = [
  {
    title: "Documentation",
    text: "Find guides, concepts, and API references.",
    cta: "Read Docs",
    href: "/docs",
    tag: "docs",
    icon: <BookIcon width={16} height={16} />,
    tone: "text-highlight",
  },
  {
    title: "Technical Questions",
    text: "Need help understanding workflows or integrations?",
    cta: "Ask a Question",
    href: "#contact-form",
    tag: "support",
    icon: <TerminalIcon width={16} height={16} />,
    tone: "text-primary",
  },
  {
    title: "Security",
    text: "Report a potential security concern.",
    cta: "Security Page",
    href: "/security",
    tag: "security",
    icon: <EyeIcon width={16} height={16} />,
    tone: "text-accent",
  },
  {
    title: "Feedback",
    text: "Share ideas and help improve Runbolt.",
    cta: "Share Feedback",
    href: "#contact-form",
    tag: "feedback",
    icon: <CodeIcon width={16} height={16} />,
    tone: "text-info",
  },
];

export function ContactOptionCard({ option }: { option: Option }) {
  return (
    <article className="group flex h-full flex-col rounded-lg border border-line bg-surface/50 p-5 transition-colors duration-200 hover:border-line-strong hover:bg-surface">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-md border border-line bg-raised ${option.tone}`}
        >
          {option.icon}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted/60">
          {option.tag}
        </span>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-fg">{option.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{option.text}</p>
      <Link
        href={option.href}
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors duration-200 group-hover:text-fg"
      >
        {option.cta}
        <ArrowRightIcon
          width={13}
          height={13}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </Link>
    </article>
  );
}

export function ContactOptions() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="options-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs text-highlight">Contact options</p>
          <h2
            id="options-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Choose the right path.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Not every question needs the same channel. Start with the path that
            matches what you are trying to do.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((option, i) => (
            <Reveal key={option.title} delay={i * 70} className="h-full">
              <ContactOptionCard option={option} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
