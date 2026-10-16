import type { Metadata } from "next";
import { WorkflowCreateForm } from "@/components/dashboard/WorkflowCreateForm";
import { getWorkflows } from "@/lib/dashboard/data";

export const metadata: Metadata = {
  title: "Create workflow — Runbolt",
  description: "Build a new workflow from a trigger, template, or scratch.",
};

export const dynamic = "force-dynamic";

export default async function NewWorkflowPage() {
  const workflows = await getWorkflows();
  return <WorkflowCreateForm existingSlugs={workflows.map((w) => w.slug)} />;
}
