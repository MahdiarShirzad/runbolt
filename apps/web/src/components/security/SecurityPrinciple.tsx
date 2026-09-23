import { Reveal } from "../landing/Reveal";
import { EyeIcon } from "../landing/icons";
import { KeyIcon, LayersIcon, TerminalIcon } from "./icons";
import type { ReactNode } from "react";

type Principle = {
  icon: ReactNode;
  tag: string;
  title: string;
  text: string;
};

const principles: Principle[] = [
  {
    icon: <KeyIcon width={15} height={15} />,
    tag: "least-privilege",
    title: "Least-privilege mindset",
    text: "Access should be limited to what a workflow or integration actually needs.",
  },
  {
    icon: <LayersIcon width={15} height={15} />,
    tag: "secrets-separation",
    title: "Secrets separation",
    text: "Credentials and sensitive configuration should be treated separately from workflow logic.",
  },
  {
    icon: <EyeIcon width={15} height={15} />,
    tag: "execution-visibility",
    title: "Execution visibility",
    text: "Workflow execution should provide clear visibility into states, failures, retries, and outputs.",
  },
  {
    icon: <TerminalIcon width={15} height={15} />,
    tag: "developer-control",
    title: "Developer control",
    text: "Give engineering teams clear control over workflows, integrations, and operational behavior.",
  },
];

export function SecurityPrinciple({ principle }: { principle: Principle }) {
  return (
    <div className="p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-raised text-highlight">
          {principle.icon}
        </span>
        <span className="font-mono text-[10.5px] text-muted/70">{principle.tag}</span>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-fg">{principle.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{principle.text}</p>
    </div>
  );
}

export function SecurityPrinciples() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="principles-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs text-highlight">Principles</p>
          <h2
            id="principles-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Designed around control and visibility.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Four working principles shape how workflows, credentials, and
            executions are handled across the platform.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-10 overflow-hidden rounded-xl border border-line bg-surface/60 sm:grid sm:grid-cols-2">
            {principles.map((principle, i) => {
              // Internal hairlines: vertical split on sm, horizontal on mobile
              const divide = [
                "",
                "border-t border-line/70 sm:border-t-0 sm:border-l",
                "border-t border-line/70",
                "border-t border-line/70 sm:border-l",
              ][i];
              return (
                <div key={principle.tag} className={divide}>
                  <SecurityPrinciple principle={principle} />
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
