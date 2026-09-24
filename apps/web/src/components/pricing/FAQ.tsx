"use client";

import { useId, useState } from "react";
import { Reveal } from "../landing/Reveal";
import { ChevronDownIcon } from "../landing/icons";

const faqs: { question: string; answer: string }[] = [
  {
    question: "Can I start for free?",
    answer:
      "Yes. The Developer plan is free and includes the visual workflow builder, basic execution, and basic logs — enough to build and test your first workflows.",
  },
  {
    question: "Can I upgrade later?",
    answer:
      "Any time. Upgrades apply immediately, and your workflows, history, and configuration carry over unchanged. Downgrades take effect at the end of the current billing period.",
  },
  {
    question: "Do I need a credit card?",
    answer:
      "No. You can create an account and start building on the Developer plan without entering any payment details. A card is only required when you start a paid plan.",
  },
  {
    question: "How are executions counted?",
    answer:
      "One workflow run counts as one execution, no matter how many nodes it contains. Retried steps within the same run do not count as extra executions.",
  },
  {
    question: "Is Runbolt suitable for production workflows?",
    answer:
      "Yes. The Team and Enterprise plans are built for production: background workers, execution history, observability, retries, and alerting are all included.",
  },
  {
    question: "Can teams collaborate?",
    answer:
      "The Team plan adds shared workspaces where everyone can view, edit, and run workflows together, with execution history visible to the whole team.",
  },
];

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const buttonId = useId();
  return (
    <div className="border-b border-line/70">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 text-left text-[15px] font-medium text-fg transition-colors duration-200 hover:text-primary"
        >
          {question}
          <ChevronDownIcon
            width={16}
            height={16}
            className={`shrink-0 text-muted transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 pr-8 text-sm leading-relaxed text-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 sm:py-32" aria-labelledby="faq-heading">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <p className="font-mono text-xs text-highlight">FAQ</p>
          <h2
            id="faq-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Questions, answered.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Anything else? Reach out at{" "}
            <a
              href="mailto:hello@runbolt.dev"
              className="text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-primary"
            >
              hello@runbolt.dev
            </a>{" "}
            — we answer fast.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="border-t border-line/70">
            {faqs.map((faq, i) => (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
