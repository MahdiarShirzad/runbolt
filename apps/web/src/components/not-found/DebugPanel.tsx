import Link from "next/link";
import { Reveal } from "../landing/Reveal";

type Row = {
  key: string;
  value: string;
  valueCls?: string;
};

const rows: Row[] = [
  { key: "error", value: "ROUTE_NOT_FOUND", valueCls: "text-bad" },
  { key: "status", value: "404", valueCls: "text-bad" },
  { key: "handler", value: "null", valueCls: "text-muted" },
  { key: "middleware", value: "matched · no route", valueCls: "text-warn" },
  { key: "source", value: "router.resolve()", valueCls: "text-highlight" },
];

const logs: [string, string, string][] = [
  ["00:00:00", "INFO", "incoming request · path unknown"],
  ["00:00:00", "WARN", "route table lookup · miss"],
  ["00:00:00", "ERR ", "handler unresolved · exiting 404"],
];

export function DebugPanel() {
  return (
    <Reveal delay={80}>
      <section
        aria-labelledby="debug-panel-heading"
        className="mx-auto max-w-md"
      >
        <div className="overflow-hidden rounded-lg border border-line bg-code/70">
          <div className="flex items-center gap-2 border-b border-line/70 bg-raised/40 px-4 py-2">
            <span className="h-1.5 w-1.5 bg-bad/70" aria-hidden />
            <p
              id="debug-panel-heading"
              className="font-mono text-[10.5px] text-muted"
            >
              debug · not-found
            </p>
            <span className="ml-auto rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[9px] text-muted">
              read-only
            </span>
          </div>

          <dl className="space-y-1.5 px-4 py-3.5 font-mono text-[11.5px]">
            {rows.map((row) => (
              <div key={row.key} className="flex gap-3">
                <dt className="w-24 shrink-0 text-muted/70">{row.key}</dt>
                <dd className={`min-w-0 truncate ${row.valueCls ?? "text-code-text"}`}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="border-t border-line/70 px-4 py-3">
            <p className="font-mono text-[9.5px] uppercase tracking-widest text-muted/60">
              trace
            </p>
            <div className="mt-1.5 space-y-0.5 font-mono text-[10.5px] leading-5">
              {logs.map(([time, level, msg], i) => (
                <p key={i} className="whitespace-pre-wrap">
                  <span className="text-muted/55">{time}</span>{" "}
                  <span
                    className={
                      level === "ERR "
                        ? "text-bad"
                        : level === "WARN"
                          ? "text-warn"
                          : "text-info"
                    }
                  >
                    {level.padEnd(4)}
                  </span>{" "}
                  <span className="text-code-text">{msg}</span>
                </p>
              ))}
            </div>
          </div>

          <p className="border-t border-line/70 bg-surface/40 px-4 py-2 font-mono text-[10px] text-muted/60">
            static diagnostic · not a live server log
          </p>
        </div>

        <p className="mt-4 text-center text-[13px] leading-relaxed text-muted">
          Try the{" "}
          <Link
            href="/docs"
            className="underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-primary"
          >
            docs
          </Link>{" "}
          or head{" "}
          <Link
            href="/"
            className="underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-primary"
          >
            home
          </Link>
          .
        </p>
      </section>
    </Reveal>
  );
}
