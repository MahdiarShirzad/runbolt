"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const mobileLinkCls = (active: boolean) =>
  `block rounded-md px-3 py-2.5 text-sm transition-colors ${
    active
      ? "bg-surface font-medium text-fg"
      : "text-muted hover:bg-hover hover:text-fg"
  }`;

/** Client island for the mobile navigation — hamburger button and dropdown. */
export function MobileMenu({
  links,
}: {
  links: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted transition-colors hover:text-fg md:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open ? (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full border-t border-line/70 bg-ink/95 backdrop-blur-md md:hidden"
        >
          <ul className="space-y-1 px-5 py-4">
            {links.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={mobileLinkCls(active)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="flex gap-3 pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md border border-line px-3 py-2.5 text-center text-sm text-fg transition-colors hover:bg-hover"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md bg-primary px-3 py-2.5 text-center text-sm font-medium text-button-text transition-colors hover:bg-primary-strong"
              >
                Start Building
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </>
  );
}
