import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CTASection } from "@/components/landing/CTASection";
import { FeaturesHero } from "@/components/features/FeaturesHero";
import { FeatureGrid } from "@/components/features/FeatureGrid";
import { BuilderShowcase } from "@/components/features/BuilderShowcase";
import { ExecutionPreview } from "@/components/features/ExecutionPreview";
import { CodeShowcase } from "@/components/features/CodeShowcase";
import { NodeEcosystem } from "@/components/features/NodeEcosystem";
import { ReliabilitySection } from "@/components/features/ReliabilitySection";

export const metadata: Metadata = {
  title: "Features — Runbolt",
  description:
    "Everything Runbolt can do: visual workflow builder, real-time execution, background workers, observability, integrations, and a developer-first API.",
};

export default function FeaturesPage() {
  return (
    <div className="flex w-full flex-col">
      <Navbar />
      <main>
        <FeaturesHero />
        <FeatureGrid />
        <BuilderShowcase />
        <ExecutionPreview />
        <CodeShowcase />
        <NodeEcosystem />
        <ReliabilitySection />
        <CTASection
          headline="Build your next workflow with Runbolt."
          sub="Turn complex automation into reliable, observable execution pipelines."
          secondaryLabel="Explore Documentation"
          secondaryHref="#developers"
        />
      </main>
      <Footer />
    </div>
  );
}
