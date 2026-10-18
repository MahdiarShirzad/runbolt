import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { TemplateDetailView } from "@/components/dashboard/TemplateDetailView";
import { getWorkflows } from "@/lib/dashboard/data";
import { getTemplate } from "@/lib/dashboard/templates";

interface TemplateDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TemplateDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplate(slug);
  if (!template) {
    return pageMetadata({
      title: "Template",
      description: "Workflow template details.",
      path: `/templates/${slug}`,
      noIndex: true,
    });
  }
  return pageMetadata({
    title: `${template.name} — Templates`,
    description: template.description,
    path: `/templates/${slug}`,
    noIndex: true,
  });
}

export const dynamic = "force-dynamic";

export default async function TemplateDetailPage({
  params,
}: TemplateDetailPageProps) {
  const { slug } = await params;
  const template = getTemplate(slug);
  if (!template) notFound();

  const workflows = await getWorkflows();

  return (
    <TemplateDetailView
      template={template}
      existingSlugs={workflows.map((workflow) => workflow.slug)}
    />
  );
}
