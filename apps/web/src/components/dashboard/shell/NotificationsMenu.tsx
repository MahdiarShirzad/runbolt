"use client";

import { useCallback, useMemo, useState } from "react";
import type { AppNotification, NotificationKind } from "@/lib/dashboard/types";
import { BellIcon } from "../icons";
import { usePopoverDismiss } from "./use-popover-dismiss";

export type NotificationItem = AppNotification & { atLabel: string };

const kindDot: Record<NotificationKind, string> = {
  error: "bg-bad",
  warning: "bg-warn",
  info: "bg-highlight",
  success: "bg-ok",
};

const kindLabel: Record<NotificationKind, string> = {
  error: "Error",
  warning: "Warning",
  info: "Info",
  success: "Success",
};

export function NotificationsMenu({ items }: { items: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(items.filter((item) => item.read).map((item) => item.id)),
  );

  const close = useCallback(() => setOpen(false), []);
  const ref = usePopoverDismiss<HTMLDivElement>(close);

  const unreadCount = items.length - readIds.size;

  const ordered = useMemo(
    () => [...items].sort((a, b) => (a.at < b.at ? 1 : -1)),
    [items],
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-line-strong hover:text-fg"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon width={15} height={15} />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary"
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,340px)] overflow-hidden rounded-lg border border-line bg-surface shadow-2xl shadow-overlay/40">
          <div className="flex items-center justify-between border-b border-line/70 px-4 py-2.5">
            <p className="text-[13px] font-medium text-fg">Notifications</p>
            <button
              type="button"
              disabled={unreadCount === 0}
              onClick={() => setReadIds(new Set(items.map((item) => item.id)))}
              className="rounded px-1.5 py-1 text-[11.5px] text-muted transition-colors hover:text-fg disabled:cursor-default disabled:text-faint/60"
            >
              Mark all read
            </button>
          </div>
          {ordered.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-muted">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="max-h-[320px] overflow-y-auto scroll-slim">
              {ordered.map((item) => {
                const unread = !readIds.has(item.id);
                return (
                  <li
                    key={item.id}
                    className={`border-b border-line/50 px-4 py-3 last:border-b-0 ${
                      unread ? "bg-primary/[0.04]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${kindDot[item.kind]}`}
                        aria-hidden
                      />
                      <p className="truncate text-[12.5px] font-medium text-fg">
                        {item.title}
                      </p>
                      <span className="ml-auto shrink-0 font-mono text-[10px] text-faint">
                        {item.atLabel}
                      </span>
                    </div>
                    <p className="mt-1 pl-3.5 text-[12px] leading-relaxed text-muted">
                      {item.body}
                    </p>
                    <span className="sr-only">{kindLabel[item.kind]}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
