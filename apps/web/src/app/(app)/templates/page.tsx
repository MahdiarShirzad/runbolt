import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/dashboard/RoutePlaceholder";

export const metadata: Metadata = {
  title: "Templates — Runbolt",
  description: "Start from prebuilt workflow templates.",
};

export default function TemplatesPage() {
  return (
    <RoutePlaceholder
      title="Templates"
      description="A gallery of prebuilt workflows for common automation patterns — fork one into your workspace and adapt it in the builder."
      planned={[
        "Curated templates for data sync, alerting, and fulfillment",
        "One-click fork into your workspace",
        "Community templates with compatibility metadata",
      ]}
    />
  );
}
