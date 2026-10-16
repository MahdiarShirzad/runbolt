import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/dashboard/RoutePlaceholder";

export const metadata: Metadata = {
  title: "Workflows — Runbolt",
  description: "Design, version, and run workflows.",
};

export default function WorkflowsPage() {
  return (
    <RoutePlaceholder
      title="Workflows"
      description="The workflow list and visual builder are the next surface shipping for Runbolt. Everything on the dashboard already reads from the same workflow model."
      planned={[
        "List, search, and filter workflows by status and trigger",
        "Visual node editor with versioning and environments",
        "Per-workflow run history, schedules, and one-off runs",
      ]}
    />
  );
}
