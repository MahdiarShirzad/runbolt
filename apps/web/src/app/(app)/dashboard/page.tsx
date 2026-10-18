import { pageMetadata } from "@/lib/seo";
import { AnalyticsHeader } from "@/components/dashboard/analytics/AnalyticsHeader";
import { ExecutionDurationChart } from "@/components/dashboard/analytics/ExecutionDurationChart";
import { ExecutionHeatmap } from "@/components/dashboard/analytics/ExecutionHeatmap";
import { ExecutionStatusChart } from "@/components/dashboard/analytics/ExecutionStatusChart";
import { ExecutionVolumeChart } from "@/components/dashboard/analytics/ExecutionVolumeChart";
import { FailureCategoryChart } from "@/components/dashboard/analytics/FailureCategoryChart";
import { LatencyDistributionChart } from "@/components/dashboard/analytics/LatencyDistributionChart";
import { MetricCard } from "@/components/dashboard/analytics/MetricCard";
import { RecentExecutionsSection } from "@/components/dashboard/analytics/RecentExecutionsSection";
import { SecondaryMetrics } from "@/components/dashboard/analytics/SecondaryMetrics";
import { SuccessRateChart } from "@/components/dashboard/analytics/SuccessRateChart";
import { TriggerDistributionChart } from "@/components/dashboard/analytics/TriggerDistributionChart";
import { WorkflowPerformanceChart } from "@/components/dashboard/analytics/WorkflowPerformanceChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { getDashboardAnalytics } from "@/lib/dashboard/analytics";
import { analyticsCsv, analyticsCsvFilename } from "@/lib/dashboard/analytics/csv";
import { HEATMAP_HOUR_LABELS } from "@/lib/dashboard/analytics/derive";
import { getWorkspaceSummary, getUser } from "@/lib/dashboard/data";
import { TIME_RANGES, type TimeRange } from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Dashboard",
  description: "Workflow activity, executions, and workspace analytics.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const rangeParam = (await searchParams).range;
  const range: TimeRange = TIME_RANGES.find((r) => r === rangeParam) ?? "7d";

  const [user, workspace] = await Promise.all([getUser(), getWorkspaceSummary()]);
  const analytics = getDashboardAnalytics(range);
  const failedTotal =
    analytics.status.find((stat) => stat.status === "failed")?.count ?? 0;

  return (
    <div className="space-y-4 lg:space-y-5">
      <AnalyticsHeader
        user={user}
        workspace={workspace}
        range={range}
        rangeLabel={analytics.rangeLabel}
        previousLabel={analytics.previousLabel}
        exportCsv={analyticsCsv(analytics)}
        exportFilename={analyticsCsvFilename(range)}
      />

      <section aria-label="Key metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {analytics.kpis.map((kpi) => (
          <MetricCard key={kpi.key} metric={kpi} />
        ))}
      </section>

      <SecondaryMetrics data={analytics.secondary} />

      <ExecutionVolumeChart
        data={analytics.volume}
        rangeLabel={analytics.rangeLabel}
        previousLabel={analytics.previousLabel}
      />

      <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-5">
        <SuccessRateChart data={analytics.successRate} rangeLabel={analytics.rangeLabel} />
        <ExecutionDurationChart data={analytics.duration} rangeLabel={analytics.rangeLabel} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-5">
        <ExecutionStatusChart status={analytics.status} rangeLabel={analytics.rangeLabel} />
        <FailureCategoryChart
          categories={analytics.failureCategories}
          failedTotal={failedTotal}
          rangeLabel={analytics.rangeLabel}
        />
      </div>

      <LatencyDistributionChart
        distribution={analytics.distribution}
        rangeLabel={analytics.rangeLabel}
      />

      <WorkflowPerformanceChart
        data={analytics.workflows}
        rangeLabel={analytics.rangeLabel}
      />

      <div className="grid items-start gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="lg:col-span-2">
          <TriggerDistributionChart
            triggers={analytics.triggers}
            rangeLabel={analytics.rangeLabel}
          />
        </div>
        <QuickActions />
      </div>

      <ExecutionHeatmap
        data={analytics.heatmap}
        hourLabels={HEATMAP_HOUR_LABELS}
        rangeLabel={analytics.rangeLabel}
      />

      <RecentExecutionsSection range={range} />
    </div>
  );
}
