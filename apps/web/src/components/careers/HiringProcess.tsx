import { Reveal } from "../landing/Reveal";
import { SectionHeader } from "../ui/kit";
import { CheckIcon } from "../landing/icons";

type Stage = {
  name: string;
  detail: string;
  state: string;
  stateCls: string;
  nodeCls: string;
};

const stages: Stage[] = [
  {
    name: "Application",
    detail: "your work · what broke · why it matters",
    state: "received",
    stateCls: "border-line bg-raised text-muted",
    nodeCls: "bg-primary",
  },
  {
    name: "Intro call",
    detail: "30 min · mutual, not a screen",
    state: "30 min",
    stateCls: "border-primary/30 bg-primary/10 text-primary",
    nodeCls: "bg-primary",
  },
  {
    name: "Technical deep-dive",
    detail: "real systems · your past work, our stack",
    state: "90 min",
    stateCls: "border-highlight/30 bg-highlight/10 text-highlight",
    nodeCls: "bg-highlight",
  },
  {
    name: "Team conversation",
    detail: "meet the people · ask the hard questions",
    state: "45 min",
    stateCls: "border-accent/30 bg-accent/10 text-accent",
    nodeCls: "bg-accent",
  },
  {
    name: "Offer",
    detail: "clear numbers · no drip negotiation",
    state: "done",
    stateCls: "border-ok/30 bg-ok/10 text-ok",
    nodeCls: "bg-ok",
  },
];

export function HiringProcess() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="process-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeader
            id="process-heading"
            eyebrow="The pipeline"
            title="A process that respects your time."
            lede="Five stages, about two weeks end to end. No take-home marathons, no seven-round gauntlets — we'd rather look at real systems with you."
          />
        </Reveal>

        <Reveal delay={120} className="mt-12">
          <div className="overflow-hidden rounded-[10px] border border-line bg-surface/60">
            <div className="ruler border-b border-line/80 bg-raised/50 px-5 pb-2 pt-2.5">
              <p className="font-mono text-[11px] text-muted">
                runbolt<span className="text-line-strong">/</span>
                <span className="text-fg">hiring-loop</span>
                <span className="text-line-strong"> / </span>
                <span className="text-faint">avg 2 weeks</span>
              </p>
            </div>

            {/* Desktop: horizontal chain */}
            <ol className="relative hidden px-6 py-8 sm:grid sm:grid-cols-5 sm:gap-2" aria-label="Hiring pipeline">
              {stages.map((stage, i) => (
                <li key={stage.name} className="relative">
                  {i < stages.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute right-[-50%] top-[13px] left-[calc(50%+16px)] z-0 h-px bg-line"
                    >
                      <span
                        className="flow-x-dot absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_6px_rgba(199,240,78,0.7)]"
                        style={{ "--flow-delay": `${i * 0.5}s` } as React.CSSProperties}
                      />
                    </span>
                  )}
                  <div className="relative z-10 flex flex-col items-center px-1 text-center">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink ${stage.nodeCls}`}
                      aria-hidden
                    >
                      {i === stages.length - 1 ? (
                        <CheckIcon width={11} height={11} className="text-ok" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-ink/70" />
                      )}
                    </span>
                    <span className="mt-3 text-[13px] font-medium text-fg">
                      {stage.name}
                    </span>
                    <span className="mt-1 font-mono text-[9.5px] leading-snug text-muted/80">
                      {stage.detail}
                    </span>
                    <span
                      className={`mt-2 rounded border px-1.5 py-0.5 font-mono text-[9px] ${stage.stateCls}`}
                    >
                      {stage.state}
                    </span>
                  </div>
                </li>
              ))}
            </ol>

            {/* Mobile: vertical rail */}
            <ol className="relative space-y-1 px-4 py-5 sm:hidden" aria-label="Hiring pipeline">
              {stages.map((stage) => (
                <li key={stage.name} className="relative flex items-center gap-3 py-1.5">
                  <span
                    className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink ${stage.nodeCls}`}
                    aria-hidden
                  >
                    {stage.name === "Offer" ? (
                      <CheckIcon width={11} height={11} className="text-ok" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-ink/70" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium text-fg">
                      {stage.name}
                      <span
                        className={`ml-auto rounded border px-1.5 py-0.5 font-mono text-[9px] ${stage.stateCls}`}
                      >
                        {stage.state}
                      </span>
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted">
                      {stage.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="border-t border-line/80 bg-code px-5 py-3 font-mono text-[10.5px] text-faint">
              every applicant gets a real answer · typically within 5 working days per stage
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
