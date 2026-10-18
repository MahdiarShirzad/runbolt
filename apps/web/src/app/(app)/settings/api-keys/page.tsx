import { pageMetadata } from "@/lib/seo";
import { SettingsRoute } from "@/components/dashboard/SettingsRoute";

export const metadata = pageMetadata({
  title: "API Keys",
  description: "Manage API keys for programmatic access to Runbolt.",
  path: "/settings/api-keys",
  noIndex: true,
});

export const dynamic = "force-dynamic";

/** API keys is a section of the cohesive /settings page (legacy path kept). */
export default async function ApiKeysSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <SettingsRoute searchParams={searchParams} fallbackSection="api-keys" />;
}
