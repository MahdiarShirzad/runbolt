"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const desktopLinkCls = (active: boolean) =>
  `relative rounded-md px-3 py-2 text-[13.5px] transition-all duration-300 ${
    active
      ? "bg-surface font-medium text-fg ring-1 ring-line"
      : "text-muted hover:bg-hover hover:text-fg"
  }`;

/** Client island owning the active-link state of the desktop nav. */
export function DesktopNav({
  links,
}: {
  links: { label: string; href: string }[];
}) {
  const pathname = usePathname();

  return (
    <ul className="hidden items-center gap-1 md:flex">
      {links.map((link) => {
        const active = isActivePath(pathname, link.href);
        return (
          <li key={link.label}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={desktopLinkCls(active)}
            >
              {link.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-full bg-primary nav-indicator"
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
