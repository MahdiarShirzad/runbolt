"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  ChevronDownIcon,
  NodeGraphIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/landing/icons";
import { currentTimestamp } from "@/lib/dashboard/format";
import {
  addCreatedWorkflow,
  isLocalWorkflow,
  loadLocalState,
  markMockDeleted,
  nextCopySlug,
  removeCreatedWorkflow,
  setMockStatusOverride,
  subscribeLocalWorkflows,
  updateCreatedWorkflow,
} from "@/lib/dashboard/local-workflows";
import type { LocalWorkflow } from "@/lib/dashboard/local-workflows";
import type { WorkflowStatus } from "@/lib/dashboard/types";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";
import { StatusBadge, TriggerBadge, WorkflowStatusBadge } from "./StatusBadge";
import { primaryActionCls, secondaryActionCls } from "./actions";
import { mergeWorkflowItems } from "./workflows-view";
import type { WorkflowItem } from "./workflows-view";

type StatusFilter = "all" | WorkflowStatus;
type SortKey = "updated" | "name" | "runs";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "updated", label: "Recently updated" },
  { value: "name", label: "Name A–Z" },
  { value: "runs", label: "Most runs (30d)" },
];

const menuItemCls =
  "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-muted transition-colors hover:bg-hover hover:text-fg";
const menuDangerCls =
  "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-bad transition-colors hover:bg-bad/10";

/** Fixed menu geometry — it escapes the Panel's overflow clipping. */
const MENU_WIDTH = 208;
const MENU_MIN_HEIGHT = 210;

export function WorkflowsList({ items: initialItems }: { items: WorkflowItem[] }) {
  const [items, setItems] = useState<WorkflowItem[]>(initialItems);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{
    top?: number;
    bottom?: number;
    left: number;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WorkflowItem | null>(null);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const wrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const lastMenuId = useRef<string | null>(null);
  const noticeSeq = useRef(0);

  // Merge the browser-local workflow layer over the server baseline, and stay
  // subscribed so create/pause/delete anywhere updates this table.
  useEffect(() => {
    function refresh() {
      setItems(
        mergeWorkflowItems(initialItems, loadLocalState(), currentTimestamp()),
      );
    }
    refresh();
    return subscribeLocalWorkflows(refresh);
  }, [initialItems]);

  const notify = useCallback((text: string) => {
    noticeSeq.current += 1;
    setNotice({ id: noticeSeq.current, text });
  }, []);

  const closeQuietly = useCallback(() => setOpenMenuId(null), []);

  const closeMenuToTrigger = useCallback((rowId: string | null) => {
    setOpenMenuId(null);
    if (rowId) triggerRefs.current[rowId]?.focus();
  }, []);

  // Outside pointerdown or Escape closes the open row menu.
  useEffect(() => {
    if (!openMenuId) return;
    const rowId = openMenuId;
    function onPointerDown(event: PointerEvent) {
      const node = wrapperRefs.current[rowId];
      if (node && !node.contains(event.target as Node)) closeQuietly();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenuId(null);
        triggerRefs.current[rowId]?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    // Fixed coordinates go stale on scroll/resize — dismiss instead.
    document.addEventListener("scroll", closeQuietly, true);
    window.addEventListener("resize", closeQuietly);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("scroll", closeQuietly, true);
      window.removeEventListener("resize", closeQuietly);
    };
  }, [openMenuId, closeQuietly]);

  // Focus the first menu item when a row menu opens.
  useEffect(() => {
    if (!openMenuId) return;
    wrapperRefs.current[openMenuId]
      ?.querySelector<HTMLElement>('[role="menuitem"]')
      ?.focus();
  }, [openMenuId]);

  // Auto-clear action feedback.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const closeDelete = useCallback(() => {
    const rowId = lastMenuId.current;
    setPendingDelete(null);
    if (rowId) triggerRefs.current[rowId]?.focus();
  }, []);

  // Escape + scroll lock while the confirmation dialog is open.
  useEffect(() => {
    if (!pendingDelete) return;
    cancelDeleteRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDelete();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pendingDelete, closeDelete]);

  const toggleStatus = (item: WorkflowItem) => {
    const next: WorkflowStatus = item.status === "active" ? "paused" : "active";
    if (isLocalWorkflow(item.id)) {
      updateCreatedWorkflow(item.id, { status: next });
    } else {
      setMockStatusOverride(item.id, next);
    }
    closeMenuToTrigger(item.id);
    notify(
      `“${item.name}” ${next === "active" ? "activated" : "paused"} — saved in this browser.`,
    );
  };

  const duplicate = (item: WorkflowItem) => {
    const slug = nextCopySlug(
      item.slug,
      items.map((w) => w.slug),
    );
    const copy: LocalWorkflow = {
      id: `local_${slug}`,
      name: `${item.name} (copy)`,
      slug,
      status: "paused",
      trigger: item.trigger,
      steps: [],
      triggerDetail: null,
      createdAt: new Date(currentTimestamp()).toISOString(),
    };
    addCreatedWorkflow(copy);
    closeMenuToTrigger(item.id);
    notify(`“${copy.name}” created in paused state — saved in this browser.`);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const removed = pendingDelete;
    if (isLocalWorkflow(removed.id)) {
      removeCreatedWorkflow(removed.id);
    } else {
      markMockDeleted(removed.id);
    }
    setPendingDelete(null);
    notify(`“${removed.name}” deleted — removed from this browser.`);
    searchRef.current?.focus();
  };

  const hasActiveFilters =
    query.trim() !== "" || statusFilter !== "all" || sort !== "updated";

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setSort("updated");
    searchRef.current?.focus();
  };

  const normalized = query.trim().toLowerCase();
  const filtered = items.filter(
    (w) =>
      (statusFilter === "all" || w.status === statusFilter) &&
      (normalized === "" ||
        w.name.toLowerCase().includes(normalized) ||
        w.slug.toLowerCase().includes(normalized)),
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "runs") return b.runs - a.runs || a.name.localeCompare(b.name);
    return b.updatedAt.localeCompare(a.updatedAt) || a.name.localeCompare(b.name);
  });

  return (
    <Panel
      title="All workflows"
      subtitle={`Workspace · ${items.length} workflows`}
      headingId="workflows-list-heading"
      bodyClassName="p-0"
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <div
            aria-hidden
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-ink text-primary"
          >
            <NodeGraphIcon width={22} height={22} />
          </div>
          <p className="mt-4 font-display text-lg font-semibold tracking-[-0.01em] text-fg">
            Create your first workflow
          </p>
          <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">
            Pick a trigger, add the steps you need, and let Runbolt run it
            reliably — your first workflow can be live in about two minutes.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <Link href="/workflows/new" className={primaryActionCls}>
              <PlusIcon width={13} height={13} aria-hidden />
              Create workflow
            </Link>
            <Link href="/templates" className={secondaryActionCls}>
              Explore templates
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2.5 border-b border-line/70 px-5 py-3">
            <div className="relative w-full sm:w-60">
              <label htmlFor="workflows-search" className="sr-only">
                Search workflows
              </label>
              <SearchIcon
                width={14}
                height={14}
                aria-hidden
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
              />
              <input
                ref={searchRef}
                id="workflows-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or slug"
                className="h-9 w-full rounded-md border border-line bg-ink pl-8 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary"
              />
            </div>

            <div
              role="group"
              aria-label="Filter by status"
              className="flex rounded-md border border-line bg-ink p-0.5"
            >
              {STATUS_FILTERS.map((option) => {
                const active = statusFilter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStatusFilter(option.value)}
                    className={`h-8 rounded-[4px] px-2.5 text-[12px] transition-colors duration-150 ${
                      active ? "bg-hover font-medium text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <label htmlFor="workflows-sort" className="sr-only">
                Sort workflows
              </label>
              <select
                id="workflows-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="h-9 appearance-none rounded-md border border-line bg-ink pl-3 pr-8 text-[12.5px] text-fg outline-none transition-colors focus:border-primary"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                width={13}
                height={13}
                aria-hidden
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-9 rounded-md px-2.5 text-[12.5px] text-muted transition-colors hover:text-fg"
              >
                Clear filters
              </button>
            )}

            <p className="ml-auto font-mono text-[11px] text-faint">
              Showing {sorted.length} of {items.length}
            </p>
          </div>

          {notice && (
            <p
              role="status"
              className="border-b border-line/70 bg-primary/[0.04] px-5 py-2 text-[12.5px] text-muted"
            >
              {notice.text}
            </p>
          )}

          {sorted.length === 0 ? (
            <EmptyState
              title="No workflows match your filters"
              description="Try a different search term or status filter to find what you are looking for."
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <ScrollArea fadeFrom="surface" label="Workflows table">
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line/70">
                    <th scope="col" className="px-5 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                      Workflow
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                      Trigger
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                      Last run
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                      Last result
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                      Runs (30d)
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                      Updated
                    </th>
                    <th scope="col" className="px-5 py-2.5 text-right font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((item) => {
                    const isOpen = openMenuId === item.id;
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-line/40 transition-colors last:border-b-0 hover:bg-hover/40"
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/workflows/${item.slug}`}
                            className="block truncate text-[13.5px] font-medium text-fg transition-colors hover:text-primary-strong"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-0.5 truncate font-mono text-[11px] text-faint">{item.slug}</p>
                        </td>
                        <td className="px-4 py-3">
                          <WorkflowStatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3">
                          <TriggerBadge trigger={item.trigger} />
                        </td>
                        <td className="px-4 py-3">
                          {item.lastRunAt ? (
                            <time
                              dateTime={item.lastRunAt}
                              title={item.lastRunAbsolute ?? undefined}
                              className="text-[13px] text-muted"
                            >
                              {item.lastRunLabel}
                            </time>
                          ) : (
                            <span className="text-[13px] text-faint">Never run</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.lastRunStatus ? (
                            <StatusBadge status={item.lastRunStatus} />
                          ) : (
                            <span className="text-[13px] text-faint">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[12.5px] tabular-nums text-muted">
                          {item.runsLabel}
                        </td>
                        <td className="px-4 py-3">
                          <time
                            dateTime={item.updatedAt}
                            title={item.updatedAbsolute}
                            className="text-[13px] text-muted"
                          >
                            {item.updatedLabel}
                          </time>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div
                            ref={(node) => {
                              wrapperRefs.current[item.id] = node;
                            }}
                            onBlur={(event) => {
                              if (
                                !event.currentTarget.contains(
                                  event.relatedTarget as Node | null,
                                )
                              ) {
                                closeQuietly();
                              }
                            }}
                            className="relative inline-block"
                          >
                            <button
                              ref={(node) => {
                                triggerRefs.current[item.id] = node;
                              }}
                              type="button"
                              aria-haspopup="menu"
                              aria-expanded={isOpen}
                              aria-label={`Actions for ${item.name}`}
                              onClick={(event) => {
                                lastMenuId.current = item.id;
                                if (openMenuId === item.id) {
                                  closeQuietly();
                                  return;
                                }
                                const rect = event.currentTarget.getBoundingClientRect();
                                const spaceBelow =
                                  window.innerHeight - rect.bottom;
                                const openUp =
                                  spaceBelow < MENU_MIN_HEIGHT &&
                                  rect.top > spaceBelow;
                                setMenuAnchor({
                                  ...(openUp
                                    ? { bottom: window.innerHeight - rect.top + 4 }
                                    : { top: rect.bottom + 4 }),
                                  left: Math.min(
                                    Math.max(rect.right - MENU_WIDTH, 8),
                                    Math.max(
                                      8,
                                      window.innerWidth - MENU_WIDTH - 8,
                                    ),
                                  ),
                                });
                                setOpenMenuId(item.id);
                              }}
                              className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2.5 text-[12px] text-muted transition-colors hover:border-line-strong hover:text-fg"
                            >
                              Actions
                              <ChevronDownIcon
                                width={12}
                                height={12}
                                aria-hidden
                                className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
                              />
                            </button>

                            {isOpen && (
                              <div
                                role="menu"
                                aria-label={`Actions for ${item.name}`}
                                style={menuAnchor ?? undefined}
                                onKeyDown={(event) => {
                                  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                                  const focusables = Array.from(
                                    event.currentTarget.querySelectorAll<HTMLElement>(
                                      '[role="menuitem"]',
                                    ),
                                  );
                                  if (focusables.length === 0) return;
                                  event.preventDefault();
                                  const current = focusables.indexOf(
                                    document.activeElement as HTMLElement,
                                  );
                                  const delta = event.key === "ArrowDown" ? 1 : -1;
                                  const next =
                                    current < 0
                                      ? 0
                                      : (current + delta + focusables.length) %
                                        focusables.length;
                                  focusables[next]?.focus();
                                }}
                                className="fixed z-40 w-52 overflow-hidden rounded-md border border-line bg-surface py-1 shadow-2xl shadow-overlay/40"
                              >
                                <Link
                                  href={`/workflows/${item.slug}`}
                                  role="menuitem"
                                  onClick={() => setOpenMenuId(null)}
                                  className={menuItemCls}
                                >
                                  Open workflow
                                </Link>
                                <Link
                                  href="/executions"
                                  role="menuitem"
                                  onClick={() => setOpenMenuId(null)}
                                  className={menuItemCls}
                                >
                                  View executions
                                </Link>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => toggleStatus(item)}
                                  className={menuItemCls}
                                >
                                  {item.status === "active" ? "Pause" : "Activate"}
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => duplicate(item)}
                                  className={menuItemCls}
                                >
                                  Duplicate
                                </button>
                                <div className="my-1 border-t border-line/60" />
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    lastMenuId.current = item.id;
                                    setOpenMenuId(null);
                                    setPendingDelete(item);
                                  }}
                                  className={menuDangerCls}
                                >
                                  Delete…
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </>
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-workflow-title"
          aria-describedby="delete-workflow-description"
        >
          <div
            className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
            onClick={closeDelete}
            aria-hidden
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface shadow-2xl shadow-overlay/40">
            <div className="px-5 py-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
                Delete workflow
              </p>
              <h2
                id="delete-workflow-title"
                className="mt-2 font-display text-lg font-semibold tracking-[-0.01em] text-fg"
              >
                {pendingDelete.name}
              </h2>
              <p className="mt-1 font-mono text-[11px] text-faint">
                {pendingDelete.slug}
              </p>
              <p
                id="delete-workflow-description"
                className="mt-2.5 text-[13px] leading-relaxed text-muted"
              >
                This removes the workflow from the list. Already recorded
                executions are not affected. The change is stored in this
                browser.
              </p>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-line/70 px-5 py-3.5">
              <button
                ref={cancelDeleteRef}
                type="button"
                onClick={closeDelete}
                className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex h-9 items-center justify-center rounded-md bg-bad px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-bad/90 active:translate-y-px"
              >
                Delete workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
