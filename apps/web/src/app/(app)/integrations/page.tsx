import type { Metadata } from "next";
import { Suspense } from "react";
import { IntegrationsView } from "@/components/dashboard/IntegrationsView";
import { IntegrationsPageSkeleton } from "@/components/dashboard/Skeletons";

export const metadata: Metadata = {
  title: "Integrations — Runbolt",
  description: "Connect Runbolt to the tools you already use.",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tab = first(sp.tab) === "connected" ? "connected" : "catalog";

  return (
    <Suspense fallback={<IntegrationsPageSkeleton />}>
      <IntegrationsView initialTab={tab} />
    </Suspense>
  );
}
