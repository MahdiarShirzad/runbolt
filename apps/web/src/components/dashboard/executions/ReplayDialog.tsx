"use client";

import { useEffect, useRef } from "react";
import { CloseIcon, RetryIcon } from "@/components/landing/icons";
import { primaryActionCls, secondaryActionCls } from "../actions";

/**
 * Replay confirmation. Replay is a frontend simulation only — it never calls
 * the (nonexistent) execution API and never creates a real run.
 */
export function ReplayDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="replay-dialog-title"
    >
      <div
        className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-lg border border-line bg-surface p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-volt">
              Demo mode
            </p>
            <h2
              id="replay-dialog-title"
              className="mt-1.5 font-display text-lg font-semibold text-fg"
            >
              Simulate a replay
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close replay dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-fg"
          >
            <CloseIcon width={15} height={15} />
          </button>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          Replay runs the workflow&apos;s graph through the local deterministic
          simulator and shows the resulting node statuses on the canvas. It does
          not call a backend, re-execute anything, or create a real run record.
        </p>

        <div className="mt-3 rounded-md border border-volt/30 bg-volt/[0.07] px-3.5 py-3">
          <p className="text-[12px] leading-relaxed text-volt/90">
            The result is clearly labelled <span className="font-medium">simulated</span> and
            disappears when you clear it. No workflow side effects occur.
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-2.5">
          <button type="button" onClick={onClose} className={secondaryActionCls}>
            Cancel
          </button>
          <button ref={confirmRef} type="button" onClick={onConfirm} className={primaryActionCls}>
            <RetryIcon width={13} height={13} aria-hidden />
            Run simulated replay
          </button>
        </div>
      </div>
    </div>
  );
}
