import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/dashboard/RoutePlaceholder";

export const metadata: Metadata = {
  title: "Profile — Runbolt",
  description: "Manage your account and workspace settings.",
};

export default function ProfileSettingsPage() {
  return (
    <RoutePlaceholder
      title="Profile & settings"
      description="Account preferences, team members, API keys, and workspace settings will live here. Sign out is already available from the account menu."
      planned={[
        "Profile, notifications, and appearance preferences",
        "Workspace members, roles, and invitations",
        "API keys and active session management",
      ]}
    />
  );
}
