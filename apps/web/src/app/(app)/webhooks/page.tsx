import type { Metadata } from "next";
import { Suspense } from "react";
import {
  WebhooksBrowser,
  type WebhookEndpointRow,
  type WebhooksListState,
  type WebhookWorkflowOption,
} from "@/components/dashboard/WebhooksBrowser";
import { WebhooksPageSkeleton } from "@/components/dashboard/Skeletons";
import { getWorkflows } from "@/lib/dashboard/data";
import {
  currentTimestamp,
  formatAbsoluteTime,
  formatRelativeTime,
} from "@/lib/dashboard/format";
import { getWebhookDeliveries, getWebhookEndpoints } from "@/lib/dashboard/webhooks";

export const metadata: Metadata = {
  title: "Webhooks — Runbolt",
  description: "Manage inbound webhook endpoints and deliveries.",
};

export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function WebhooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [endpoints, workflows] = await Promise.all([
    getWebhookEndpoints(),
    getWorkflows(),
  ]);
  const now = currentTimestamp();

  const rows: WebhookEndpointRow[] = await Promise.all(
    endpoints.map(async (endpoint) => {
      const deliveries = await getWebhookDeliveries(endpoint.id);
      const processedCount = deliveries.filter(
        (d) => d.status === "processed",
      ).length;
      const failedCount = deliveries.filter((d) => d.status === "failed").length;
      const last = deliveries[0] ?? null;
      return {
        id: endpoint.id,
        name: endpoint.name,
        description: endpoint.description,
        workflowId: endpoint.workflowId,
        workflowSlug: endpoint.workflowSlug,
        workflowName: endpoint.workflowName,
        status: endpoint.status,
        urlMasked: endpoint.urlMasked,
        urlFull: endpoint.url,
        authLabel:
          endpoint.authMethod === "hmac-sha256" ? "HMAC SHA-256" : "None",
        createdLabel: formatRelativeTime(endpoint.createdAt, now),
        createdAbsolute: formatAbsoluteTime(endpoint.createdAt),
        lastEventLabel: endpoint.lastEventAt
          ? formatRelativeTime(endpoint.lastEventAt, now)
          : null,
        lastEventAbsolute: endpoint.lastEventAt
          ? formatAbsoluteTime(endpoint.lastEventAt)
          : null,
        processedCount,
        failedCount,
        totalCount: deliveries.length,
        lastDeliveryStatus: last?.status ?? null,
      };
    }),
  );

  // Only workflows that actually own an endpoint appear in the filter.
  const endpointWorkflowIds = new Set(rows.map((row) => row.workflowId));
  const workflowOptions: WebhookWorkflowOption[] = workflows
    .filter((workflow) => endpointWorkflowIds.has(workflow.id))
    .map((workflow) => ({ id: workflow.id, name: workflow.name }));

  const rawStatus = first(sp.status);
  const status: WebhooksListState["status"] =
    rawStatus === "active" || rawStatus === "disabled" ? rawStatus : "all";
  const rawSort = first(sp.sort);
  const sort: WebhooksListState["sort"] =
    rawSort === "activity" || rawSort === "name" ? rawSort : "created";

  const initial: WebhooksListState = {
    status,
    workflowId: first(sp.workflow) || "all",
    q: first(sp.q) ?? "",
    sort,
  };

  return (
    <Suspense fallback={<WebhooksPageSkeleton />}>
      <WebhooksBrowser
        rows={rows}
        workflowOptions={workflowOptions}
        initial={initial}
      />
    </Suspense>
  );
}
