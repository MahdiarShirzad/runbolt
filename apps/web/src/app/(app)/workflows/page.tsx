import type { Metadata } from "next";
import { Suspense } from "react";
import { MetricsSkeleton, WorkflowsListSkeleton } from "@/components/dashboard/Skeletons";
import { WorkflowsHeader } from "@/components/dashboard/WorkflowsHeader";
import { WorkflowsSection } from "@/components/dashboard/WorkflowsSection";
import { WorkflowsStats } from "@/components/dashboard/WorkflowsStats";

export const metadata: Metadata = {
  title: "Workflows — Runbolt",
  description: "Create, manage, and monitor every workflow in your workspace.",
};

export const dynamic = "force-dynamic";

export default function WorkflowsPage() {
  return (
    <div className="space-y-4 lg:space-y-5">
      <WorkflowsHeader />

      <Suspense fallback={<MetricsSkeleton />}>
        <WorkflowsStats />
      </Suspense>

      <Suspense fallback={<WorkflowsListSkeleton />}>
        <WorkflowsSection />
      </Suspense>
    </div>
  );
}
