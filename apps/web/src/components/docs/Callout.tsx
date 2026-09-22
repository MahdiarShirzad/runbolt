import type { ReactNode } from "react";
import type { CalloutKind } from "@/content/docs/content";

const kindConfig: Record<
  CalloutKind,
  { label: string; icon: ReactNode; cls: string }
> = {
  note: {
    label: "Note",
    icon: (
      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
    ),
    cls: "border-info/30 bg-info/[0.06] text-info",
  },
  tip: {
    label: "Tip",
    icon: (
      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5.9 1.1 1 1.7h5.2c.1-.6.4-1.2 1-1.7A6 6 0 0 0 12 3Z" />
      </svg>
    ),
    cls: "border-ok/30 bg-ok/[0.06] text-ok",
  },
  warning: {
    label: "Warning",
    icon: (
      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3.5 2.5 20h19L12 3.5Z" />
        <path d="M12 10v4M12 17h.01" />
      </svg>
    ),
    cls: "border-warn/30 bg-warn/[0.06] text-warn",
  },
  important: {
    label: "Important",
    icon: (
      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2.5 4.5 5.5v6c0 4.7 3.2 8.3 7.5 10 4.3-1.7 7.5-5.3 7.5-10v-6L12 2.5Z" />
        <path d="M12 8v4M12 15.5h.01" />
      </svg>
    ),
    cls: "border-accent/30 bg-accent/[0.06] text-accent",
  },
};

export function Callout({ kind, children }: { kind: CalloutKind; children: ReactNode }) {
  const config = kindConfig[kind];
  return (
    <aside className={`rounded-lg border px-4 py-3.5 ${config.cls}`}>
      <p className="flex items-center gap-2 text-[13px] font-semibold">
        {config.icon}
        {config.label}
      </p>
      <div className="mt-1.5 text-sm leading-relaxed text-muted [&_code]:rounded [&_code]:bg-code [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12.5px] [&_code]:text-highlight">
        {children}
      </div>
    </aside>
  );
}
