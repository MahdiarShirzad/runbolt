import type { ReactNode } from "react";

/**
 * Hand-highlighted code rendering. A line is a list of tokens; each token
 * carries a palette role from the Runbolt code spec.
 */
export type TokenRole =
  | "txt"
  | "key"
  | "str"
  | "num"
  | "com"
  | "kw"
  | "fn"
  | "punc"
  | "ok"
  | "warn"
  | "info";

export type Token = [text: string, role?: TokenRole] | string;

export const roleClass: Record<TokenRole, string> = {
  txt: "text-code-text",
  key: "text-highlight",
  str: "text-ok",
  num: "text-accent",
  com: "text-comment",
  kw: "text-accent",
  fn: "text-highlight",
  punc: "text-[#6E7C94]",
  ok: "text-ok",
  warn: "text-warn",
  info: "text-highlight",
};

export function CodeBlock({
  lines,
  title,
  className = "",
}: {
  lines: Token[][];
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-line bg-code font-mono text-[13px] leading-relaxed ${className}`}
    >
      {title ? (
        <div className="ruler flex items-center gap-2 border-b border-line/70 bg-raised/50 px-4 pb-2 pt-2.5">
          <span className="h-1.5 w-1.5 bg-line-strong" aria-hidden />
          <span className="font-mono text-xs text-muted">{title}</span>
        </div>
      ) : null}
      <pre className="scroll-slim overflow-x-auto p-4" tabIndex={0} aria-label={title ?? "Code sample"}>
        <code>
          {lines.map((tokens, i) => (
            <span key={i} className="block whitespace-pre">
              {tokens.map((token, j) => {
                const [text, role] = Array.isArray(token) ? token : [token];
                return (
                  <span key={j} className={roleClass[role ?? "txt"]}>
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
  );
}

export function CodeLine({ children }: { children: ReactNode }) {
  return <span className="block whitespace-pre">{children}</span>;
}
