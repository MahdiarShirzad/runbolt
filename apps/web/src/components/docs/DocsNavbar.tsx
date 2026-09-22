"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BoltIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
} from "../landing/icons";

export const DOCS_SEARCH_EVENT = "runbolt:open-search";
export const DOCS_NAV_EVENT = "runbolt:toggle-docs-nav";
export const DOCS_NAV_CLOSED_EVENT = "runbolt:docs-nav-closed";

const navLinks = [
  { label: "Product", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Developers", href: "/docs/api" },
  { label: "Documentation", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
];

export function openSearch() {
  window.dispatchEvent(new CustomEvent(DOCS_SEARCH_EVENT));
}

export function DocsNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [docsNavOpen, setDocsNavOpen] = useState(false);

  // Mirror the shell's mobile drawer state to swap the button icon.
  useEffect(() => {
    const onToggle = () => setDocsNavOpen((v) => !v);
    const onClose = () => setDocsNavOpen(false);
    window.addEventListener(DOCS_NAV_EVENT, onToggle);
    window.addEventListener(DOCS_NAV_CLOSED_EVENT, onClose);
    return () => {
      window.removeEventListener(DOCS_NAV_EVENT, onToggle);
      window.removeEventListener(DOCS_NAV_CLOSED_EVENT, onClose);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-ink/80 backdrop-blur-md">
      <nav
        aria-label="Documentation"
        className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4 sm:px-6"
      >
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-fg lg:hidden"
          aria-label={docsNavOpen ? "Close documentation navigation" : "Open documentation navigation"}
          aria-expanded={docsNavOpen}
          onClick={() => window.dispatchEvent(new CustomEvent(DOCS_NAV_EVENT))}
        >
          {docsNavOpen ? <CloseIcon width={17} height={17} /> : <MenuIcon width={17} height={17} />}
        </button>

        <Link href="/docs" className="flex shrink-0 items-center gap-2.5 rounded-md">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-highlight text-white shadow-[0_0_18px_rgba(59,130,246,0.35)]">
            <BoltIcon width={14} height={14} />
          </span>
          <span className="text-[14.5px] font-semibold tracking-tight">Runbolt</span>
          <span className="rounded border border-line bg-raised px-1.5 py-0.5 font-mono text-[10px] text-muted">
            Docs
          </span>
        </Link>

        <ul className="ml-4 hidden items-center gap-0.5 xl:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="rounded-md px-2.5 py-1.5 text-[13px] text-muted transition-colors duration-200 hover:bg-hover hover:text-fg"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Search trigger */}
        <button
          type="button"
          onClick={openSearch}
          className="ml-auto flex h-8 min-w-0 items-center gap-2 rounded-md border border-line bg-input px-2.5 text-muted transition-colors duration-200 hover:border-[#3a466b] hover:text-fg sm:w-52 lg:w-60"
          aria-label="Search documentation"
        >
          <SearchIcon width={13} height={13} className="shrink-0" />
          <span className="hidden text-[12.5px] sm:inline">Search documentation…</span>
          <kbd className="ml-auto hidden rounded border border-line bg-raised px-1.5 font-mono text-[10px] text-muted sm:inline">
            ⌘K
          </kbd>
        </button>

        <a
          href="#"
          className="hidden h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-fg sm:flex"
          aria-label="Runbolt on GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.72c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.34 1.12 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9l-.01 2.81c0 .27.18.6.69.49A10.25 10.25 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
          </svg>
        </a>

        <Link
          href="/"
          className="hidden rounded-md px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:text-fg md:block"
        >
          Log in
        </Link>
        <Link
          href="/"
          className="hidden rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-white shadow-[0_1px_10px_rgba(59,130,246,0.35)] transition-all duration-200 hover:bg-[#2f76ef] md:block"
        >
          Start Building
        </Link>

        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-fg xl:hidden"
          aria-expanded={menuOpen}
          aria-controls="docs-mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <CloseIcon width={17} height={17} /> : <MenuIcon width={17} height={17} />}
        </button>
      </nav>

      {menuOpen && (
        <div id="docs-mobile-menu" className="border-t border-line/70 bg-ink/95 xl:hidden">
          <ul className="space-y-0.5 px-4 py-3">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-hover hover:text-fg"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="flex gap-3 pt-2">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-md border border-line px-3 py-2 text-center text-sm text-fg transition-colors hover:bg-hover"
              >
                Log in
              </Link>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-white"
              >
                Start Building
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
