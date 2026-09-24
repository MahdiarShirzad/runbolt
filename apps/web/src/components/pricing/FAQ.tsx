import { Reveal } from "../landing/Reveal";
import { SectionHeader } from "../ui/kit";
import { FaqItem } from "../ui/faq";

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

export function FAQ() {
  return (
    <section className="py-24 sm:py-32" aria-labelledby="faq-heading">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <SectionHeader
            id="faq-heading"
            eyebrow="FAQ"
            title="Questions, answered."
            lede={
              <>
                Anything else? Reach out at{" "}
                <a
                  href="mailto:hello@runbolt.dev"
                  className="underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-primary"
                >
                  hello@runbolt.dev
                </a>{" "}
                — we answer fast.
              </>
            }
          />
        </Reveal>

        <Reveal delay={120}>
          <div className="border-t border-line/70">
            {faqs.map((faq, i) => (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                name="pricing-faq"
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
