"use client";

import { CheckIcon } from "@/components/landing/icons";
import { CopyButton } from "@/components/ui/copy-button";
import { JsonBlock } from "../JsonBlock";
import type { NodeExecution } from "@/lib/dashboard/execution-debug";

/**
 * Focused error inspector for a failed node. Suggestions are deterministic,
 * keyed off the recorded error category — never presented as AI-generated.
 */
export function ErrorPanel({ failedNode }: { failedNode: NodeExecution | null }) {
  if (!failedNode || !failedNode.error) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-ok/25 bg-ok/[0.06] px-4 py-3.5">
        <CheckIcon width={16} height={16} className="mt-0.5 text-ok" aria-hidden />
        <div>
          <p className="text-[13.5px] font-medium text-fg">No errors recorded</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            Every node that ran this execution completed successfully. Nothing to
            diagnose for this run.
          </p>
        </div>
      </div>
    );
  }

  const { error, input } = failedNode;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-bad/30 bg-bad/[0.06] px-4 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-bad">
            {error.categoryLabel}
          </p>
          <CopyButton text={error.message} label="Copy error message" />
        </div>
        <p className="mt-1.5 font-mono text-[13px] text-fg">{failedNode.name}</p>
        <p className="mt-1 break-words text-[13px] leading-relaxed text-bad/90">
          {error.message}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="overflow-hidden rounded-md border border-line bg-ink">
          <div className="flex items-center gap-2 border-b border-line/70 px-3 py-2">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
              Stack trace
            </p>
            <CopyButton text={error.stack.join("\n")} label="Copy stack trace" />
          </div>
          <pre className="scroll-slim overflow-x-auto px-3 py-2.5 font-mono text-[11.5px] leading-[1.7] text-muted">
            {error.stack.join("\n")}
          </pre>
        </div>

        <div>
          <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
            Input at failure
          </p>
          <JsonBlock
            value={input}
            label="input-at-failure.json"
            emptyHint="No input was recorded for this node."
          />
        </div>
      </div>

      <div className="rounded-md border border-line bg-surface/60 px-4 py-3.5">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
          Suggested troubleshooting
        </p>
        <ol className="mt-2.5 space-y-2">
          {error.suggestions.map((suggestion, index) => (
            <li key={suggestion} className="flex gap-2.5 text-[12.5px] leading-relaxed text-muted">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-line font-mono text-[10px] text-faint">
                {index + 1}
              </span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 border-t border-line/60 pt-2.5 text-[11px] leading-relaxed text-faint">
          These are preset checks for the “{error.categoryLabel.toLowerCase()}”
          category — not the result of a live diagnostic engine.
        </p>
      </div>
    </div>
  );
}
