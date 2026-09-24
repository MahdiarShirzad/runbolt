import type { CodeLanguage } from "@/content/docs/content";
import type { Token, TokenRole } from "../landing/CodeBlock";
import { roleClass } from "../landing/CodeBlock";
import { CopyButton } from "../ui/copy-button";

/**
 * Small regex scanner for the code palette. Not a full parser — it covers
 * strings, comments, keywords, numbers, calls, and punctuation well enough
 * for documentation samples.
 */
const KEYWORDS =
  /\b(?:const|let|var|await|async|new|import|from|export|function|return|if|else|for|of|in|type|interface|class|throw|try|catch|def|print|package|func|nil|True|False|None)\b/;

function highlight(code: string, language: CodeLanguage): Token[][] {
  const isShell = language === "bash";
  const commentRe = isShell ? /^#.*/ : /\/\/.*/;
  const stringRe = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/;

  const rules: { re: RegExp; role: TokenRole | "flag" }[] = [
    { re: commentRe, role: "com" },
    { re: stringRe, role: "str" },
    ...(isShell ? [{ re: /(?:^|\s)--?[\w-]+/, role: "flag" as const }] : []),
    { re: KEYWORDS, role: "kw" },
    { re: /\b\d+(?:\.\d+)?\b/, role: "num" },
    { re: /\b[A-Za-z_$][\w$]*(?=\s*\()/, role: "fn" },
  ];

  return code.split("\n").map((line) => {
    const tokens: Token[] = [];
    let rest = line;

    if (isShell && rest.startsWith("$ ")) {
      tokens.push(["$ ", "com"]);
      rest = rest.slice(2);
    }

    let buffer = "";
    while (rest.length > 0) {
      let matched = false;
      for (const rule of rules) {
        const m = rule.re.exec(rest);
        if (!m || m.index !== 0) continue;
        const text = m[0];
        if (buffer) {
          tokens.push([buffer, "txt"]);
          buffer = "";
        }
        if (rule.role === "flag") {
          const lead = text.startsWith(" ") ? " " : "";
          if (lead) tokens.push([lead, "txt"]);
          tokens.push([text.trimStart(), "info"]);
        } else if (
          rule.role === "str" &&
          (language === "json" || language === "ts" || language === "js") &&
          /^\s*:/.test(rest.slice(text.length))
        ) {
          tokens.push([text, "key"]);
        } else {
          tokens.push([text, rule.role]);
        }
        rest = rest.slice(text.length);
        matched = true;
        break;
      }
      if (!matched) {
        const ch = rest[0];
        if (/[{}[\](),;:=><]/.test(ch)) {
          if (buffer) {
            tokens.push([buffer, "txt"]);
            buffer = "";
          }
          tokens.push([ch, "punc"]);
        } else {
          buffer += ch;
        }
        rest = rest.slice(1);
      }
    }
    if (buffer) tokens.push([buffer, "txt"]);
    return tokens;
  });
}

export function CodeBlock({
  code,
  language,
  title,
  lineNumbers = false,
}: {
  code: string;
  language: CodeLanguage;
  title?: string;
  lineNumbers?: boolean;
}) {
  const lines = highlight(code, language);

  return (
    <div className="group overflow-hidden rounded-lg border border-line bg-code">
      <div className="flex items-center border-b border-line/60 px-4 py-2">
        <span className="font-mono text-[11px] text-muted">{title ?? language}</span>
        <CopyButton
          text={code}
          className="opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
        />
      </div>
      <div className="flex">
        {lineNumbers && (
          <ol
            aria-hidden
            className="select-none border-r border-line/50 py-3.5 pl-4 pr-2.5 text-right font-mono text-[13px] leading-6 text-muted/40"
          >
            {lines.map((_, i) => (
              <li key={i}>{i + 1}</li>
            ))}
          </ol>
        )}
        <pre
          className="scroll-slim flex-1 overflow-x-auto py-3.5 px-4 font-mono text-[13px] leading-6"
          tabIndex={0}
          aria-label={`${language} code sample`}
        >
          <code>
            {lines.map((tokens, i) => (
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
