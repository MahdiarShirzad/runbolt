import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { WorkflowCanvas } from "@/components/landing/WorkflowCanvas";
import { DeveloperExperience } from "@/components/landing/DeveloperExperience";
import { ExecutionPipeline } from "@/components/landing/ExecutionPipeline";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div id="top" className="flex w-full flex-col">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <WorkflowCanvas />
        <DeveloperExperience />
        <ExecutionPipeline />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
