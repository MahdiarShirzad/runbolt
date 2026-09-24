"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BoltIcon, CloseIcon, MenuIcon } from "./icons";

const links = [
  { label: "Features", href: "/features" },
  { label: "Documentation", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Security", href: "/security" },
  { label: "About", href: "/about" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const desktopLinkCls = (active: boolean) =>
  `rounded-md px-3 py-2 text-[13.5px] transition-colors duration-200 ${
    active
      ? "bg-surface font-medium text-fg shadow-[inset_0_0_0_1px_rgba(38,48,74,0.9)]"
      : "text-muted hover:bg-hover hover:text-fg"
  }`;

const mobileLinkCls = (active: boolean) =>
  `block rounded-md px-3 py-2.5 text-sm transition-colors ${
    active
      ? "bg-surface font-medium text-fg"
      : "text-muted hover:bg-hover hover:text-fg"
  }`;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-line/80 bg-ink/85 backdrop-blur-md"
          : "border-transparent bg-ink/50 backdrop-blur-sm"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <Link href="/" className="flex items-center gap-2.5 rounded-md">
          <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-primary text-button-text">
            <BoltIcon width={13} height={13} />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Runbolt
          </span>
        </Link>

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
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-[13.5px] text-muted transition-colors duration-200 hover:text-fg"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-primary px-3.5 py-2 text-[13.5px] font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px"
          >
            Start Building
          </Link>
        </div>

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
      </nav>

      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-line/70 bg-ink/95 backdrop-blur-md md:hidden"
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
    </header>
  );
}
