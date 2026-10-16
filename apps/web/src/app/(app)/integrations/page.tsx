import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/dashboard/RoutePlaceholder";

export const metadata: Metadata = {
  title: "Integrations — Runbolt",
  description: "Connect Runbolt to the tools you already use.",
};

export default function IntegrationsPage() {
  return (
    <RoutePlaceholder
      title="Integrations"
      description="The integration catalog will let you connect APIs, databases, queues, and SaaS tools — then reference them from any workflow node."
      planned={[
        "Curated catalog for HTTP, databases, queues, and SaaS apps",
        "Per-integration health and latency signals",
        "Scoped credentials wired into workflow nodes",
      ]}
    />
  );
}
