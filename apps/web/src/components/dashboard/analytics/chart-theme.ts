import type { ExecutionStatus, TriggerType } from "@/lib/dashboard/types";

/**
 * Visual tokens for the analytics charts. Values mirror the Runbolt design
 * system (`globals.css`) as concrete hex strings because Recharts writes SVG
 * presentation attributes, which do not reliably resolve CSS custom props.
 */
export const viz = {
  success: "#3ecf8e",
  failed: "#f2614e",
  running: "#c7f04e",
  queued: "#47536e",
  cancelled: "#a08bf0",
  outOfRange: "#f5b23c",
  volt: "#c7f04e",
  accent: "#a08bf0",
  highlight: "#5cc9ee",
  info: "#5cc9ee",
  warn: "#f5b23c",
  muted: "#8c97ab",
  faint: "#5c6779",
  line: "#232c3b",
  lineStrong: "#35435c",
  surface: "#10151d",
  raised: "#161d28",
  tooltip: "#1c2532",
  fg: "#e9edf4",
} as const;

export const STATUS_COLORS: Record<ExecutionStatus, string> = {
  success: viz.success,
  failed: viz.failed,
  running: viz.running,
  queued: viz.queued,
  cancelled: viz.cancelled,
};

export const TRIGGER_COLORS: Record<TriggerType, string> = {
  webhook: viz.highlight,
  schedule: viz.accent,
  api: viz.volt,
  manual: viz.muted,
};

export const axisTick = {
  fill: viz.faint,
  fontSize: 10,
} as const;

export const tickLine = { stroke: viz.line } as const;
export const axisLine = { stroke: viz.line } as const;
export const gridStroke = "rgba(35, 44, 59, 0.55)";
export const cursorFill = "rgba(255, 255, 255, 0.04)";

/** Shared Recharts margins that keep axis labels from clipping. */
export const chartMargin = { top: 8, right: 8, bottom: 0, left: -12 } as const;
