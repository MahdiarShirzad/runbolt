"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftIcon, CheckIcon } from "@/components/landing/icons";
import {
  INTEGRATIONS,
  findConnection,
  getStoredConnections,
  subscribeIntegrations,
} from "@/lib/dashboard/integrations";
import type { IntegrationConnection } from "@/lib/dashboard/integrations";
import { currentTimestamp } from "@/lib/dashboard/format";
import {
  addCreatedWorkflow,
  loadLocalState,
  makeSlug,
} from "@/lib/dashboard/local-workflows";
import {
  TEMPLATE_CATEGORY_LABELS,
} from "@/lib/dashboard/templates";
import type { WorkflowTemplate } from "@/lib/dashboard/templates";
import { IntegrationIcon } from "./IntegrationIcon";
import { Panel } from "./Panel";
import { TriggerBadge } from "./StatusBadge";
import { primaryActionCls, secondaryActionCls } from "./actions";

export function TemplateDetailView({
  template,
  existingSlugs,
}: {
  template: WorkflowTemplate;
  existingSlugs: string[];
}) {
  const router = useRouter();
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    function refresh() {
      setConnections(getStoredConnections());
    }
    refresh();
    return subscribeIntegrations(refresh);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const requiredDetails = useMemo(
    () =>
      template.requiredIntegrations.map((slug) => ({
        slug,
        integration: INTEGRATIONS.find((i) => i.slug === slug) ?? null,
        connected: findConnection(connections, slug) != null,
      })),
    [template.requiredIntegrations, connections],
  );

  const missingCount = requiredDetails.filter((item) => !item.connected).length;

  const resolveUniqueSlug = useCallback((): string => {
    const base = makeSlug(template.slug);
    const state = loadLocalState();
    const taken = new Set([
      ...existingSlugs,
      ...state.created.map((workflow) => workflow.slug),
    ]);
    if (!taken.has(base)) return base;
    let n = 2;
    while (taken.has(`${base}-${n}`)) n += 1;
    return `${base}-${n}`;
  }, [existingSlugs, template.slug]);

  const handleUseTemplate = () => {
    if (createdSlug) {
      router.push(`/workflows/${createdSlug}`);
      return;
    }
    const slug = resolveUniqueSlug();
    addCreatedWorkflow({
      id: `local_${slug}`,
      name: template.name,
      slug,
      status: "paused",
      trigger: template.trigger,
      steps: template.steps.map((step) => step.name),
      triggerDetail: template.triggerDetail,
      createdAt: new Date(currentTimestamp()).toISOString(),
    });
    setCreatedSlug(slug);
    setNotice(
      `Workflow “${template.name}” created from this template and saved in this browser — it starts paused until you activate it.`,
    );
  };

  const handleCopyLink = useCallback(() => {
    if (typeof window === "undefined") return;
    void navigator.clipboard
      .writeText(`${window.location.origin}/templates/${template.slug}`)
      .catch(() => {
        // Clipboard unavailable — link is still visible in the address bar.
      });
  }, [template.slug]);

  return (
    <div className="space-y-4 lg:space-y-5">
      <Link
        href="/templates"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
      >
        <ArrowLeftIcon width={13} height={13} aria-hidden />
        Back to templates
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
              {TEMPLATE_CATEGORY_LABELS[template.category]}
            </p>
            <TriggerBadge trigger={template.trigger} />
            {template.triggerDetail && (
              <span className="font-mono text-[10.5px] text-muted">
                {template.triggerDetail}
              </span>
            )}
            <span className="font-mono text-[10.5px] text-faint">
              ~{template.setupMinutes} min setup
            </span>
          </div>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            {template.name}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
            {template.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover active:translate-y-px"
          >
            Copy link
          </button>
          {createdSlug ? (
            <Link href={`/workflows/${createdSlug}`} className={primaryActionCls}>
              Open workflow
            </Link>
          ) : (
            <button type="button" onClick={handleUseTemplate} className={primaryActionCls}>
              Use template
            </button>
          )}
        </div>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-md border border-ok/30 bg-ok/[0.06] px-4 py-2.5 text-[12.5px] text-muted"
        >
          {notice}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="space-y-4">
          <Panel
            title="What it automates"
            subtitle="Problem and use case"
            headingId="template-overview-heading"
          >
            <p className="text-[13px] leading-relaxed text-muted">{template.problem}</p>
            <p className="mt-3 text-[13px] leading-relaxed text-fg">{template.useCase}</p>
          </Panel>

          <Panel
            title="Workflow preview"
            subtitle={`${template.steps.length} steps · read-only`}
            headingId="template-steps-heading"
          >
            <ol className="space-y-0">
              {template.steps.map((step, index) => (
                <li
                  key={index}
                  className={`flex items-start gap-3.5 py-3 ${
                    index > 0 ? "border-t border-line/50" : "pt-0"
                  }`}
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-ink font-mono text-[11px] text-faint">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-fg">{step.name}</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-3 border-t border-line/50 pt-3 text-[12px] leading-relaxed text-faint">
              Expected behavior: {template.behavior}
            </p>
          </Panel>

          <Panel
            title="Prerequisites"
            subtitle="What you need before activating"
            headingId="template-prerequisites-heading"
          >
            <ul className="space-y-2">
              {template.prerequisites.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <CheckIcon width={13} height={13} className="mt-0.5 shrink-0 text-faint" />
                  <span className="text-[13px] leading-relaxed text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-4 self-start lg:sticky lg:top-4">
          <Panel
            title="Required integrations"
            subtitle={
              missingCount > 0
                ? `${missingCount} not connected`
                : "All connected"
            }
            headingId="template-integrations-heading"
          >
            {requiredDetails.length === 0 ? (
              <p className="text-[12.5px] text-muted">
                This template needs no external integrations.
              </p>
            ) : (
              <ul className="space-y-2">
                {requiredDetails.map(({ slug, integration, connected }) => (
                  <li
                    key={slug}
                    className="flex items-center justify-between gap-3 rounded-md border border-line bg-ink px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <IntegrationIcon slug={slug} size={16} />
                      <span className="min-w-0 truncate text-[13px] text-fg">
                        {integration?.name ?? slug}
                      </span>
                    </div>
                    {integration ? (
                      <Link
                        href={`/integrations/${slug}`}
                        className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                          connected
                            ? "border-ok/30 bg-ok/10 text-ok"
                            : "border-warn/30 bg-warn/10 text-warn hover:border-warn/50"
                        }`}
                      >
                        {connected ? "Connected" : "Connect"}
                      </Link>
                    ) : (
                      <span
                        className="shrink-0 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-faint"
                        title="Not in the current catalog."
                      >
                        Unavailable
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {missingCount > 0 && (
              <p className="mt-3 text-[12px] leading-relaxed text-warn">
                {missingCount} integration{missingCount === 1 ? " is" : "s are"}{" "}
                not connected yet. You can still create the workflow — connect
                integrations before activating it.
              </p>
            )}
          </Panel>

          <Panel
            title="You'll configure"
            subtitle="Values to supply during setup"
            headingId="template-config-heading"
          >
            <ul className="space-y-1.5">
              {template.configFields.map((field) => (
                <li
                  key={field}
                  className="rounded-md border border-line bg-ink px-3 py-2 text-[12.5px] text-muted"
                >
                  {field}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/workflows/new" className={secondaryActionCls}>
                Start from scratch instead
              </Link>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
              >
                Copy template link
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
