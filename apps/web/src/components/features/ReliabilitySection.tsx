import type { ReactNode } from "react";
import { Reveal } from "../landing/Reveal";
import { SectionHeader } from "../ui/kit";
import { EyeIcon, PulseIcon, RetryIcon, WorkerIcon } from "../landing/icons";

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M12 2.5 4.5 5.5v6c0 4.7 3.2 8.3 7.5 10 4.3-1.7 7.5-5.3 7.5-10v-6L12 2.5Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.7" />
    </svg>
  );
}

function ClockShield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

type Capability = {
  icon: ReactNode;
  title: string;
  description: string;
};

const capabilities: Capability[] = [
  {
    icon: <RetryIcon />,
    title: "Retries",
    description:
      "Automatic retries with exponential backoff and per-step retry policies.",
  },
  {
    icon: <ClockShield />,
    title: "Timeouts",
    description:
      "Per-step and per-run deadlines, so nothing hangs forever waiting on a slow dependency.",
  },
  {
    icon: <ShieldIcon />,
    title: "Error handling",
    description:
      "Route failures to fallback paths, dead-letter queues, or your on-call alerting.",
  },
  {
    icon: <PulseIcon />,
    title: "Execution states",
    description:
      "Every run is a state machine — queued, running, retried, succeeded, failed — and always queryable.",
  },
  {
    icon: <EyeIcon />,
    title: "Observability",
    description:
      "Structured logs, outputs, and timing for every step of every execution.",
  },
  {
    icon: <WorkerIcon />,
    title: "Background processing",
    description:
      "Long jobs survive restarts and keep running where plain HTTP requests cannot.",
  },
];

export function ReliabilitySection() {
  return (
    <section
      className="border-y border-line/70 bg-surface/40 py-24 sm:py-32"
      aria-labelledby="reliability-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeader
            id="reliability-heading"
            eyebrow="Reliability"
            title="Built for workflows that cannot fail silently."
            lede="Automation you cannot trust is worse than no automation. Runbolt treats failure as a first-class state — visible, handled, and recoverable."
          />
        </Reveal>

        <div className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap, i) => (
            <Reveal key={cap.title} delay={(i % 3) * 80}>
              <div className="flex items-start gap-3.5 border-t border-line/70 py-6">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-raised text-info">
                  {cap.icon}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-fg">
                    {cap.title}
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-muted">
                    {cap.description}
                  </span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
