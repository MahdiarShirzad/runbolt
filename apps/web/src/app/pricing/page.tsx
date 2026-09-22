import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CTASection } from "@/components/landing/CTASection";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingCards } from "@/components/pricing/PricingCards";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { UsagePrinciples } from "@/components/pricing/UsagePrinciples";
import { FAQ } from "@/components/pricing/FAQ";

export const metadata: Metadata = {
  title: "Pricing — Runbolt",
  description:
    "Simple, transparent pricing for Runbolt. Start free, upgrade to Team for production workflows, or talk to us about Enterprise.",
};

export default function PricingPage() {
  return (
    <div className="flex w-full flex-col">
      <Navbar />
      <main>
        <PricingHero />
        <PricingCards />
        <ComparisonTable />
        <UsagePrinciples />
        <FAQ />
        <CTASection
          headline="Start building workflows today."
          sub="Create reliable automation pipelines with Runbolt."
          secondaryLabel="Read Documentation"
          secondaryHref="/features#developers"
        />
      </main>
      <Footer />
    </div>
  );
}
