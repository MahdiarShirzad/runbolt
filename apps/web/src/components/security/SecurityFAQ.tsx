import { Reveal } from "../landing/Reveal";
import { SectionHeader } from "../ui/kit";
import { FaqItem } from "../ui/faq";

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


export function SecurityFAQ() {
  return (
    <section id="faq" className="py-20 sm:py-28" aria-labelledby="security-faq-heading">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <SectionHeader
            id="security-faq-heading"
            eyebrow="FAQ"
            title="Security questions, answered."
            lede={
              <>
                Something else on your mind? Reach out at{" "}
                <a
                  href="mailto:hello@runbolt.dev"
                  className="underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-primary"
                >
                  hello@runbolt.dev
                </a>
                .
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
                name="security-faq"
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
