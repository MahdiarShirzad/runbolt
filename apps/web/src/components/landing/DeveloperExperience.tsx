"use client";

import { useState } from "react";
import { CodeBlock, type Token } from "./CodeBlock";
import { Reveal } from "./Reveal";
import { CheckIcon } from "./icons";

const tabs = ["TypeScript SDK", "CLI", "REST API"] as const;
type Tab = (typeof tabs)[number];

const sdkLines: Token[][] = [
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
    [" run = "],
    ["await", "kw"],
    [" runbolt.workflows."],
    ["trigger", "fn"],
    ["("],
  ],
  ["  "],
  [
    ['  "order-fulfillment"', "str"],
    [","],
  ],
  [
    ["  payload", "key"],
    [": { orderId: "],
    ['"ord_48213"', "str"],
    [", total: "],
    ["129.99", "num"],
    [" },"],
  ],
  [
    ["  idempotencyKey", "key"],
    [": "],
    ['"ord_48213:charge"', "str"],
  ],
  [");"],
  [],
  [
    ["run.id;     ", "com"],
    ["// run_9f2ac1e7", "com"],
  ],
  [
    ["run.status; ", "com"],
    ["// \u2192 running", "com"],
  ],
];

const cliLines: Token[][] = [
  [["$ ", "com"], ["npm install -g "], ["@runbolt/cli", "str"]],
  [],
  [["$ "], ["runbolt deploy", "fn"], [" --env production"]],
  [["\u2713 Compiled 12 workflows in 1.8s", "ok"]],
  [["\u2713 Deployed order-fulfillment (v42)", "ok"]],
  [],
  [["$ "], ["runbolt logs", "fn"], [" --follow"]],
  [
    ["12:04:31 ", "com"],
    ["webhook.received  POST /hooks/orders (18ms)"],
  ],
  [
    ["12:04:31 ", "com"],
    ["http.request     stripe/charges \u2192 200 (171ms)"],
  ],
  [
    ["12:04:31 ", "com"],
    ["worker.running   fulfillment.job #48213 \u2026"],
  ],
];

const restLines: Token[][] = [
  [["$ "], ["curl", "fn"], [" -H "], ['"Authorization: Bearer $KEY"', "str"], [" \\"]],
  [["  "], ["https://api.runbolt.dev/v1/runs/run_9f2ac1e7", "str"]],
  [],
  [["{"],],
  [['  "id"', "key"], [": "], ['"run_9f2ac1e7"', "str"], [","]],
  [['  "workflow"', "key"], [": "], ['"order-fulfillment"', "str"], [","]],
  [['  "status"', "key"], [": "], ['"running"', "str"], [","]],
  [['  "trigger"', "key"], [": { "], ['"type"', "key"], [": "], ['"webhook"', "str"], [", "], ['"source"', "key"], [": "], ['"/hooks/orders"', "str"], [" },"]],
  [['  "steps"', "key"], [": ["]],
  [["    { "], ['"name"', "key"], [": "], ['"charge-card"', "str"], [", "], ['"status"', "key"], [": "], ['"success"', "str"], [", "], ['"duration_ms"', "key"], [": "], ["171", "num"], [" },"]],
  [["    { "], ['"name"', "key"], [": "], ['"persist-order"', "str"], [", "], ['"status"', "key"], [": "], ['"success"', "str"], [", "], ['"duration_ms"', "key"], [": "], ["94", "num"], [" },"]],
  [["    { "], ['"name"', "key"], [": "], ['"fulfill"', "str"], [", "], ['"status"', "key"], [": "], ['"running"', "str"], [" }"]],
  [["  ],"]],
  [['  "started_at"', "key"], [": "], ['"2026-09-22T12:04:31.208Z"', "str"]],
  [["}"]],
];

const content: Record<Tab, Token[][]> = {
  "TypeScript SDK": sdkLines,
  CLI: cliLines,
  "REST API": restLines,
};

const titles: Record<Tab, string> = {
  "TypeScript SDK": "trigger.ts",
  CLI: "terminal",
  "REST API": "GET /v1/runs/:id · 200 OK",
};

const points = [
  "Typed SDK for TypeScript, Go, and Python",
  "Idempotent triggers with exactly-once semantics",
  "Stream logs and state changes over webhooks or SSE",
];

export function DeveloperExperience() {
  const [active, setActive] = useState<Tab>("TypeScript SDK");

  return (
    <section id="developers" className="py-24 sm:py-32" aria-labelledby="devex-heading">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="font-mono text-xs text-highlight">Developer experience</p>
          <h2
            id="devex-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            An API you would design yourself.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Runbolt stays out of your way. Define workflows in the builder or in
            code, trigger them from anywhere, and inspect every run with tools
            you already use.
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-fg">
                <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-ok/15 text-ok">
                  <CheckIcon width={10} height={10} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <div
            role="tablist"
            aria-label="Code examples"
            className="mb-3 flex gap-1 rounded-lg border border-line bg-surface/60 p-1"
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active === tab}
                aria-controls={`code-panel-${tab}`}
                id={`tab-${tab}`}
                onClick={() => setActive(tab)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                  active === tab
                    ? "bg-active text-fg"
                    : "text-muted hover:bg-hover hover:text-fg"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`code-panel-${active}`}
            aria-labelledby={`tab-${active}`}
          >
            <CodeBlock lines={content[active]} title={titles[active]} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
