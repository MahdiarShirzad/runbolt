import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CTASection } from "@/components/landing/CTASection";
import { SecurityHero } from "@/components/security/SecurityHero";
import { SecurityPrinciples } from "@/components/security/SecurityPrinciple";
import { SecretsPreview } from "@/components/security/SecretsPreview";
import { AccessControlPreview } from "@/components/security/AccessControlPreview";
import { ArchitectureDiagram } from "@/components/security/ArchitectureDiagram";
import { WorkflowIsolation } from "@/components/security/WorkflowIsolation";
import { ExecutionLogs } from "@/components/security/ExecutionLogs";
import { SecurityRoadmap } from "@/components/security/SecurityRoadmap";
import { ResponsibleDisclosure } from "@/components/security/ResponsibleDisclosure";
import { SecurityFAQ } from "@/components/security/SecurityFAQ";

export const metadata: Metadata = {
  title: "Security — Runbolt",
  description:
    "How Runbolt approaches security: developer control over workflows, credentials, and executions, with visibility into what happens at every step — and a clear roadmap of what comes next.",
};

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Documentation", href: "/docs" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API", href: "/docs/api" },
      { label: "SDKs", href: "/docs/sdks" },
      { label: "Changelog", href: "/docs/getting-started" },
      { label: "GitHub", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Guides", href: "/docs" },
      { label: "FAQ", href: "/security#faq" },
      { label: "Troubleshooting", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "mailto:hello@runbolt.dev" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export default function SecurityPage() {
  return (
    <div className="flex w-full flex-col">
      <Navbar />
      <main>
        <SecurityHero />
        <SecurityPrinciples />
        <SecretsPreview />
        <AccessControlPreview />
        <ArchitectureDiagram />
        <WorkflowIsolation />
        <ExecutionLogs />
        <SecurityRoadmap />
        <ResponsibleDisclosure />
        <SecurityFAQ />
        <CTASection
          headline="Build with confidence."
          sub="Explore the Runbolt documentation and understand how workflows, executions, integrations, and security controls fit together."
          primaryLabel="Read Documentation"
          primaryHref="/docs"
          secondaryLabel="Start Building"
          secondaryHref="/register"
        />
      </main>
      <Footer
        columns={footerColumns}
        columnsClass="lg:grid-cols-[1.3fr_repeat(5,1fr)]"
      />
    </div>
  );
}
