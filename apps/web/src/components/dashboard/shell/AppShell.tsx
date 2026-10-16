import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/dashboard/types";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";
import type { NotificationItem } from "./NotificationsMenu";

/**
 * Authenticated application shell: fixed sidebar (desktop), responsive
 * drawer (mobile), sticky top bar, and the page content region.
 */
export function AppShell({
  user,
  notifications,
  children,
}: {
  user: SessionUser | null;
  notifications: NotificationItem[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink">
      <a
        href="#app-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-[13px] focus:font-medium focus:text-button-text"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-60">
        <AppHeader user={user} notifications={notifications} />
        <main id="app-main" className="flex-1">
          <div className="mx-auto w-full max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
