import type { Metadata } from "next";
import { ContactNavbar } from "@/components/contact/ContactNavbar";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactFormSection } from "@/components/contact/ContactForm";
import { ContactOptions } from "@/components/contact/ContactOptions";
import { DeveloperSupport } from "@/components/contact/DeveloperSupport";
import { FAQAccordion } from "@/components/contact/FAQAccordion";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Contact — Runbolt",
  description:
    "Questions, support, integrations, and feedback — reach the Runbolt team or find the right path in the docs.",
};

export default function ContactPage() {
  return (
    <div className="flex w-full flex-col">
      <ContactNavbar />
      <main>
        <ContactHero />
        <ContactFormSection />
        <ContactOptions />
        <DeveloperSupport />
        <FAQAccordion />
        <CTASection
          headline="Ready to build?"
          sub="Explore Runbolt and start designing your workflows."
          primaryLabel="Start Building"
          primaryHref="/register"
          secondaryLabel="Read Documentation"
          secondaryHref="/docs"
        />
      </main>
      <Footer />
    </div>
  );
}
