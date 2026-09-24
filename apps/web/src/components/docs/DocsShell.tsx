"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { docSections } from "@/content/docs/registry";
import {
  ChevronDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  MenuIcon,
} from "../landing/icons";
import {
  DOCS_NAV_CLOSED_EVENT,
  DOCS_NAV_EVENT,
} from "./events";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Documentation sections" className="space-y-6 pb-10">
      {docSections.map((section) => (
        <SidebarSection
          key={section.category}
          category={section.category}
          items={section.items.map((item) => ({
            ...item,
            href: item.slug === "" ? "/docs" : `/docs/${item.slug}`,
          }))}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

function SidebarSection({
  category,
  items,
  pathname,
  onNavigate,
}: {
  category: string;
  items: { title: string; href: string }[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded px-2 py-1 font-mono text-[10.5px] uppercase tracking-widest text-muted/70 transition-colors hover:text-muted"
      >
        {category}
        <ChevronDownIcon
          width={12}
          height={12}
          className={`transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        />
      </button>
      <ul
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <li className="overflow-hidden" aria-hidden={false}>
          <ul className="mt-1 space-y-0.5 border-l border-line/70 pl-3">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`-ml-3 block rounded-md border-l-2 py-1.5 pl-[13px] text-[13.5px] transition-colors duration-150 ${
                      active
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "border-transparent text-muted hover:border-line hover:bg-hover/60 hover:text-fg"
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
      </ul>
    </div>
  );
}

export interface TocItem {
  id: string;
  text: string;
}

function TableOfContents({ items }: { items: TocItem[] }) {
  return (
    <nav aria-label="On this page" className="space-y-1">
      <p className="pb-2 font-mono text-[10.5px] uppercase tracking-widest text-muted/70">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-line/70">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-[12.5px] text-muted transition-colors hover:border-line hover:text-fg"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function DocsShell({
  toc,
  prev,
  next,
  children,
}: {
  toc: TocItem[];
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onToggle = () => setDrawerOpen((v) => !v);
    window.addEventListener(DOCS_NAV_EVENT, onToggle);
    return () => window.removeEventListener(DOCS_NAV_EVENT, onToggle);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      const onClose = () => setDrawerOpen(false);
      window.addEventListener(DOCS_NAV_CLOSED_EVENT, onClose);
      window.addEventListener("popstate", onClose);
      return () => {
        window.removeEventListener(DOCS_NAV_CLOSED_EVENT, onClose);
        window.removeEventListener("popstate", onClose);
      };
    }
  }, [drawerOpen]);

  const closeDrawer = () => window.dispatchEvent(new CustomEvent(DOCS_NAV_CLOSED_EVENT));

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[230px_minmax(0,1fr)_210px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] overflow-y-auto py-8 pr-2 scroll-slim lg:block">
          <SidebarNav />
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Documentation navigation">
            <div className="absolute inset-0 bg-overlay/70 backdrop-blur-sm" onClick={closeDrawer} />
            <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-line bg-surface p-5 scroll-slim">
              <p className="pb-4 font-mono text-[10.5px] uppercase tracking-widest text-muted/70">
                Documentation
              </p>
              <SidebarNav onNavigate={closeDrawer} />
            </div>
          </div>
        )}

        {/* Article */}
        <main className="min-w-0 py-8 sm:py-10">
          {/* Mobile docs menu — replaces the old DocsNavbar drawer trigger */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent(DOCS_NAV_EVENT))}
            className="mb-5 inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-[13px] text-muted transition-colors duration-200 hover:border-line-strong hover:text-fg lg:hidden"
            aria-label="Open documentation navigation"
          >
            <MenuIcon width={15} height={15} />
            Docs menu
          </button>

          {/* Mobile TOC (collapsible) */}
          {toc.length > 0 && (
            <details className="group mb-6 rounded-lg border border-line bg-surface/60 xl:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-[13px] font-medium text-fg [&::-webkit-details-marker]:hidden">
                On this page
                <ChevronDownIcon
                  width={14}
                  height={14}
                  className="text-muted transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <ul className="border-t border-line/70 px-4 py-2">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={closeDrawer}
                      className="block py-1.5 text-[13px] text-muted transition-colors hover:text-fg"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}
          {children}
        </main>

        {/* Right TOC */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] overflow-y-auto py-10 scroll-slim xl:block">
          {toc.length > 0 && <TableOfContents items={toc} />}
        </aside>
      </div>

      {/* Prev / next */}
      {(prev || next) && (
        <nav
          aria-label="Article navigation"
          className="grid gap-3 border-t border-line/60 py-10 sm:grid-cols-2"
        >
          {prev ? (
            <Link
              href={prev.href}
              className="group rounded-lg border border-line bg-surface/50 p-4 transition-colors hover:border-line-strong hover:bg-surface"
            >
              <p className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-widest text-muted/70">
                <ArrowLeftIcon width={12} height={12} />
                Previous
              </p>
              <p className="mt-1.5 text-sm font-medium text-fg transition-colors group-hover:text-primary">
                {prev.title}
              </p>
            </Link>
          ) : (
            <span aria-hidden />
          )}
          {next && (
            <Link
              href={next.href}
              className="group rounded-lg border border-line bg-surface/50 p-4 text-right transition-colors hover:border-line-strong hover:bg-surface"
            >
              <p className="flex items-center justify-end gap-1.5 font-mono text-[10.5px] uppercase tracking-widest text-muted/70">
                Next
                <ArrowRightIcon width={12} height={12} />
              </p>
              <p className="mt-1.5 text-sm font-medium text-fg transition-colors group-hover:text-primary">
                {next.title}
              </p>
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
