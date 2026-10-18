import { pageMetadata } from "@/lib/seo";
import { WorkflowCreateForm } from "@/components/dashboard/WorkflowCreateForm";
import { getWorkflows } from "@/lib/dashboard/data";

export const metadata = pageMetadata({
  title: "Create workflow",
  description: "Build a new workflow from a trigger, template, or scratch.",
  path: "/workflows/new",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function NewWorkflowPage() {
  const workflows = await getWorkflows();
  return <WorkflowCreateForm existingSlugs={workflows.map((w) => w.slug)} />;
}
