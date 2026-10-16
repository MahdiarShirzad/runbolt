import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IntegrationDetailView } from "@/components/dashboard/IntegrationDetailView";
import { getIntegration } from "@/lib/dashboard/integrations";

interface IntegrationDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: IntegrationDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const integration = getIntegration(slug);
  if (!integration) {
    return {
      title: "Integration — Runbolt",
      description: "Integration details and connection setup.",
    };
  }
  return {
    title: `${integration.name} — Integrations — Runbolt`,
    description: integration.description,
  };
}

export default async function IntegrationDetailPage({
  params,
}: IntegrationDetailPageProps) {
  const { slug } = await params;
  const integration = getIntegration(slug);
  if (!integration) notFound();

  return <IntegrationDetailView integration={integration} />;
}
