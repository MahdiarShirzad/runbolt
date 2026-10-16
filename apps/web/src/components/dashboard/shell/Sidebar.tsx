import Image from "next/image";
import Link from "next/link";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooter } from "./SidebarFooter";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-ink lg:flex">
      <div className="flex h-14 shrink-0 items-center border-b border-line/70 px-4">
        <Link href="/" className="flex items-center" aria-label="Runbolt dashboard">
          <Image src="/logo.png" alt="Runbolt" width={802} height={180} className="h-6 w-auto" />
        </Link>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
        <SidebarNav />
        <SidebarFooter />
      </div>
    </aside>
  );
}
