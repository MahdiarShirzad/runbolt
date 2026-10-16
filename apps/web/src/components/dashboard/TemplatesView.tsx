"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDownIcon,
  SearchIcon,
} from "@/components/landing/icons";
import { ChevronRightIcon } from "./icons";
import {
  TEMPLATE_CATEGORY_LABELS,
} from "@/lib/dashboard/templates";
import type {
  TemplateCategory,
  WorkflowTemplate,
} from "@/lib/dashboard/templates";
import { EmptyState } from "./EmptyState";
import { TriggerBadge } from "./StatusBadge";
import { secondaryActionCls } from "./actions";

type SortKey = "name" | "category" | "setup";

export interface TemplatesQuery {
  q: string;
  category: TemplateCategory | "all";
  integration: string;
  sort: SortKey;
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name", label: "Name A–Z" },
  { value: "category", label: "Category" },
  { value: "setup", label: "Setup effort" },
];

const selectCls =
  "h-9 appearance-none rounded-md border border-line bg-ink pl-3 pr-8 text-[12.5px] text-fg outline-none transition-colors focus:border-primary";

function TemplateCard({
  template,
  integrationNames,
}: {
  template: WorkflowTemplate;
  integrationNames: Map<string, string>;
}) {
  const previewSteps = template.steps.slice(0, 3);
  return (
    <article className="flex flex-col rounded-lg border border-line bg-surface/60 p-4 transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold tracking-tight text-fg">
            {template.name}
          </p>
          <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-faint">
            {TEMPLATE_CATEGORY_LABELS[template.category]}
          </p>
        </div>
        <TriggerBadge trigger={template.trigger} />
      </div>

      <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-muted">
        {template.description}
      </p>

      <ol className="mt-3.5 space-y-1.5 border-t border-line/50 pt-3">
        {previewSteps.map((step, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-px w-4 shrink-0 text-right font-mono text-[10.5px] text-faint">
              {index + 1}
            </span>
            <span className="min-w-0 truncate text-[12px] text-muted">
              {step.name}
            </span>
          </li>
        ))}
        {template.steps.length > previewSteps.length && (
          <li className="pl-6 font-mono text-[10.5px] text-faint">
            +{template.steps.length - previewSteps.length} more steps
          </li>
        )}
      </ol>

      {template.requiredIntegrations.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {template.requiredIntegrations.map((slug) => (
            <span
              key={slug}
              className="rounded border border-line bg-ink px-1.5 py-0.5 font-mono text-[10px] text-muted"
            >
              {integrationNames.get(slug) ?? slug}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-line/50 pt-3">
        <p className="font-mono text-[10.5px] text-faint">
          ~{template.setupMinutes} min setup
        </p>
        <Link
          href={`/templates/${template.slug}`}
          className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          View template
          <ChevronRightIcon width={12} height={12} aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export function TemplatesView({
  templates,
  integrationNames,
  initial,
}: {
  templates: WorkflowTemplate[];
  integrationNames: Map<string, string>;
  initial: TemplatesQuery;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState(initial.q);
  const [category, setCategory] = useState<TemplatesQuery["category"]>(initial.category);
  const [integration, setIntegration] = useState(initial.integration);
  const [sort, setSort] = useState<SortKey>(initial.sort);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "all") params.set("category", category);
    if (integration) params.set("integration", integration);
    if (sort !== "name") params.set("sort", sort);
    const search = params.toString();
    window.history.replaceState(null, "", search ? `${pathname}?${search}` : pathname);
  }, [query, category, integration, sort, pathname]);

  const categoriesPresent = useMemo(() => {
    const present = new Set(templates.map((t) => t.category));
    return (Object.keys(TEMPLATE_CATEGORY_LABELS) as TemplateCategory[]).filter(
      (key) => present.has(key),
    );
  }, [templates]);

  const integrationsPresent = useMemo(() => {
    const counts = new Map<string, number>();
    for (const template of templates) {
      for (const slug of template.requiredIntegrations) {
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([slug, count]) => ({ slug, count, name: integrationNames.get(slug) ?? slug }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [templates, integrationNames]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = templates.filter((template) => {
      const matchesSearch =
        needle === "" ||
        template.name.toLowerCase().includes(needle) ||
        template.description.toLowerCase().includes(needle) ||
        template.steps.some((step) => step.name.toLowerCase().includes(needle));
      const matchesCategory = category === "all" || template.category === category;
      const matchesIntegration =
        integration === "" || template.requiredIntegrations.includes(integration);
      return matchesSearch && matchesCategory && matchesIntegration;
    });
    return [...result].sort((a, b) => {
      if (sort === "category") {
        return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      }
      if (sort === "setup") {
        return a.setupMinutes - b.setupMinutes || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
  }, [templates, query, category, integration, sort]);

  const hasActiveFilters =
    query.trim() !== "" || category !== "all" || integration !== "" || sort !== "name";

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setIntegration("");
    setSort("name");
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            Start faster
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            Workflow Templates
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Prebuilt workflows for common automation patterns — preview the
            steps, check the integrations, then use one as the starting point
            for your own workflow.
          </p>
        </div>
        <Link href="/workflows/new" className={`${secondaryActionCls} shrink-0`}>
          Build from scratch
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative w-full sm:w-64">
          <label htmlFor="templates-search" className="sr-only">
            Search templates
          </label>
          <SearchIcon
            width={14}
            height={14}
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            id="templates-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search templates"
            className="h-9 w-full rounded-md border border-line bg-ink pl-8 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary"
          />
        </div>

        <div className="relative">
          <label htmlFor="templates-integration" className="sr-only">
            Filter by required integration
          </label>
          <select
            id="templates-integration"
            value={integration}
            onChange={(event) => setIntegration(event.target.value)}
            className={selectCls}
          >
            <option value="">All integrations</option>
            {integrationsPresent.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name} ({item.count})
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

        <div className="relative">
          <label htmlFor="templates-sort" className="sr-only">
            Sort templates
          </label>
          <select
            id="templates-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className={selectCls}
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
      </div>

      <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1.5">
        {[{ value: "all" as const, label: "All categories" }, ...categoriesPresent.map((key) => ({
          value: key,
          label: TEMPLATE_CATEGORY_LABELS[key],
        }))].map((option) => {
          const active = category === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(option.value)}
              className={`h-7 rounded-full border px-2.5 text-[11.5px] transition-colors ${
                active
                  ? "border-primary bg-primary/[0.08] font-medium text-fg"
                  : "border-line bg-ink text-muted hover:text-fg"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No templates match"
          description="Try a different search term, category, or integration filter."
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
        <>
          <p className="font-mono text-[11px] text-faint" aria-live="polite">
            {filtered.length} template{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((template) => (
              <TemplateCard
                key={template.slug}
                template={template}
                integrationNames={integrationNames}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
