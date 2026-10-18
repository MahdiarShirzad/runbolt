import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/dashboard/shell/AppShell";
import type { NotificationItem } from "@/components/dashboard/shell/NotificationsMenu";
import {
  getNotifications,
  getUser,
  notificationTimeLabel,
} from "@/lib/dashboard/data";

/** Authenticated app routes stay out of search indexes. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Authenticated application area. The demo auth flow has no server session
 * yet, so no guard runs here — TODO(auth): verify the session (proxy.ts or
 * this layout) and redirect to /login once real authentication lands.
 */
export default async function AppAreaLayout({ children }: { children: ReactNode }) {
  const [user, notifications] = await Promise.all([getUser(), getNotifications()]);
  const items: NotificationItem[] = notifications.map((item) => ({
    ...item,
    atLabel: notificationTimeLabel(item.at),
  }));

  return (
    <AppShell user={user} notifications={items}>
      {children}
    </AppShell>
  );
}
