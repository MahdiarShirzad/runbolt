"use client";

import { useId, useState } from "react";
import { Reveal } from "../landing/Reveal";
import { ChevronDownIcon } from "../landing/icons";

const faqs: { question: string; answer: string }[] = [
  {
    question: "Where can I learn how Runbolt works?",
    answer:
      "Start with the documentation — core concepts cover workflows, nodes, triggers, and executions. From there, the guides walk through building and running your first workflow end to end.",
  },
  {
    question: "How can I report a security issue?",
    answer:
      "Use the Security page path. It describes how Runbolt approaches security and how to raise a potential concern. Avoid including credentials or customer data in any report.",
  },
  {
    question: "Can I request a feature?",
    answer:
      "Yes. Choose Feedback in the contact form and describe the problem you are trying to solve — context about your workflow or stack helps more than a single feature name.",
  },
  {
    question: "How do I get started?",
    answer:
      "Read the getting started guide in the documentation, then open the workflow builder and compose your first graph. Start Building in the navigation creates an account when you are ready.",
  },
  {
    question: "Where can I find API information?",
    answer:
      "API references live in the documentation under Developers → API. They cover authentication, workflow definitions, and execution endpoints with request and response examples.",
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
            className={`shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-28" aria-labelledby="contact-faq-heading">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <p className="font-mono text-xs text-highlight">FAQ</p>
          <h2
            id="contact-faq-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Common questions.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Most answers live in the docs. If yours does not, use the form
            above — pick the topic that fits best.
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
