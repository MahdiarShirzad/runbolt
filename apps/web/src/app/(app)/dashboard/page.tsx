import type { Metadata } from "next";
import { Suspense } from "react";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { ExecutionsSection } from "@/components/dashboard/ExecutionsSection";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  ChartSkeleton,
  MetricsSkeleton,
  TableSkeleton,
  WorkflowsSkeleton,
} from "@/components/dashboard/Skeletons";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { WorkflowOverview } from "@/components/dashboard/WorkflowOverview";
import { getWorkspaceSummary, getUser } from "@/lib/dashboard/data";
import { TIME_RANGES, type TimeRange } from "@/lib/dashboard/types";

export const metadata: Metadata = {
  title: "Dashboard — Runbolt",
  description: "Workflow activity, executions, and workspace overview.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const rangeParam = (await searchParams).range;
  const range: TimeRange = TIME_RANGES.find((r) => r === rangeParam) ?? "7d";

  const [user, workspace] = await Promise.all([getUser(), getWorkspaceSummary()]);

  return (
    <div className="space-y-4 lg:space-y-5">
      <WelcomeHeader user={user} workspace={workspace} />

      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsGrid range={range} />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <ActivityChart range={range} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <ExecutionsSection />
      </Suspense>

      <div className="grid items-start gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="lg:col-span-2">
          <Suspense fallback={<WorkflowsSkeleton />}>
            <WorkflowOverview />
          </Suspense>
        </div>
        <QuickActions />
      </div>
    </div>
  );
}
