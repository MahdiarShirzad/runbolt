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
      className={`relative flex flex-col rounded-xl border p-6 transition-all duration-200 ${
        plan.highlighted
          ? "border-primary/60 bg-surface shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_8px_40px_-8px_rgba(59,130,246,0.35)]"
          : "border-line bg-surface/60 hover:-translate-y-0.5 hover:border-[#33406a] hover:bg-surface"
      }`}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-6 rounded-full border border-primary/50 bg-active px-2.5 py-0.5 text-[11px] font-medium text-primary">
          Most popular
        </span>
      )}

      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-md border ${
            plan.highlighted
              ? "border-primary/40 bg-primary/15 text-primary"
              : "border-line bg-raised text-muted"
          }`}
        >
          {plan.icon}
        </span>
        <h3 className="text-[15px] font-semibold tracking-tight">{plan.name}</h3>
      </div>

      <p className="mt-3 min-h-10 text-sm leading-relaxed text-muted">
        {plan.description}
      </p>

      <p className="mt-5 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-tight text-fg">
          {plan.price}
        </span>
        {plan.period && <span className="text-sm text-muted">{plan.period}</span>}
      </p>

      <a
        href="#cta"
        className={`mt-6 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors duration-200 ${
          plan.highlighted
            ? "bg-primary text-white shadow-[0_2px_16px_rgba(59,130,246,0.4)] hover:bg-[#2f76ef]"
            : "border border-line bg-raised text-fg hover:border-[#3a466b] hover:bg-hover"
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
              className={`mt-0.5 shrink-0 ${i === 0 ? "text-accent" : "text-ok"}`}
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
