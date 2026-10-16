const numberFormatter = new Intl.NumberFormat("en-US");

/** Single accessor for wall-clock time — keeps render code lint-clean. */
export function currentTimestamp(): number {
  return Date.now();
}
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const hourFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  hour12: false,
});
const dayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "medium",
});
const clockFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatCount(value: number): string {
  return numberFormatter.format(value);
}

export function formatCompactCount(value: number): string {
  return compactFormatter.format(value);
}

export function formatPercent(ratio: number, digits = 1): string {
  return `${(ratio * 100).toFixed(digits)}%`;
}

export function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function formatRelativeTime(iso: string, nowMs = Date.now()): string {
  const diffMs = nowMs - new Date(iso).getTime();
  if (diffMs < 60_000) return "just now";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return dayFormatter.format(new Date(iso));
}

export function formatAbsoluteTime(iso: string): string {
  return fullDateFormatter.format(new Date(iso));
}

/** Wall-clock time only (HH:MM:SS) — used by log streams. */
export function formatClockTime(iso: string): string {
  return clockFormatter.format(new Date(iso));
}

export function formatBucketLabel(date: Date, bucket: "hour" | "day"): string {
  return bucket === "hour" ? hourFormatter.format(date) : dayFormatter.format(date);
}

export function formatBucketLabelLong(date: Date, bucket: "hour" | "day"): string {
  if (bucket === "hour") {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      hour: "2-digit",
      hour12: false,
    }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function greetingForHour(hour: number): string {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}
