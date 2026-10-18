import { pageMetadata } from "@/lib/seo";
import { SettingsRoute } from "@/components/dashboard/SettingsRoute";

export const metadata = pageMetadata({
  title: "Settings",
  description: "Manage your profile, workspace, preferences, and notifications.",
  path: "/settings",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <SettingsRoute searchParams={searchParams} />;
}
