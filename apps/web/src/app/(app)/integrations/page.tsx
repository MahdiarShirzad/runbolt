import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import { IntegrationsView } from "@/components/dashboard/IntegrationsView";
import { IntegrationsPageSkeleton } from "@/components/dashboard/Skeletons";

export const metadata = pageMetadata({
  title: "Integrations",
  description: "Connect Runbolt to the tools you already use.",
  path: "/integrations",
  noIndex: true,
});

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
