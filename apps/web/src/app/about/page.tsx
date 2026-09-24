import type { Metadata } from "next";
import { AboutNavbar } from "@/components/about/AboutNavbar";
import { AboutHero } from "@/components/about/AboutHero";
import { StorySection } from "@/components/about/StorySection";
import { PhilosophySection } from "@/components/about/PhilosophySection";
import { PrinciplesSection } from "@/components/about/PrinciplesSection";
import { NameSection } from "@/components/about/NameSection";
import { SystemVisualization } from "@/components/about/SystemVisualization";
import { ValuesSection } from "@/components/about/ValuesSection";
import { VisionSection } from "@/components/about/VisionSection";
import { TransparencySection } from "@/components/about/TransparencySection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "About — Runbolt",
  description:
    "Why Runbolt exists, the philosophy behind the product, the principles it is built around, and where the platform is heading.",
};

export default function AboutPage() {
  return (
    <div className="flex w-full flex-col">
      <AboutNavbar />
      <main>
        <AboutHero />
        <StorySection />
        <PhilosophySection />
        <PrinciplesSection />
        <NameSection />
        <SystemVisualization />
        <ValuesSection />
        <VisionSection />
        <TransparencySection />
        <CTASection
          headline="See what Runbolt can do."
          sub="Explore the platform, understand the architecture, and start building your own workflows."
          primaryLabel="Start Building"
          primaryHref="/register"
          secondaryLabel="Explore Documentation"
          secondaryHref="/docs"
        />
      </main>
      <Footer />
    </div>
  );
}
