import { pageMetadata } from "@/lib/seo";
import { SettingsRoute } from "@/components/dashboard/SettingsRoute";

export const metadata = pageMetadata({
  title: "Profile",
  description: "Manage your account and workspace settings.",
  path: "/settings/profile",
  noIndex: true,
});

export const dynamic = "force-dynamic";

/** Profile is a section of the cohesive /settings page (legacy path kept). */
export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <SettingsRoute searchParams={searchParams} fallbackSection="profile" />;
}
