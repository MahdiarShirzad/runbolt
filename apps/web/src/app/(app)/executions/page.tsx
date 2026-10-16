import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/dashboard/RoutePlaceholder";

export const metadata: Metadata = {
  title: "Executions — Runbolt",
  description: "Browse, inspect, and replay workflow executions.",
};

export default function ExecutionsPage() {
  return (
    <RoutePlaceholder
      title="Executions"
      description="A full execution browser — filters, logs, retries, and replays — is on the way. The dashboard already surfaces the most recent runs with step-level detail."
      planned={[
        "Searchable history with status, workflow, and time filters",
        "Step timelines with logs, inputs, and outputs",
        "Retry, replay, and dead-letter recovery flows",
      ]}
    />
  );
}
