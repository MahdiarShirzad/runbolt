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

const roleClass: Record<TokenRole, string> = {
  txt: "text-[#C9D2E3]",
  key: "text-highlight",
  str: "text-ok",
  num: "text-accent",
  com: "text-[#546080]",
  kw: "text-accent",
  fn: "text-info",
  punc: "text-[#7C89A6]",
  ok: "text-ok",
  warn: "text-warn",
  info: "text-info",
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
        <div className="flex items-center gap-2 border-b border-line/70 px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-line" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-line" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-line" aria-hidden />
          <span className="ml-2 text-xs text-muted">{title}</span>
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
