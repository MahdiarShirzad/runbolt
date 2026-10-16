import type { Metadata } from "next";
import { SettingsRoute } from "@/components/dashboard/SettingsRoute";

export const metadata: Metadata = {
  title: "Settings — Runbolt",
  description: "Manage your profile, workspace, preferences, and notifications.",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <SettingsRoute searchParams={searchParams} />;
}
