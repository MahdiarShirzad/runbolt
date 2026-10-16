"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/landing/icons";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooter } from "./SidebarFooter";

/** Client island: hamburger trigger (in the header) + off-canvas drawer. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPopState = () => setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onPopState);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line text-muted transition-colors hover:text-fg lg:hidden"
        aria-expanded={open}
        aria-controls="app-mobile-nav"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div
          id="app-mobile-nav"
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Application navigation"
        >
          <div
            className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line bg-ink p-4">
            <div className="mb-5 flex items-center justify-between">
              <Link href="/dashboard" onClick={close} className="flex items-center">
                <Image src="/logo.png" alt="Runbolt" width={802} height={180} className="h-6 w-auto" />
              </Link>
              <button
                type="button"
                onClick={close}
                aria-label="Close navigation"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:text-fg"
              >
                <CloseIcon />
              </button>
            </div>
            <SidebarNav onNavigate={close} />
            <SidebarFooter />
          </div>
        </div>
      )}
    </>
  );
}
