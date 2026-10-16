"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { initials } from "@/lib/dashboard/format";
import type { SessionUser } from "@/lib/dashboard/types";
import { BookIcon } from "@/components/landing/icons";
import { LogOutIcon, SettingsIcon } from "../icons";
import { usePopoverDismiss } from "./use-popover-dismiss";

export function UserMenu({ user }: { user: SessionUser | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const ref = usePopoverDismiss<HTMLDivElement>(close);

  const name = user?.name ?? "Guest";
  const email = user?.email ?? "Not signed in";

  function signOut() {
    setOpen(false);
    // TODO(auth): clear the real session server-side before redirecting.
    router.push("/login");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-md border border-line pl-1 pr-2 text-muted transition-colors hover:border-line-strong hover:text-fg"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          aria-hidden
          className="flex h-7 w-7 items-center justify-center rounded bg-raised text-[11px] font-semibold tracking-wide text-fg"
        >
          {initials(name)}
        </span>
        <span className="hidden text-[13px] font-medium sm:block">{name}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-line bg-surface shadow-2xl shadow-overlay/40">
          <div className="border-b border-line/70 px-4 py-3">
            <p className="truncate text-[13px] font-medium text-fg">{name}</p>
            <p className="mt-0.5 truncate text-[12px] text-muted">{email}</p>
            {user?.role && (
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-faint">
                {user.role}
              </p>
            )}
          </div>
          <ul className="p-1.5">
            <li>
              <Link
                href="/settings/profile"
                onClick={close}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-muted transition-colors hover:bg-hover hover:text-fg"
              >
                <SettingsIcon width={14} height={14} className="text-faint" />
                Settings
              </Link>
            </li>
            <li>
              <Link
                href="/docs"
                onClick={close}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-muted transition-colors hover:bg-hover hover:text-fg"
              >
                <BookIcon width={14} height={14} className="text-faint" />
                Documentation
              </Link>
            </li>
          </ul>
          <div className="border-t border-line/70 p-1.5">
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-muted transition-colors hover:bg-hover hover:text-fg"
            >
              <LogOutIcon width={14} height={14} className="text-faint" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
