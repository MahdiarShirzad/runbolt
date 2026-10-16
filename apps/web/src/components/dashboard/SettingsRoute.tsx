import { Suspense } from "react";
import { getWorkspaceSummary, getUser } from "@/lib/dashboard/data";
import { isSettingsSectionId } from "@/lib/dashboard/settings";
import type { SettingsSectionId } from "@/lib/dashboard/settings";
import { SettingsPage } from "./SettingsPage";
import { SettingsPageSkeleton } from "./Skeletons";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Server composition for the settings surface, shared by /settings and the
 * legacy /settings/profile path so both render the same cohesive page.
 */
export async function SettingsRoute({
  searchParams,
  fallbackSection,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  fallbackSection?: SettingsSectionId;
}) {
  const sp = await searchParams;
  const rawSection = first(sp.section);
  const section =
    rawSection && isSettingsSectionId(rawSection)
      ? rawSection
      : (fallbackSection ?? "profile");

  const [user, workspace] = await Promise.all([
    getUser(),
    getWorkspaceSummary(),
  ]);

  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsPage user={user} workspace={workspace} initialSection={section} />
    </Suspense>
  );
}
