"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";

const COLLAPSE_THRESHOLD_LINES = 18;

function JsonLine({ line }: { line: string }) {
  const match = /^(\s*)"([^"]+)":\s?(.*)$/.exec(line);
  if (!match) {
    return <div className="text-muted">{line || " "}</div>;
  }
  const [, indent, key, rest] = match;
  const valueCls = rest === "null" ? "text-faint" : "text-ok/90";
  return (
    <div>
      <span>{indent}</span>
      <span className="text-primary-strong">&quot;{key}&quot;</span>
      <span className="text-faint">: </span>
      <span className={valueCls}>{rest}</span>
    </div>
  );
}

/** Pretty-printed, copyable JSON viewer for step payloads and metadata. */
export function JsonBlock({
  value,
  label,
  emptyHint = "No data captured.",
}: {
  value: unknown;
  label?: string;
  emptyHint?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const json = JSON.stringify(value, null, 2);
  const lines = json.split("\n");
  const collapsible = lines.length > COLLAPSE_THRESHOLD_LINES;
  const visible = collapsible && !expanded ? lines.slice(0, COLLAPSE_THRESHOLD_LINES) : lines;

  return (
    <div className="overflow-hidden rounded-md border border-line bg-ink">
      <div className="flex items-center gap-2 border-b border-line/70 px-3 py-2">
        <p className="min-w-0 truncate font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
          {label ?? "Data"}
        </p>
        <CopyButton text={json} label="Copy JSON" />
      </div>
      {json === "null" || json === '""' ? (
        <p className="px-3 py-3 text-[12.5px] text-muted">{emptyHint}</p>
      ) : (
        <>
          <pre
            className="scroll-slim overflow-x-auto px-3 py-2.5 font-mono text-[11.5px] leading-[1.6]"
            tabIndex={0}
            aria-label={label ?? "JSON data"}
          >
            {visible.map((line, i) => (
              <JsonLine key={i} line={line} />
            ))}
          </pre>
          {collapsible && (
            <div className="border-t border-line/60 px-3 py-1.5">
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="text-[11.5px] text-muted transition-colors hover:text-fg"
              >
                {expanded ? "Collapse" : `Show all ${lines.length} lines`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
