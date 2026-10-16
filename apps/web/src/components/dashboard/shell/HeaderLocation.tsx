"use client";

import { usePathname } from "next/navigation";
import { Breadcrumbs } from "@/components/docs/Breadcrumbs";
import { resolveAppLocation } from "@/lib/dashboard/nav";

/** Client island: page title / breadcrumbs derived from the current path. */
export function HeaderLocation() {
  const pathname = usePathname();
  const { title, crumbs } = resolveAppLocation(pathname);

  if (crumbs.length > 1) {
    return <Breadcrumbs trail={crumbs} />;
  }

  return (
    <p className="truncate text-sm font-medium tracking-tight text-fg">{title}</p>
  );
}
