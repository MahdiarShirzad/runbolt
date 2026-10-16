import type { Metadata } from "next";
import { Suspense } from "react";
import { TemplatesView } from "@/components/dashboard/TemplatesView";
import { TemplatesPageSkeleton } from "@/components/dashboard/Skeletons";
import { INTEGRATIONS } from "@/lib/dashboard/integrations";
import { TEMPLATES, TEMPLATE_CATEGORY_LABELS } from "@/lib/dashboard/templates";
import type { TemplateCategory } from "@/lib/dashboard/templates";

export const metadata: Metadata = {
  title: "Templates — Runbolt",
  description: "Start from prebuilt workflow templates.",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const rawCategory = first(sp.category);
  const category =
    rawCategory && rawCategory in TEMPLATE_CATEGORY_LABELS
      ? (rawCategory as TemplateCategory)
      : "all";

  const rawSort = first(sp.sort);
  const sort = rawSort === "category" || rawSort === "setup" ? rawSort : "name";

  const integrationNames = new Map(
    INTEGRATIONS.map((integration) => [integration.slug, integration.name]),
  );

  return (
    <Suspense fallback={<TemplatesPageSkeleton />}>
      <TemplatesView
        templates={TEMPLATES}
        integrationNames={integrationNames}
        initial={{
          q: first(sp.q) ?? "",
          category,
          integration: first(sp.integration) ?? "",
          sort,
        }}
      />
    </Suspense>
  );
}
