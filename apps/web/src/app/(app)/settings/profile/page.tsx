import type { Metadata } from "next";
import { SettingsRoute } from "@/components/dashboard/SettingsRoute";

export const metadata: Metadata = {
  title: "Profile — Runbolt",
  description: "Manage your account and workspace settings.",
};

export const dynamic = "force-dynamic";

/** Profile is a section of the cohesive /settings page (legacy path kept). */
export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <SettingsRoute searchParams={searchParams} fallbackSection="profile" />;
}
