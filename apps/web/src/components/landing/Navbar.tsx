"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BoltIcon, CloseIcon, MenuIcon } from "./icons";

const links = [
  { label: "Product", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Developers", href: "/#developers" },
  { label: "Documentation", href: "/#developers" },
  { label: "Pricing", href: "/pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
          ? "border-line/80 bg-ink/80 backdrop-blur-md"
          : "border-transparent bg-ink/40 backdrop-blur-sm"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <a href="/" className="flex items-center gap-2.5 rounded-md">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-highlight text-white shadow-[0_0_18px_rgba(59,130,246,0.35)]">
            <BoltIcon width={14} height={14} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Runbolt</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-2 text-[13.5px] text-muted transition-colors duration-200 hover:bg-hover hover:text-fg"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#"
            className="rounded-md px-3 py-2 text-[13.5px] text-muted transition-colors duration-200 hover:text-fg"
          >
            Log in
          </a>
          <a
            href="#cta"
            className="rounded-md bg-primary px-3.5 py-2 text-[13.5px] font-medium text-white shadow-[0_1px_10px_rgba(59,130,246,0.35)] transition-all duration-200 hover:bg-[#2f76ef] hover:shadow-[0_1px_16px_rgba(59,130,246,0.5)] active:bg-active"
          >
            Start Building
          </a>
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
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm text-muted transition-colors hover:bg-hover hover:text-fg"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="flex gap-3 pt-3">
              <a
                href="#"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md border border-line px-3 py-2.5 text-center text-sm text-fg transition-colors hover:bg-hover"
              >
                Log in
              </a>
              <a
                href="#cta"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md bg-primary px-3 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#2f76ef]"
              >
                Start Building
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
