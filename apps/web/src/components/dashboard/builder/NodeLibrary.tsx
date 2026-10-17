"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/landing/icons";
import {
  ALL_NODE_TYPES,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_STYLES,
  NODE_DEFINITIONS,
  type WorkflowNodeCategory,
  type WorkflowNodeType,
} from "@/lib/dashboard/workflow-graph";

interface NodeLibraryProps {
  onAdd: (type: WorkflowNodeType) => void;
  onDragStart: (type: WorkflowNodeType, event: React.DragEvent) => void;
}

export const NODE_DRAG_MIME = "application/runbolt-node";

export function NodeLibrary({ onAdd, onDragStart }: NodeLibraryProps) {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const byCategory = new Map<WorkflowNodeCategory, WorkflowNodeType[]>();
    for (const type of ALL_NODE_TYPES) {
      const definition = NODE_DEFINITIONS[type];
      if (
        normalized &&
        !definition.label.toLowerCase().includes(normalized) &&
        !definition.description.toLowerCase().includes(normalized)
      ) {
        continue;
      }
      const list = byCategory.get(definition.category) ?? [];
      list.push(type);
      byCategory.set(definition.category, list);
    }
    return CATEGORY_ORDER.map((category) => ({
      category,
      types: byCategory.get(category) ?? [],
    })).filter((group) => group.types.length > 0);
  }, [query]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line/70 px-3 py-2.5">
        <label htmlFor="node-library-search" className="sr-only">
          Search nodes
        </label>
        <div className="relative">
          <SearchIcon
            width={13}
            height={13}
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            id="node-library-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search nodes"
            className="h-8 w-full rounded-md border border-line bg-ink pl-8 pr-2.5 text-[12.5px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary"
          />
        </div>
      </div>

      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-2.5 py-3">
        {grouped.length === 0 ? (
          <p className="px-2 py-6 text-center text-[12.5px] text-faint">
            No nodes match “{query}”.
          </p>
        ) : (
          grouped.map((group) => {
            const styles = CATEGORY_STYLES[group.category];
            return (
              <div key={group.category} className="mb-4 last:mb-0">
                <p className="mb-1.5 px-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  {CATEGORY_LABELS[group.category]}
                </p>
                <ul className="space-y-1">
                  {group.types.map((type) => {
                    const definition = NODE_DEFINITIONS[type];
                    return (
                      <li key={type}>
                        <button
                          type="button"
                          draggable
                          onDragStart={(event) => onDragStart(type, event)}
                          onClick={() => onAdd(type)}
                          title={definition.description}
                          className="group flex w-full items-start gap-2 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors hover:border-line hover:bg-hover/60"
                        >
                          <span
                            aria-hidden
                            className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate text-[12.5px] text-fg">
                                {definition.label}
                              </span>
                              {!definition.executable && (
                                <span className="shrink-0 rounded border border-warn/40 bg-warn/10 px-1 font-mono text-[9px] uppercase text-warn">
                                  soon
                                </span>
                              )}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-faint">
                              {definition.description}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
