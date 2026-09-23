import Link from "next/link";
import type { ReactNode } from "react";
import {
  type Block,
  type DocContent,
  type ApiEndpointDoc,
} from "@/content/docs/content";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./Callout";

/** Inline formatting: [label](href), `code`, **bold**. */
export function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link) {
          return (
            <Link
              key={i}
              href={link[2]}
              className="text-info underline decoration-info/30 underline-offset-2 transition-colors hover:text-highlight hover:decoration-highlight/50"
            >
              {link[1]}
            </Link>
          );
        }
        const code = /^`([^`]+)`$/.exec(part);
        if (code) {
          return (
            <code
              key={i}
              className="rounded bg-code px-1.5 py-0.5 font-mono text-[0.85em] text-highlight"
            >
              {code[1]}
            </code>
          );
        }
        const bold = /^\*\*([^*]+)\*\*$/.exec(part);
        if (bold) {
          return (
            <strong key={i} className="font-semibold text-fg">
              {bold[1]}
            </strong>
          );
        }
        return part;
      })}
    </>
  );
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const methodColor: Record<ApiEndpointDoc["method"], string> = {
  GET: "border-info/40 bg-info/10 text-info",
  POST: "border-ok/40 bg-ok/10 text-ok",
  PUT: "border-warn/40 bg-warn/10 text-warn",
  PATCH: "border-accent/40 bg-accent/10 text-accent",
  DELETE: "border-bad/40 bg-bad/10 text-bad",
};

function ApiEndpoint({ endpoint }: { endpoint: ApiEndpointDoc }) {
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-surface/60">
      <div className="flex flex-wrap items-center gap-3 border-b border-line/70 px-4 py-3">
        <span
          className={`rounded border px-2 py-0.5 font-mono text-[11px] font-semibold ${methodColor[endpoint.method]}`}
        >
          {endpoint.method}
        </span>
        <code className="font-mono text-[13px] text-fg">{endpoint.path}</code>
      </div>
      <div className="space-y-4 p-4">
        <p className="text-sm leading-relaxed text-muted">
          <InlineText text={endpoint.description} />
        </p>

        {endpoint.params && endpoint.params.length > 0 && (
          <div className="scroll-slim overflow-x-auto rounded-md border border-line/70">
            <table className="w-full min-w-[480px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-line/70 bg-raised/50">
                  <th scope="col" className="px-3 py-2 font-medium text-muted">Parameter</th>
                  <th scope="col" className="px-3 py-2 font-medium text-muted">Type</th>
                  <th scope="col" className="px-3 py-2 font-medium text-muted">Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.params.map((param) => (
                  <tr key={param.name} className="border-b border-line/40 last:border-0">
                    <td className="px-3 py-2 font-mono text-[12px] text-highlight">
                      {param.name}
                      {param.required && (
                        <span className="ml-1.5 font-sans text-[10px] text-warn">required</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px] text-accent">{param.type}</td>
                    <td className="px-3 py-2 text-muted">
                      <InlineText text={param.description} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(endpoint.request || endpoint.response) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {endpoint.request && (
              <CodeBlock code={endpoint.request} language="json" title="Request" />
            )}
            {endpoint.response && (
              <CodeBlock code={endpoint.response} language="json" title="Response · 200" />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/** Static product-UI panels used as "screenshots" in articles. */
function UiPanel({ variant }: { variant: "builder" | "run" }) {
  if (variant === "builder") {
    return (
      <div className="overflow-hidden rounded-lg border border-line bg-surface" aria-label="Workflow builder preview">
        <div className="flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-line" />
            <span className="h-2 w-2 rounded-full bg-line" />
            <span className="h-2 w-2 rounded-full bg-line" />
          </div>
          <p className="font-mono text-[11px] text-muted">
            runbolt<span className="text-line">/</span>
            <span className="text-fg">order-fulfillment</span>
          </p>
          <span className="ml-auto rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-button-text">
            Deploy
          </span>
        </div>
        <div className="bg-grid relative flex flex-wrap items-center gap-3 px-6 py-7">
          {[
            ["Webhook", "border-warn/40 text-warn"],
            ["HTTP Request", "border-info/40 text-info"],
            ["Database", "border-ok/40 text-ok"],
          ].map(([label, cls], i) => (
            <div key={label} className="flex items-center gap-3">
              {i > 0 && <span className="h-px w-6 bg-line" aria-hidden />}
              <span className={`rounded-md border bg-code px-3 py-1.5 font-mono text-[11px] ${cls}`}>
                {label}
              </span>
            </div>
          ))}
          <span className="h-px w-6 border-t border-dashed border-line" aria-hidden />
          <span className="flex h-7 w-9 items-center justify-center rounded-md border border-dashed border-line font-mono text-[11px] text-muted/50">
            +
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface" aria-label="Execution preview">
      <div className="flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 py-2.5">
        <p className="font-mono text-[11px] text-muted">
          run <span className="text-fg">run_9f2ac1e7</span>
        </p>
        <span className="ml-auto flex items-center gap-1.5 rounded border border-ok/25 bg-ok/10 px-2 py-0.5 font-mono text-[10px] text-ok">
          <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden />
          SUCCEEDED
        </span>
      </div>
      <ol className="p-3 font-mono text-[11.5px] leading-6">
        {[
          ["webhook", "success", "18ms", "text-ok"],
          ["charge-card", "success", "171ms", "text-ok"],
          ["persist-order", "success", "94ms", "text-ok"],
        ].map(([name, status, dur, cls]) => (
          <li key={name} className="flex items-center gap-2 px-2">
            <span className={cls}>●</span>
            <span className="text-fg">{name}</span>
            <span className="text-muted/60">{status}</span>
            <span className="ml-auto text-muted/70">{dur}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function DocHeading({ level, text }: { level: 2 | 3; text: string }) {
  const id = slugifyHeading(text);
  if (level === 2) {
    return (
      <h2
        id={id}
        className="group scroll-mt-24 border-t border-line/60 pt-8 text-xl font-semibold tracking-tight text-fg"
      >
        <a href={`#${id}`} className="focus-visible:outline-none">
          {text}
          <span
            aria-hidden
            className="ml-2 text-muted/0 transition-colors group-hover:text-muted/60"
          >
            #
          </span>
        </a>
      </h2>
    );
  }
  return (
    <h3 id={id} className="scroll-mt-24 text-[15px] font-semibold text-fg">
      {text}
    </h3>
  );
}

export function renderBlock(block: Block, key: number): ReactNode {
  switch (block.type) {
    case "p":
      return (
        <p key={key} className="leading-[1.75] text-muted">
          <InlineText text={block.text} />
        </p>
      );
    case "h2":
      return <DocHeading key={key} level={2} text={block.text} />;
    case "h3":
      return <DocHeading key={key} level={3} text={block.text} />;
    case "list":
      return (
        <ul key={key} className="space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 leading-relaxed text-muted">
              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>
                <InlineText text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "code":
      return (
        <CodeBlock
          key={key}
          code={block.code}
          language={block.language}
          title={block.title}
          lineNumbers={block.lineNumbers}
        />
      );
    case "callout":
      return (
        <Callout key={key} kind={block.kind}>
          <InlineText text={block.text} />
        </Callout>
      );
    case "ui":
      return <UiPanel key={key} variant={block.variant} />;
    case "endpoints":
      return (
        <div key={key} className="space-y-4">
          {block.endpoints.map((endpoint) => (
            <ApiEndpoint key={`${endpoint.method} ${endpoint.path}`} endpoint={endpoint} />
          ))}
        </div>
      );
  }
}

export function DocsArticle({ doc }: { doc: DocContent }) {
  return (
    <article className="space-y-6">
      {doc.blocks.map((block, i) => renderBlock(block, i))}
    </article>
  );
}
