"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/landing/icons";

/**
 * Read-only preview of the workflow definition (the application-level model).
 * Always derived from the live draft — never from a static example. Credential
 * secrets are redacted by the serializer before they reach this panel.
 */
export function DefinitionPanel({ json }: { json: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      timerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked; the text is still selectable.
    }
  }, [json]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line/70 px-3.5 py-3">
        <div>
          <p className="text-[13px] font-medium text-fg">Definition</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
            JSON · app model
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line px-2.5 text-[12px] text-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          {copied ? (
            <CheckIcon width={12} height={12} aria-hidden />
          ) : (
            <CopyIcon width={12} height={12} aria-hidden />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="scroll-slim min-h-0 flex-1 overflow-auto p-3">
        <pre className="whitespace-pre font-mono text-[11px] leading-relaxed text-muted">
          {json}
        </pre>
      </div>

      <p className="border-t border-line/70 px-3.5 py-2 text-[10.5px] leading-relaxed text-faint">
        Derived from the local draft. Secrets are redacted. This is the shape a
        future Runbolt API would accept.
      </p>
    </div>
  );
}
