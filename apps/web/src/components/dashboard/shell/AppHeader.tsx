import type { SessionUser } from "@/lib/dashboard/types";
import { HeaderLocation } from "./HeaderLocation";
import { MobileNav } from "./MobileNav";
import { NotificationsMenu, type NotificationItem } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";

/** Top bar: mobile nav trigger, page location, notifications, account menu. */
export function AppHeader({
  user,
  notifications,
}: {
  user: SessionUser | null;
  notifications: NotificationItem[];
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <MobileNav />
        <HeaderLocation />
        <div className="ml-auto flex items-center gap-2">
          <NotificationsMenu items={notifications} />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
