import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
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
    return pageMetadata({
      title: "Integration",
      description: "Integration details and connection setup.",
      path: `/integrations/${slug}`,
      noIndex: true,
    });
  }
  return pageMetadata({
    title: `${integration.name} — Integrations`,
    description: integration.description,
    path: `/integrations/${slug}`,
    noIndex: true,
  });
}

export default async function IntegrationDetailPage({
  params,
}: IntegrationDetailPageProps) {
  const { slug } = await params;
  const integration = getIntegration(slug);
  if (!integration) notFound();

  return <IntegrationDetailView integration={integration} />;
}
