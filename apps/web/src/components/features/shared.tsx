import type { ReactNode } from "react";
import { CheckIcon } from "../landing/icons";

/* Runbolt node color system */
export const kindColor = {
  trigger: "text-primary",
  action: "text-muted",
  condition: "text-accent",
  transform: "text-highlight",
  http: "text-info",
  webhook: "text-warn",
  db: "text-ok",
  worker: "text-primary",
  queue: "text-muted",
  delay: "text-accent",
} as const;

export type NodeKind = keyof typeof kindColor;
export type NodeStatus = "success" | "running" | "queued" | "retrying" | "skipped";

export const statusStyle: Record<NodeStatus, { label: string; cls: string }> = {
  success: { label: "ok", cls: "bg-ok/12 text-ok" },
  running: { label: "running", cls: "bg-primary/15 text-primary" },
  queued: { label: "queued", cls: "bg-raised text-muted" },
  retrying: { label: "retrying", cls: "bg-warn/12 text-warn" },
  skipped: { label: "skipped", cls: "bg-raised text-muted" },
};

export function StatusPill({ status }: { status: NodeStatus }) {
  const s = statusStyle[status];
  return (
    <span
      className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[9px] ${s.cls}`}
    >
      {status === "running" && (
        <span className="blink h-1 w-1 rounded-full bg-current" aria-hidden />
      )}
      {status === "success" && <CheckIcon width={8} height={8} />}
      {s.label}
    </span>
  );
}

/** Status icon used in step lists (trigger → completion). */
export function StepIcon({ status }: { status: NodeStatus }) {
  if (status === "success") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ok/15 text-ok">
        <CheckIcon width={10} height={10} />
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
        <span
          className="spin h-2.5 w-2.5 rounded-full border-[1.5px] border-primary border-t-transparent"
          role="status"
          aria-label="running"
        />
      </span>
    );
  }
  if (status === "retrying") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warn/15 text-warn font-mono text-[10px]">
        ↻
      </span>
    );
  }
  return (
    <span
      className="flex h-5 w-5 items-center justify-center rounded-full border border-line"
      aria-label="queued"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-muted/50" />
    </span>
  );
}

/** Small node-type icon chip used across previews. */
export function KindChip({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return <span className={color}>{children}</span>;
}
