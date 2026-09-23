"use client";

import { useId, useState } from "react";
import { Reveal } from "../landing/Reveal";
import { ChevronDownIcon } from "../landing/icons";

const faqs: { question: string; answer: string }[] = [
  {
    question: "Where should I store API credentials?",
    answer:
      "In a dedicated secrets store, referenced by name from workflow configuration — not pasted into node definitions or code. Avoid committing credentials to version control, and limit access to the people who actually need them.",
  },
  {
    question: "How should teams handle secrets?",
    answer:
      "Keep secrets separate from workflow logic, scope them to the environments that use them, and rotate them on a schedule and after team membership changes. Review who has access, and make sure secret values never end up in logs or outputs.",
  },
  {
    question: "What data is visible in workflow logs?",
    answer:
      "Logs can include execution states, step timings, errors, retries, and the inputs and outputs of each node. Treat anything a workflow processes as potentially sensitive, and design workflows so secret values never reach the log stream.",
  },
  {
    question: "How should production workflows be configured?",
    answer:
      "Prefer explicit, reviewed configuration over ad-hoc changes. Use dedicated credentials per integration, enable retries and alerting deliberately, and review execution history regularly so failures are understood rather than silent.",
  },
  {
    question: "How can I report a security issue?",
    answer:
      "Send details through the security contact in the section above, including reproduction steps and the affected area. Please do not include real credentials or customer data in reports.",
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
          className="flex w-full items-center justify-between gap-4 py-5 text-left text-[15px] font-medium text-fg transition-colors duration-200 hover:text-highlight"
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

export function SecurityFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 sm:py-28" aria-labelledby="security-faq-heading">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <p className="font-mono text-xs text-highlight">FAQ</p>
          <h2
            id="security-faq-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Security questions, answered.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Something else on your mind? Reach out at{" "}
            <a
              href="mailto:hello@runbolt.dev"
              className="text-info transition-colors hover:text-highlight"
            >
              hello@runbolt.dev
            </a>
            .
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
