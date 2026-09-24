"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "../landing/icons";

/**
 * The only interactive part of a code block — clipboard write. The block
 * itself (syntax highlighting included) renders on the server.
 */
export function CopyButton({
  text,
  label = "Copy code",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable (e.g. insecure context) — quietly ignore
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Copied" : label}
      className={`ml-auto flex shrink-0 items-center gap-1.5 rounded-md border border-transparent px-1.5 py-1 text-[11px] text-muted transition-all duration-200 hover:border-line hover:text-fg ${className}`}
    >
      {copied ? (
        <>
          <CheckIcon width={11} height={11} className="text-ok" />
          <span className="text-ok">Copied</span>
        </>
      ) : (
        <>
          <CopyIcon width={11} height={11} />
          Copy
        </>
      )}
    </button>
  );
}
