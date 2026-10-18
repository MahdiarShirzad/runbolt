import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import {
  WebhookDetailView,
  type WebhookDetailData,
} from "@/components/dashboard/WebhookDetailView";
import {
  currentTimestamp,
  formatAbsoluteTime,
  formatDuration,
  formatRelativeTime,
} from "@/lib/dashboard/format";
import { getWebhookDeliveries, getWebhookEndpoint } from "@/lib/dashboard/webhooks";

interface WebhookDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: WebhookDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const endpoint = await getWebhookEndpoint(id);
  if (!endpoint) {
    return pageMetadata({
      title: "Webhook",
      description: "Webhook endpoint details and delivery history.",
      path: `/webhooks/${id}`,
      noIndex: true,
    });
  }
  return pageMetadata({
    title: `${endpoint.name} — Webhooks`,
    description: endpoint.description,
    path: `/webhooks/${id}`,
    noIndex: true,
  });
}

export const dynamic = "force-dynamic";

export default async function WebhookDetailPage({
  params,
}: WebhookDetailPageProps) {
  const { id } = await params;
  const endpoint = await getWebhookEndpoint(id);
  if (!endpoint) notFound();

  const [deliveries] = await Promise.all([getWebhookDeliveries(id)]);
  const now = currentTimestamp();

  const detail: WebhookDetailData = {
    endpoint,
    deliveries,
    createdLabel: formatRelativeTime(endpoint.createdAt, now),
    createdAbsolute: formatAbsoluteTime(endpoint.createdAt),
    lastEventLabel: endpoint.lastEventAt
      ? formatRelativeTime(endpoint.lastEventAt, now)
      : null,
    lastEventAbsolute: endpoint.lastEventAt
      ? formatAbsoluteTime(endpoint.lastEventAt)
      : null,
    deliveryRows: deliveries.map((delivery) => ({
      id: delivery.id,
      receivedLabel: formatRelativeTime(delivery.receivedAt, now),
      receivedAbsolute: formatAbsoluteTime(delivery.receivedAt),
      status: delivery.status,
      executionId: delivery.executionId,
      durationLabel:
        delivery.durationMs == null ? "—" : formatDuration(delivery.durationMs),
      error: delivery.error,
    })),
  };

  return <WebhookDetailView detail={detail} />;
}
