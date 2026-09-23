"use client";

export const DOCS_SEARCH_EVENT = "runbolt:open-search";
export const DOCS_NAV_EVENT = "runbolt:toggle-docs-nav";
export const DOCS_NAV_CLOSED_EVENT = "runbolt:docs-nav-closed";

export function openSearch() {
  window.dispatchEvent(new CustomEvent(DOCS_SEARCH_EVENT));
}
