import type { ReactNode } from "react";
import { Reveal } from "../landing/Reveal";
import { CheckIcon } from "../landing/icons";
import { ShieldIconSvg, WorkerIcon, ZapIcon } from "./plan-icons";

type Plan = {
  name: string;
  icon: ReactNode;
  description: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    name: "Developer",
    icon: <ZapIcon width={15} height={15} />,
    description: "For individual developers exploring automation.",
    price: "Free",
    features: [
      "Create workflows",
      "Basic workflow execution",
      "Visual workflow builder",
      "Community access",
      "Basic logs",
    ],
    cta: "Start Building",
  },
  {
    name: "Team",
    icon: <WorkerIcon width={15} height={15} />,
    description: "For engineering teams building production workflows.",
    price: "$29",
    period: "/ month",
    features: [
      "Everything in Developer",
      "More executions",
      "Advanced workflow features",
      "Team collaboration",
      "Better observability",
      "Execution history",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    icon: <ShieldIconSvg width={15} height={15} />,
    description: "For organizations with advanced requirements.",
    price: "Custom",
    features: [
      "Everything in Team",
      "Advanced security",
      "Custom limits",
      "Dedicated support",
      "Enterprise controls",
    ],
    cta: "Contact Sales",
  },
];

function PricingCard({ plan }: { plan: Plan }) {
  return (
    <article
      className={`relative flex h-full flex-col rounded-[10px] border p-6 transition-colors duration-200 ${
        plan.highlighted
          ? "border-primary/50 bg-surface shadow-[0_0_0_1px_rgba(199,240,78,0.25),0_16px_48px_-20px_rgba(3,5,9,0.9)]"
          : "border-line bg-surface/60 hover:border-line-strong hover:bg-surface"
      }`}
    >
      {plan.highlighted && (
        <span className="absolute -top-2.5 left-6 rounded border border-primary/40 bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-button-text">
          Most popular
        </span>
      )}

      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded border ${
            plan.highlighted
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-line bg-raised text-muted"
          }`}
        >
          {plan.icon}
        </span>
        <h3 className="font-display text-[15px] font-semibold tracking-tight">{plan.name}</h3>
      </div>

      <p className="mt-3 min-h-10 text-sm leading-relaxed text-muted">
        {plan.description}
      </p>

      <p className="mt-5 flex items-baseline gap-1.5">
        <span className="font-display text-4xl font-semibold tracking-tight text-fg">
          {plan.price}
        </span>
        {plan.period && <span className="text-sm text-muted">{plan.period}</span>}
      </p>

      <a
        href="#cta"
        className={`mt-6 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors duration-200 ${
          plan.highlighted
            ? "bg-primary text-button-text hover:bg-primary-strong"
            : "border border-line bg-raised text-fg hover:border-line-strong hover:bg-hover"
        }`}
      >
        {plan.cta}
      </a>

      <ul className="mt-6 space-y-2.5 border-t border-line/70 pt-5">
        {plan.features.map((feature, i) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <CheckIcon
              width={13}
              height={13}
              className={`mt-0.5 shrink-0 ${i === 0 ? "text-highlight" : "text-ok"}`}
            />
            <span className="text-muted">{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function PricingCards() {
  return (
    <section id="plans" className="pb-24 sm:pb-32" aria-label="Pricing plans">
      <div className="mx-auto grid max-w-5xl gap-5 px-5 sm:px-8 lg:grid-cols-3 lg:gap-6">
        {plans.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 100} className="h-full">
            <PricingCard plan={plan} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
