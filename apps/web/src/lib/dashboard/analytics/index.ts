import type { TimeRange } from "../types";
import { getAnalyticsEvents } from "./dataset";
import { deriveDashboard } from "./derive";
import type { DashboardAnalytics } from "./types";

/**
 * Server-side entry point for the dashboard analytics: resolves the
 * deterministic sample stream once and derives every widget from it, so all
 * sections reconcile with a single underlying dataset.
 */
export function getDashboardAnalytics(
  range: TimeRange,
  now: number = Date.now(),
): DashboardAnalytics {
  return deriveDashboard(getAnalyticsEvents(now), range, now);
}

export * from "./types";
