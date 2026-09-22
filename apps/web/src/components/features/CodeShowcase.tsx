"use client";

import { useState } from "react";
import { Reveal } from "../landing/Reveal";
import { CheckIcon, CopyIcon } from "../landing/icons";
import { roleClass, type Token, type TokenRole } from "../landing/CodeBlock";

type Line = Token[];

const code: Line[] = [
  [
    ["import", "kw"],
    [" { Runbolt } "],
    ["from", "kw"],
    [" "],
    ['"@runbolt/sdk"', "str"],
  ],
  [],
  [
    ["const", "kw"],
    [" runbolt = "],
    ["new", "kw"],
    [" "],
    ["Runbolt", "fn"],
    ["({ apiKey: process.env."],
    ["RUNBOLT_KEY", "key"],
    [" });"],
  ],
  [],
  [
    ["const", "kw"],
    [" workflow = "],
    ["await", "kw"],
    [" runbolt.workflows."],
    ["execute", "fn"],
    ["({"],
  ],
  [
    ["  workflowId", "key"],
    [": "],
    ['"customer-sync"', "str"],
    [","],
  ],
  [
    ["  input", "key"],
    [": {"],
  ],
  [
    ["    customerId", "key"],
    [": "],
    ['"cus_123"', "str"],
    [","],
  ],
  [
    ["  },"],
  ],
  [["});"]],
];

const terminal: [string, string, string][] = [
  ["$ ", "text-muted", "runbolt run customer-sync --input '{\"customerId\":\"cus_123\"}'"],
  ["→ ", "text-highlight", "run_7c31aa92 created"],
  ["● ", "text-ok", "validate ......... ok (8ms)"],
  ["● ", "text-ok", "http.sync ........ ok (204ms)"],
  ["● ", "text-primary", "db.upsert ........ running"],
];

function CodeEditor() {
  const [copied, setCopied] = useState(false);

  const plainText = code
    .map((line) =>
      line
        .map((token) => (Array.isArray(token) ? token[0] : token))
        .join(""),
    )
    .join("\n");

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable (e.g. insecure context) — quietly ignore
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-code shadow-[0_24px_80px_-24px_rgba(5,7,12,0.9)]">
      <div className="flex items-center gap-3 border-b border-line/70 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-line" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-line" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-line" aria-hidden />
        <span className="ml-2 font-mono text-xs text-muted">customer-sync.ts</span>
        <button
          type="button"
          onClick={onCopy}
          className="ml-auto flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-muted transition-colors duration-200 hover:text-fg"
          aria-label={copied ? "Copied" : "Copy code"}
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
      </div>
      <div className="flex">
        <ol
          aria-hidden
          className="select-none border-r border-line/50 py-4 pl-4 pr-2.5 text-right font-mono text-[13px] leading-relaxed text-muted/40"
        >
          {code.map((_, i) => (
            <li key={i}>{i + 1}</li>
          ))}
        </ol>
        <pre
          className="scroll-slim flex-1 overflow-x-auto py-4 pr-4 font-mono text-[13px] leading-relaxed"
          tabIndex={0}
          aria-label="TypeScript example"
        >
          <code>
            {code.map((tokens, i) => (
              <span key={i} className="block whitespace-pre">
                {tokens.map((token, j) => {
                  const [text, role] = Array.isArray(token) ? token : [token];
                  return (
                    <span key={j} className={roleClass[(role ?? "txt") as TokenRole]}>
                      {text}
                    </span>
                  );
                })}
                {tokens.length === 0 ? " " : null}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

function Terminal() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-overlay">
      <div className="flex items-center gap-2 border-b border-line/60 px-4 py-2.5">
        <span className="font-mono text-xs text-muted">terminal</span>
        <span className="ml-auto font-mono text-[10px] text-muted/50">zsh</span>
      </div>
      <div className="scroll-slim overflow-x-auto p-4 font-mono text-[12.5px] leading-6">
        {terminal.map(([prefix, prefixCls, msg], i) => (
          <p key={i} className="whitespace-pre">
            <span className={prefixCls}>{prefix}</span>
            <span className="text-[#C9D2E3]">{msg}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function CodeShowcase() {
  return (
    <section id="developers" className="py-24 sm:py-32" aria-labelledby="devex-heading">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="font-mono text-xs text-highlight">Developer experience</p>
          <h2
            id="devex-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Automation that fits your stack.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Use APIs and code where you need them, and visual workflows where
            they make complexity easier to understand. Both stay in sync —
            every workflow is inspectable and triggerable from either side.
          </p>
        </Reveal>
        <Reveal delay={120} className="space-y-4">
          <CodeEditor />
          <Terminal />
        </Reveal>
      </div>
    </section>
  );
}
