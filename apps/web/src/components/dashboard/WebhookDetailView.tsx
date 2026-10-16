"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { ArrowLeftIcon, CheckIcon, CopyIcon } from "@/components/landing/icons";
import { formatCount } from "@/lib/dashboard/format";
import type {
  WebhookDelivery,
  WebhookDeliveryStatus,
  WebhookEndpoint,
} from "@/lib/dashboard/webhooks";
import { JsonBlock } from "./JsonBlock";
import { ChevronRightIcon } from "./icons";
import { DeliveryStatusBadge } from "./WebhooksBrowser";
import { EmptyState } from "./EmptyState";
import { Panel } from "./Panel";
import { secondaryActionCls } from "./actions";

export interface WebhookDetailData {
  endpoint: WebhookEndpoint;
  deliveries: WebhookDelivery[];
  /** Pre-formatted labels — no clock reads in render. */
  createdLabel: string;
  createdAbsolute: string;
  lastEventLabel: string | null;
  lastEventAbsolute: string | null;
  deliveryRows: {
    id: string;
    receivedLabel: string;
    receivedAbsolute: string;
    status: WebhookDeliveryStatus;
    executionId: string | null;
    durationLabel: string;
    error: string | null;
  }[];
}

const DELIVERY_STATUS_FILTERS: {
  value: WebhookDeliveryStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "processed", label: "Processed" },
  { value: "failed", label: "Failed" },
  { value: "rejected", label: "Rejected" },
  { value: "dropped", label: "Dropped" },
];

function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy endpoint URL"}
      onClick={() => {
        void navigator.clipboard
          .writeText(url)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          })
          .catch(() => {
            // Clipboard unavailable — URL stays visible below.
          });
      }}
      className="inline-flex h-7 items-center gap-1.5 rounded border border-line px-2 text-[11.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
      title="Copy placeholder URL (not live until the events API ships)"
    >
      {copied ? (
        <>
          <CheckIcon width={12} height={12} className="text-ok" />
          <span className="text-ok">Copied</span>
        </>
      ) : (
        <>
          <CopyIcon width={12} height={12} />
          Copy URL
        </>
      )}
    </button>
  );
}

export function WebhookDetailView({ detail }: { detail: WebhookDetailData }) {
  const router = useRouter();
  const { endpoint, deliveries } = detail;
  const [statusFilter, setStatusFilter] = useState<WebhookDeliveryStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    deliveries[0]?.id ?? null,
  );

  const filteredRows = useMemo(
    () =>
      detail.deliveryRows.filter(
        (row) => statusFilter === "all" || row.status === statusFilter,
      ),
    [detail.deliveryRows, statusFilter],
  );

  const selected = useMemo(
    () => deliveries.find((delivery) => delivery.id === selectedId) ?? null,
    [deliveries, selectedId],
  );

  const selectedRow = useMemo(
    () => detail.deliveryRows.find((row) => row.id === selectedId) ?? null,
    [detail.deliveryRows, selectedId],
  );

  return (
    <div className="space-y-4 lg:space-y-5">
      <Link
        href="/webhooks"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
      >
        <ArrowLeftIcon width={13} height={13} aria-hidden />
        Back to webhooks
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
              Webhook endpoint
            </p>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
                endpoint.status === "active"
                  ? "border-ok/30 bg-ok/10 text-ok"
                  : "border-line bg-ink text-faint"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${endpoint.status === "active" ? "bg-ok" : "bg-faint"}`}
                aria-hidden
              />
              {endpoint.status}
            </span>
          </div>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            {endpoint.name}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
            {endpoint.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => router.refresh()}
            className={secondaryActionCls}
          >
            Refresh deliveries
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="space-y-4">
          <Panel
            title="Delivery history"
            subtitle={`${formatCount(deliveries.length)} requests sampled · manual refresh only`}
            headingId="webhook-deliveries-heading"
            bodyClassName="p-0"
          >
            <div className="flex flex-wrap items-center gap-2 border-b border-line/70 px-5 py-3">
              <div
                role="group"
                aria-label="Filter deliveries by status"
                className="flex rounded-md border border-line bg-ink p-0.5"
              >
                {DELIVERY_STATUS_FILTERS.map((option) => {
                  const active = statusFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setStatusFilter(option.value)}
                      className={`h-8 rounded-[4px] px-2.5 text-[12px] transition-colors duration-150 ${
                        active
                          ? "bg-hover font-medium text-fg"
                          : "text-muted hover:text-fg"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredRows.length === 0 ? (
              <EmptyState
                title="No deliveries match"
                description="Try a different status filter, or refresh once the events API is connected."
                action={
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3.5 text-[13px] text-fg transition-colors hover:border-line-strong hover:bg-hover"
                  >
                    Show all statuses
                  </button>
                }
              />
            ) : (
              <ScrollArea fadeFrom="surface" label="Webhook deliveries">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line/70">
                      <th scope="col" className="px-5 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                        Received
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                        Execution
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                        Duration
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-faint">
                        Delivery ID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const isSelected = row.id === selectedId;
                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedId(row.id)}
                          className={`cursor-pointer border-b border-line/40 transition-colors last:border-b-0 ${
                            isSelected ? "bg-primary/[0.05]" : "hover:bg-hover/40"
                          }`}
                        >
                          <td
                            className="px-5 py-3 text-[13px] text-muted"
                            title={row.receivedAbsolute}
                          >
                            {row.receivedLabel}
                          </td>
                          <td className="px-4 py-3">
                            <DeliveryStatusBadge status={row.status} />
                          </td>
                          <td className="px-4 py-3">
                            {row.executionId ? (
                              <Link
                                href={`/executions/${row.executionId}`}
                                onClick={(event) => event.stopPropagation()}
                                className="inline-flex items-center gap-1 font-mono text-[11.5px] text-muted underline-offset-2 hover:text-fg hover:underline"
                              >
                                {row.executionId}
                                <ChevronRightIcon width={11} height={11} aria-hidden />
                              </Link>
                            ) : (
                              <span className="text-[12.5px] text-faint">No execution</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[12.5px] text-muted">
                            {row.durationLabel}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11.5px] text-faint">
                            {row.id}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </Panel>

          <Panel
            title="Request inspection"
            subtitle={
              selected
                ? `${selected.method} · ${selected.contentType}`
                : "Select a delivery"
            }
            headingId="webhook-inspection-heading"
          >
            {!selected || !selectedRow ? (
              <p className="text-[12.5px] text-muted">
                Select a delivery above to inspect its method, headers, and
                payload. Authorization headers and cookies are redacted.
              </p>
            ) : (
              <div className="space-y-4">
                <dl className="divide-y divide-line/50 rounded-md border border-line bg-ink px-3.5">
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                      Method
                    </dt>
                    <dd className="font-mono text-[12.5px] text-fg">{selected.method}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                      Received
                    </dt>
                    <dd className="text-[12.5px] text-fg" title={selectedRow.receivedAbsolute}>
                      {selectedRow.receivedLabel}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                      Content type
                    </dt>
                    <dd className="font-mono text-[12.5px] text-fg">
                      {selected.contentType}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                      Result
                    </dt>
                    <dd>
                      <DeliveryStatusBadge status={selected.status} />
                    </dd>
                  </div>
                </dl>

                {selectedRow.error && (
                  <p className="rounded-md border border-bad/30 bg-bad/[0.07] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-bad">
                    {selectedRow.error}
                  </p>
                )}

                <div>
                  <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                    Headers
                  </p>
                  <ul className="divide-y divide-line/50 rounded-md border border-line bg-ink">
                    {selected.headers.map((header) => (
                      <li
                        key={header.name}
                        className="flex items-center justify-between gap-3 px-3.5 py-1.5"
                      >
                        <span className="font-mono text-[11.5px] text-muted">
                          {header.name}
                        </span>
                        <span
                          className={`truncate font-mono text-[11.5px] ${
                            header.redacted ? "text-warn" : "text-fg"
                          }`}
                        >
                          {header.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-[11.5px] text-faint">
                    Authorization, cookies, and signature values are redacted.
                  </p>
                </div>

                <JsonBlock value={selected.payload} label="Request payload" />
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4 self-start lg:sticky lg:top-4">
          <Panel
            title="Endpoint"
            subtitle="URL and routing"
            headingId="webhook-endpoint-heading"
          >
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                  Endpoint URL
                </p>
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all rounded-md border border-line bg-ink px-3 py-2 font-mono text-[11.5px] text-muted">
                    {endpoint.url}
                  </code>
                  <CopyUrlButton url={endpoint.url} />
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-faint">
                  Placeholder on the reserved <code>.invalid</code> domain — not
                  live until the events API issues real endpoints.
                </p>
              </div>
              <dl className="divide-y divide-line/50 rounded-md border border-line bg-ink px-3.5">
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                    Workflow
                  </dt>
                  <dd>
                    <Link
                      href={`/workflows/${endpoint.workflowSlug}`}
                      className="text-[12.5px] text-muted underline-offset-2 hover:text-fg hover:underline"
                    >
                      {endpoint.workflowName}
                    </Link>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                    Created
                  </dt>
                  <dd
                    className="text-[12.5px] text-fg"
                    title={detail.createdAbsolute}
                  >
                    {detail.createdLabel}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                    Last event
                  </dt>
                  <dd
                    className="text-[12.5px] text-fg"
                    title={detail.lastEventAbsolute ?? undefined}
                  >
                    {detail.lastEventLabel ?? "Never"}
                  </dd>
                </div>
              </dl>
            </div>
          </Panel>

          <Panel
            title="Authentication"
            subtitle="How requests are verified"
            headingId="webhook-auth-heading"
          >
            <dl className="divide-y divide-line/50 rounded-md border border-line bg-ink px-3.5">
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                  Method
                </dt>
                <dd className="text-[12.5px] text-fg">
                  {endpoint.authMethod === "hmac-sha256"
                    ? "HMAC SHA-256"
                    : "None"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                  Signing secret
                </dt>
                <dd className="font-mono text-[12.5px] text-fg">{endpoint.secretHint}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[12px] leading-relaxed text-faint">
              The full secret is never shown after creation. Rotation and
              verification settings require the events API.
            </p>
          </Panel>

          <Panel
            title="Configuration"
            subtitle="Editing requires the events API"
            headingId="webhook-config-heading"
          >
            <p className="text-[12.5px] leading-relaxed text-muted">
              Renaming this endpoint, changing its workflow association, or
              disabling it needs server-side endpoints that do not exist yet —
              Runbolt will not simulate those changes locally.
            </p>
            <div className="mt-3">
              <Link href="/workflows" className={secondaryActionCls}>
                View workflows
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
