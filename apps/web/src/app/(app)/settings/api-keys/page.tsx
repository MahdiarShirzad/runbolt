import type { Metadata } from "next";
import { SettingsRoute } from "@/components/dashboard/SettingsRoute";

export const metadata: Metadata = {
  title: "API Keys — Runbolt",
  description: "Manage API keys for programmatic access to Runbolt.",
};

export const dynamic = "force-dynamic";

/** API keys is a section of the cohesive /settings page (legacy path kept). */
export default async function ApiKeysSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <SettingsRoute searchParams={searchParams} fallbackSection="api-keys" />;
}
