import type { ReactNode } from "react";
import {
  BookIcon,
  GlobeIcon,
  NodeGraphIcon,
  PulseIcon,
  RetryIcon,
  WebhookIcon,
  EyeOffIcon,
} from "@/components/landing/icons";
import { SettingsIcon } from "@/components/dashboard/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  /** Route exists as a placeholder only — not wired to real data yet. */
  soon?: boolean;
  /** Match only this exact path (default matches children too). */
  exact?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const appNavSections: NavSection[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <PulseIcon width={15} height={15} /> },
      { label: "Workflows", href: "/workflows", icon: <NodeGraphIcon width={15} height={15} /> },
      { label: "Executions", href: "/executions", icon: <RetryIcon width={15} height={15} />, soon: true },
      { label: "Integrations", href: "/integrations", icon: <GlobeIcon width={15} height={15} />, soon: true },
      { label: "Templates", href: "/templates", icon: <BookIcon width={15} height={15} />, soon: true },
    ],
  },
  {
    label: "Develop",
    items: [
      { label: "Webhooks", href: "/webhooks", icon: <WebhookIcon width={15} height={15} />, soon: true },
      { label: "Credentials", href: "/credentials", icon: <EyeOffIcon width={15} height={15} />, soon: true },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", href: "/settings/profile", icon: <SettingsIcon width={15} height={15} />, soon: true, exact: false },
    ],
  },
];

export const allNavItems: NavItem[] = appNavSections.flatMap((s) => s.items);

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.exact || item.href === "/dashboard") return pathname === item.href;
  if (item.href === "/settings/profile") {
    return pathname === item.href || pathname.startsWith("/settings");
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  workflows: "Workflows",
  executions: "Executions",
  integrations: "Integrations",
  templates: "Templates",
  webhooks: "Webhooks",
  credentials: "Credentials",
  settings: "Settings",
  profile: "Profile",
};

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface AppLocation {
  title: string;
  crumbs: Breadcrumb[];
}

export function resolveAppLocation(pathname: string): AppLocation {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Breadcrumb[] = segments.map((segment, i) => ({
    label: SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1),
    href: i < segments.length - 1 ? `/${segments.slice(0, i + 1).join("/")}` : undefined,
  }));
  const title = crumbs.length > 0 ? crumbs[crumbs.length - 1].label : "Dashboard";
  return { title, crumbs };
}
