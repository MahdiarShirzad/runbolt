"use client";

import Link from "next/link";
import { PlusIcon, CloseIcon } from "@/components/landing/icons";
import {
  CATEGORY_STYLES,
  NODE_DEFINITIONS,
  configKeyValues,
  type GraphIssue,
  type NodeConfigField,
  type WorkflowNode,
} from "@/lib/dashboard/workflow-graph";
import { secondaryActionCls } from "../actions";

export interface CredentialOption {
  id: string;
  name: string;
}

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  issues: GraphIssue[];
  credentials: CredentialOption[];
  onChange: (patch: Partial<Pick<WorkflowNode, "label" | "description" | "config">>) => void;
  onConfigChange: (key: string, value: unknown) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClose: () => void;
}

const inputCls =
  "h-9 w-full rounded-md border border-line bg-ink px-2.5 text-[12.5px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary";
const textareaCls =
  "w-full rounded-md border border-line bg-ink px-2.5 py-2 font-mono text-[11.5px] leading-relaxed text-fg outline-none transition-colors placeholder:text-faint focus:border-primary";

export function NodeConfigPanel({
  node,
  issues,
  credentials,
  onChange,
  onConfigChange,
  onDelete,
  onDuplicate,
  onClose,
}: NodeConfigPanelProps) {
  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-[13px] font-medium text-fg">Nothing selected</p>
        <p className="mt-1.5 max-w-[15rem] text-[12px] leading-relaxed text-muted">
          Select a node on the canvas to edit its settings, or drag one in from the library.
        </p>
      </div>
    );
  }

  const definition = NODE_DEFINITIONS[node.type];
  const styles = CATEGORY_STYLES[definition.category];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-2 border-b border-line/70 px-3.5 py-3">
        <div className="min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] ${styles.chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden />
            {definition.label}
          </span>
          <p className="mt-1.5 truncate text-[13px] font-medium text-fg">{node.id}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close configuration panel"
          className="rounded-md border border-line p-1 text-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          <CloseIcon width={13} height={13} aria-hidden />
        </button>
      </div>

      <div className="scroll-slim min-h-0 flex-1 space-y-4 overflow-y-auto px-3.5 py-4">
        {!definition.executable && (
          <div className="rounded-md border border-warn/40 bg-warn/[0.07] px-3 py-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-warn">
              Not executable
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              {definition.unavailableReason}
            </p>
          </div>
        )}

        <div>
          <label htmlFor="node-label" className="mb-1.5 block text-[12px] font-medium text-fg">
            Name
          </label>
          <input
            id="node-label"
            type="text"
            value={node.label ?? definition.label}
            onChange={(event) => onChange({ label: event.target.value })}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="node-description" className="mb-1.5 block text-[12px] font-medium text-fg">
            Notes
          </label>
          <textarea
            id="node-description"
            value={node.description ?? ""}
            onChange={(event) => onChange({ description: event.target.value })}
            rows={2}
            placeholder="Optional note about this step"
            className={textareaCls}
          />
        </div>

        {definition.fields.length > 0 && (
          <div className="space-y-3.5 border-t border-line/60 pt-3.5">
            {definition.fields.map((field) => (
              <FieldControl
                key={field.key}
                field={field}
                node={node}
                credentials={credentials}
                onConfigChange={onConfigChange}
              />
            ))}
          </div>
        )}

        {issues.length > 0 && (
          <div className="rounded-md border border-warn/40 bg-warn/[0.06] px-3 py-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-warn">
              Needs attention
            </p>
            <ul className="mt-1.5 space-y-1">
              {issues.map((issue, index) => (
                <li key={`${issue.code}-${index}`} className="text-[12px] leading-relaxed text-muted">
                  {issue.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-line/70 px-3.5 py-3">
        <button type="button" onClick={onDuplicate} className={secondaryActionCls}>
          Duplicate
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 items-center justify-center rounded-md border border-bad/40 px-3.5 text-[13px] text-bad transition-colors hover:bg-bad/10"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function FieldControl({
  field,
  node,
  credentials,
  onConfigChange,
}: {
  field: NodeConfigField;
  node: WorkflowNode;
  credentials: CredentialOption[];
  onConfigChange: (key: string, value: unknown) => void;
}) {
  const id = `field-${node.id}-${field.key}`;
  const value = node.config[field.key];

  const label = (
    <label htmlFor={id} className="mb-1 block text-[12px] font-medium text-fg">
      {field.label}
      {field.required && <span className="ml-1 text-bad">*</span>}
    </label>
  );

  const help = field.help ? (
    <p className="mt-1 text-[11px] leading-relaxed text-faint">{field.help}</p>
  ) : null;

  if (field.type === "key_value") {
    return <KeyValueField field={field} node={node} onConfigChange={onConfigChange} />;
  }

  if (field.type === "credential") {
    return (
      <div>
        {label}
        <select
          id={id}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onConfigChange(field.key, event.target.value)}
          className={inputCls}
        >
          <option value="">No credential</option>
          {credentials.map((credential) => (
            <option key={credential.id} value={credential.id}>
              {credential.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-faint">
          Manage credentials in{" "}
          <Link href="/credentials" className="text-primary-strong hover:underline">
            the vault
          </Link>
          . Secrets are never stored in this demo.
        </p>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        {label}
        <select
          id={id}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onConfigChange(field.key, event.target.value)}
          className={inputCls}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {help}
      </div>
    );
  }

  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-[12.5px] text-fg">
        <input
          id={id}
          type="checkbox"
          checked={value === true}
          onChange={(event) => onConfigChange(field.key, event.target.checked)}
          className="h-3.5 w-3.5 accent-primary"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "number") {
    return (
      <div>
        {label}
        <input
          id={id}
          type="number"
          value={typeof value === "number" || typeof value === "string" ? String(value) : ""}
          min={field.min}
          max={field.max}
          onChange={(event) => onConfigChange(field.key, event.target.value)}
          className={inputCls}
        />
        {help}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <textarea
          id={id}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onConfigChange(field.key, event.target.value)}
          rows={3}
          placeholder={field.placeholder}
          className={textareaCls}
        />
        {help}
      </div>
    );
  }

  return (
    <div>
      {label}
      <input
        id={id}
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onConfigChange(field.key, event.target.value)}
        placeholder={field.placeholder}
        className={inputCls}
      />
      {help}
    </div>
  );
}

function KeyValueField({
  field,
  node,
  onConfigChange,
}: {
  field: NodeConfigField;
  node: WorkflowNode;
  onConfigChange: (key: string, value: unknown) => void;
}) {
  const rows = configKeyValues(node, field.key);

  const update = (index: number, patch: { key?: string; value?: string }) => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onConfigChange(field.key, next);
  };
  const add = () => onConfigChange(field.key, [...rows, { key: "", value: "" }]);
  const remove = (index: number) =>
    onConfigChange(
      field.key,
      rows.filter((_, i) => i !== index),
    );

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[12px] font-medium text-fg">{field.label}</span>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 text-[11.5px] text-muted transition-colors hover:text-fg"
        >
          <PlusIcon width={11} height={11} aria-hidden />
          Add
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="text-[11.5px] text-faint">No entries yet.</p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <input
                type="text"
                value={row.key}
                onChange={(event) => update(index, { key: event.target.value })}
                placeholder="key"
                aria-label={`${field.label} key ${index + 1}`}
                className={`${inputCls} font-mono`}
              />
              <input
                type="text"
                value={row.value}
                onChange={(event) => update(index, { value: event.target.value })}
                placeholder="value"
                aria-label={`${field.label} value ${index + 1}`}
                className={`${inputCls} font-mono`}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove ${field.label} row ${index + 1}`}
                className="shrink-0 rounded border border-line p-1.5 text-muted transition-colors hover:border-bad/50 hover:text-bad"
              >
                <CloseIcon width={11} height={11} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}
      {field.help && <p className="mt-1 text-[11px] leading-relaxed text-faint">{field.help}</p>}
    </div>
  );
}
