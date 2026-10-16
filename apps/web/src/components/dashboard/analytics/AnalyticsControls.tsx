"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { RetryIcon } from "@/components/landing/icons";
import { secondaryActionCls } from "../actions";
import type { TimeRange } from "@/lib/dashboard/types";

const RANGE_OPTIONS: { value: TimeRange; label: string; aril: string }[] = [
  { value: "24h", label: "24H", aril: "Last 24 hours" },
  { value: "7d", label: "7D", aril: "Last 7 days" },
  { value: "30d", label: "30D", aril: "Last 30 days" },
];

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Header controls: shared time range, refresh via router, and CSV export. */
export function AnalyticsControls({
  current,
  exportCsv,
  exportFilename,
}: {
  current: TimeRange;
  exportCsv: string;
  exportFilename: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function select(range: TimeRange) {
    if (range === current) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label="Analytics time range"
        className="flex rounded-md border border-line bg-ink p-0.5"
      >
        {RANGE_OPTIONS.map((option) => {
          const active = option.value === current;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              aria-label={option.aril}
              onClick={() => select(option.value)}
              className={`h-8 rounded-[4px] px-2.5 font-mono text-[11px] transition-colors duration-150 ${
                active ? "bg-hover font-medium text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => startTransition(() => router.refresh())}
        disabled={pending}
        className={`${secondaryActionCls} disabled:opacity-60`}
        aria-label="Refresh analytics"
      >
        <RetryIcon
          width={13}
          height={13}
          aria-hidden
          className={pending ? "animate-spin" : undefined}
        />
        {pending ? "Refreshing" : "Refresh"}
      </button>

      <button
        type="button"
        onClick={() => downloadCsv(exportFilename, exportCsv)}
        className={secondaryActionCls}
        aria-label="Export analytics as CSV"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
        Export
      </button>
    </div>
  );
}
