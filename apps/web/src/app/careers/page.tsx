import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CTASection } from "@/components/landing/CTASection";
import { CareersHero } from "@/components/careers/CareersHero";
import { OpenRoles } from "@/components/careers/OpenRoles";
import { HiringProcess } from "@/components/careers/HiringProcess";

export const metadata: Metadata = {
  title: "Careers — Runbolt",
  description:
    "Join Runbolt: a small team building workflow execution infrastructure — execution engines, builders, and developer tooling.",
};

export default function CareersPage() {
  return (
    <div className="flex w-full flex-col">
      <Navbar />
      <main>
        <CareersHero />
        <OpenRoles />
        <HiringProcess />
        <CTASection
          headline="Automation is infrastructure. Help us build it."
          sub="Read about the product and the principles behind it — then introduce yourself."
          primaryLabel="Explore the Product"
          primaryHref="/features"
          secondaryLabel="Read Our Story"
          secondaryHref="/about"
        />
      </main>
      <Footer />
    </div>
  );
}
