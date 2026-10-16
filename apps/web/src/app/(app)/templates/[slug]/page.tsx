import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    return {
      title: "Template — Runbolt",
      description: "Workflow template details.",
    };
  }
  return {
    title: `${template.name} — Templates — Runbolt`,
    description: template.description,
  };
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
