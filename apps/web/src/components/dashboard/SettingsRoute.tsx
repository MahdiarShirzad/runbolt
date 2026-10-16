import { Suspense } from "react";
import { getWorkspaceSummary, getUser } from "@/lib/dashboard/data";
import {
  formatApiKeyRow,
  getApiKeys,
} from "@/lib/dashboard/api-keys";
import type { ApiKeyDisplayRow } from "@/lib/dashboard/api-keys";
import { currentTimestamp } from "@/lib/dashboard/format";
import { isSettingsSectionId } from "@/lib/dashboard/settings";
import type { SettingsSectionId } from "@/lib/dashboard/settings";
import { SettingsPage } from "./SettingsPage";
import { SettingsPageSkeleton } from "./Skeletons";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Server composition for the settings surface, shared by /settings and the
 * legacy /settings/profile and /settings/api-keys paths so all render the
 * same cohesive page.
 *
 * API key rows are fetched and label-formatted here (one timestamp read)
 * so the client island never calls the clock during render.
 * TODO(api): `getApiKeys` maps sample data until GET /v1/api-keys exists.
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

  const nowMs = currentTimestamp();
  const [user, workspace] = await Promise.all([
    getUser(),
    getWorkspaceSummary(),
  ]);
  const apiKeyRows: ApiKeyDisplayRow[] = getApiKeys(nowMs).map((row) =>
    formatApiKeyRow(row, nowMs),
  );

  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsPage
        user={user}
        workspace={workspace}
        initialSection={section}
        apiKeyRows={apiKeyRows}
      />
    </Suspense>
  );
}
