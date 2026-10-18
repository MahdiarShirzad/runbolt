"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/landing/icons";
import type { GraphIssue } from "@/lib/dashboard/workflow-graph";

/**
 * Compact graph-validation summary. Issues are grouped by severity; clicking a
 * node-scoped issue focuses that node on the canvas so it can be fixed.
 */
export function ValidationBanner({
  issues,
  onFocusNode,
}: {
  issues: GraphIssue[];
  onFocusNode: (nodeId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-2 border-b border-line/70 bg-ok/[0.05] px-3.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden />
        <p className="text-[11.5px] text-muted">
          Graph structure looks valid — a future engine would still verify runtime details.
        </p>
      </div>
    );
  }

  const heading = errors.length > 0
    ? `${errors.length} blocking ${errors.length === 1 ? "issue" : "issues"}`
    : `${warnings.length} ${warnings.length === 1 ? "warning" : "warnings"}`;

  return (
    <div className="border-b border-line/70">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 bg-warn/[0.06] px-3.5 py-1.5 text-left transition-colors hover:bg-warn/[0.1]"
      >
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${errors.length > 0 ? "bg-bad" : "bg-warn"}`}
          aria-hidden
        />
        <span className="text-[11.5px] text-fg">{heading}</span>
        {errors.length > 0 && warnings.length > 0 && (
          <span className="font-mono text-[10.5px] text-faint">
            + {warnings.length} warning{warnings.length === 1 ? "" : "s"}
          </span>
        )}
        <ChevronDownIcon
          width={12}
          height={12}
          aria-hidden
          className={`ml-auto text-faint transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="max-h-40 overflow-y-auto border-t border-line/60 bg-ink/40 py-1">
          {issues.map((issue, index) => {
            const clickable = Boolean(issue.nodeId);
            const content = (
              <>
                <span
                  className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                    issue.severity === "error" ? "bg-bad" : "bg-warn"
                  }`}
                  aria-hidden
                />
                <span className="text-[11.5px] leading-relaxed text-muted">{issue.message}</span>
              </>
            );
            return (
              <li key={`${issue.code}-${issue.nodeId ?? index}`}>
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => onFocusNode(issue.nodeId!)}
                    className="flex w-full items-start gap-2 px-3.5 py-1.5 text-left transition-colors hover:bg-hover/50"
                  >
                    {content}
                  </button>
                ) : (
                  <div className="flex items-start gap-2 px-3.5 py-1.5">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
