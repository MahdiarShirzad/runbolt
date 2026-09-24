import { Reveal } from "../landing/Reveal";
import { SectionHeader } from "../ui/kit";
import { FaqItem } from "../ui/faq";

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


export function FAQAccordion() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="contact-faq-heading">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <SectionHeader
            id="contact-faq-heading"
            eyebrow="FAQ"
            title="Common questions."
            lede="Most answers live in the docs. If yours does not, use the form above — pick the topic that fits best."
          />
        </Reveal>

        <Reveal delay={120}>
          <div className="border-t border-line/70">
            {faqs.map((faq, i) => (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                name="contact-faq"
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
