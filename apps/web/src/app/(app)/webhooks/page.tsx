import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/dashboard/RoutePlaceholder";

export const metadata: Metadata = {
  title: "Webhooks — Runbolt",
  description: "Manage inbound webhook endpoints and deliveries.",
};

export default function WebhooksPage() {
  return (
    <RoutePlaceholder
      title="Webhooks"
      description="Inbound webhook endpoints — signing secrets, delivery logs, and replay — will be manageable here once the events API ships."
      planned={[
        "Endpoint management with per-workflow routing",
        "Signed payloads and secret rotation",
        "Delivery inspection with one-click replay",
      ]}
    />
  );
}
