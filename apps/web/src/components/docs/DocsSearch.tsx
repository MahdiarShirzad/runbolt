"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchIndex } from "@/content/docs/registry";
import { DOCS_SEARCH_EVENT } from "./DocsNavbar";
import { SearchIcon } from "../landing/icons";

const RECENT = ["Getting Started", "Execution API", "Retries and Timeouts"];
const SUGGESTED = ["Getting Started", "Core Concepts", "API", "Webhooks", "Workers"];

export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener(DOCS_SEARCH_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(DOCS_SEARCH_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      // wait a frame so the input exists before focusing
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return searchIndex.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q),
    );
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-overlay/70 px-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Search documentation"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_80px_rgba(5,7,12,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line/80 px-4 py-3.5">
          <SearchIcon width={15} height={15} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation…"
            aria-label="Search documentation"
            className="w-full bg-transparent text-[14px] text-fg outline-none placeholder:text-muted/60"
          />
          <kbd className="shrink-0 rounded border border-line bg-raised px-1.5 py-0.5 font-mono text-[10px] text-muted">
            ESC
          </kbd>
        </div>

        <div className="scroll-slim max-h-[50vh] overflow-y-auto p-2">
          {results ? (
            results.length > 0 ? (
              <ul>
                {results.map((entry) => (
                  <li key={entry.path}>
                    <Link
                      href={entry.path}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-hover"
                    >
                      <SearchIcon width={13} height={13} className="shrink-0 text-muted" />
                      <span className="text-sm text-fg">{entry.title}</span>
                      <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted/60">
                        {entry.category}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-8 text-center text-sm text-muted">
                No results for “{query}”.
              </p>
            )
          ) : (
            <>
              <p className="px-3 pb-1.5 pt-2 font-mono text-[10px] uppercase tracking-widest text-muted/60">
                Recent
              </p>
              <ul>
                {RECENT.map((title) => {
                  const entry = searchIndex.find((e) => e.title === title);
                  return entry ? (
                    <li key={title}>
                      <SearchResult entry={entry} onOpen={() => setOpen(false)} />
                    </li>
                  ) : null;
                })}
              </ul>
              <p className="px-3 pb-1.5 pt-3 font-mono text-[10px] uppercase tracking-widest text-muted/60">
                Suggested
              </p>
              <ul className="pb-1">
                {SUGGESTED.map((title) => {
                  const entry = searchIndex.find((e) => e.title === title);
                  return entry ? (
                    <li key={title}>
                      <SearchResult entry={entry} onOpen={() => setOpen(false)} />
                    </li>
                  ) : null;
                })}
              </ul>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-line/70 bg-code/60 px-4 py-2.5 font-mono text-[10px] text-muted/70">
          <span>
            <kbd className="rounded border border-line px-1">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="rounded border border-line px-1">↵</kbd> open
          </span>
          <span className="ml-auto">
            <kbd className="rounded border border-line px-1">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}

function SearchResult({
  entry,
  onOpen,
}: {
  entry: { title: string; path: string; category: string };
  onOpen: () => void;
}) {
  return (
    <Link
      href={entry.path}
      onClick={onOpen}
      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-hover"
    >
      <SearchIcon width={13} height={13} className="shrink-0 text-muted" />
      <span className="text-sm text-fg">{entry.title}</span>
      <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted/60">
        {entry.category}
      </span>
    </Link>
  );
}
