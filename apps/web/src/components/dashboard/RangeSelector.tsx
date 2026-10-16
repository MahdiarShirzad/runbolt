"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TimeRange } from "@/lib/dashboard/types";

const options: { value: TimeRange; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

/** Segmented control driving the `?range=` search param. */
export function RangeSelector({ current }: { current: TimeRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(range: TimeRange) {
    if (range === current) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div
      role="group"
      aria-label="Activity time range"
      className="flex rounded-md border border-line bg-ink p-0.5"
    >
      {options.map((option) => {
        const active = option.value === current;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => select(option.value)}
            className={`h-7 rounded-[4px] px-2.5 font-mono text-[11px] transition-colors duration-150 ${
              active
                ? "bg-hover font-medium text-fg"
                : "text-muted hover:text-fg"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
