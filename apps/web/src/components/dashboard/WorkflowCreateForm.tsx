"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, type FormEvent } from "react";
import {
  ChevronDownIcon,
  CloseIcon,
  PlusIcon,
} from "@/components/landing/icons";
import { currentTimestamp } from "@/lib/dashboard/format";
import {
  addCreatedWorkflow,
  loadLocalState,
  makeSlug,
} from "@/lib/dashboard/local-workflows";
import type { TriggerType } from "@/lib/dashboard/types";
import { Panel } from "./Panel";
import { primaryActionCls, secondaryActionCls } from "./actions";

const TRIGGER_OPTIONS: {
  value: TriggerType;
  label: string;
  description: string;
}[] = [
  {
    value: "webhook",
    label: "Webhook",
    description: "Fire when an external service posts to an endpoint.",
  },
  {
    value: "schedule",
    label: "Schedule",
    description: "Run automatically on a recurring interval.",
  },
  {
    value: "api",
    label: "API call",
    description: "Start when your application requests a run.",
  },
  {
    value: "manual",
    label: "Manual",
    description: "Run it yourself from the workflows table.",
  },
];

const SCHEDULE_PRESETS = [
  "Every 5 minutes",
  "Every hour",
  "Daily at 09:00 UTC",
  "Weekly on Monday 09:00 UTC",
];

const inputCls =
  "h-9 w-full rounded-md border border-line bg-ink px-3 text-[13px] text-fg outline-none transition-colors placeholder:text-faint focus:border-primary";
const inputErrorCls = "border-bad focus:border-bad";
const stepMoveCls =
  "inline-flex h-7 w-7 items-center justify-center rounded border border-line text-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-40";

interface FormErrors {
  name?: string;
  slug?: string;
  steps?: string;
}

export function WorkflowCreateForm({ existingSlugs }: { existingSlugs: string[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [trigger, setTrigger] = useState<TriggerType>("manual");
  const [schedulePreset, setSchedulePreset] = useState(SCHEDULE_PRESETS[2]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [errors, setErrors] = useState<FormErrors>({});

  const rootRef = useRef<HTMLFormElement>(null);

  const previewSlug = makeSlug(slugEdited ? slug : name);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugEdited) setSlug(makeSlug(value));
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setSlug(value);
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }));
  };

  const updateStep = (index: number, value: string) => {
    setSteps((prev) => prev.map((step, i) => (i === index ? value : step)));
    if (errors.steps) setErrors((prev) => ({ ...prev, steps: undefined }));
  };

  const addStep = () => {
    setSteps((prev) => [...prev, ""]);
    if (errors.steps) setErrors((prev) => ({ ...prev, steps: undefined }));
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
    if (errors.steps) setErrors((prev) => ({ ...prev, steps: undefined }));
  };

  const moveStep = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= steps.length) return;
    setSteps((prev) => {
      const next = [...prev];
      const moved = next[index];
      next[index] = next[target];
      next[target] = moved;
      return next;
    });
  };

  const focusFirstInvalid = () => {
    rootRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  };

  // Move focus to the first invalid field after a failed submit attempt.
  useEffect(() => {
    if (Object.values(errors).some(Boolean)) focusFirstInvalid();
  }, [errors]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const finalSlug = makeSlug(slugEdited ? slug : name);
    const trimmedSteps = steps.map((step) => step.trim());

    const nextErrors: FormErrors = {};
    if (!trimmedName) nextErrors.name = "Enter a name for the workflow.";
    if (!finalSlug) {
      nextErrors.slug = "The slug needs at least one letter or number.";
    } else {
      const state = loadLocalState();
      const taken = new Set([
        ...existingSlugs,
        ...state.created.map((workflow) => workflow.slug),
      ]);
      if (taken.has(finalSlug)) {
        nextErrors.slug = "This slug is already in use. Try another.";
      }
    }
    if (steps.length === 0) {
      nextErrors.steps = "Add at least one step.";
    } else if (trimmedSteps.some((step) => step === "")) {
      nextErrors.steps = "Name every step, or remove the empty ones.";
    }

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    addCreatedWorkflow({
      id: `local_${finalSlug}`,
      name: trimmedName,
      slug: finalSlug,
      status: "paused",
      trigger,
      steps: trimmedSteps,
      triggerDetail: trigger === "schedule" ? schedulePreset : null,
      createdAt: new Date(currentTimestamp()).toISOString(),
    });
    router.push(`/workflows/${finalSlug}`);
  };

  return (
    <form ref={rootRef} onSubmit={handleSubmit} noValidate className="space-y-4 lg:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            Workflow library
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-fg sm:text-[28px]">
            Create workflow
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Pick a trigger, add the steps you need, and save — new workflows
            start paused until you activate them.
          </p>
        </div>
        <Link href="/workflows" className={secondaryActionCls}>
          Cancel
        </Link>
      </div>

      <Panel title="Basics" subtitle="Name and URL" headingId="workflow-basics-heading">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="workflow-name" className="mb-1.5 block text-[13px] font-medium text-fg">
              Name
            </label>
            <input
              id="workflow-name"
              type="text"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="e.g. Nightly invoice export"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "workflow-name-error" : undefined}
              className={`${inputCls} ${errors.name ? inputErrorCls : ""}`}
            />
            {errors.name && (
              <p id="workflow-name-error" role="alert" className="mt-1.5 text-[12.5px] text-bad">
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="workflow-slug" className="mb-1.5 block text-[13px] font-medium text-fg">
              Slug
            </label>
            <input
              id="workflow-slug"
              type="text"
              value={slug}
              onChange={(event) => handleSlugChange(event.target.value)}
              placeholder="nightly-invoice-export"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(errors.slug)}
              aria-describedby={errors.slug ? "workflow-slug-error" : "workflow-slug-preview"}
              className={`${inputCls} font-mono ${errors.slug ? inputErrorCls : ""}`}
            />
            {errors.slug ? (
              <p id="workflow-slug-error" role="alert" className="mt-1.5 text-[12.5px] text-bad">
                {errors.slug}
              </p>
            ) : (
              <p id="workflow-slug-preview" className="mt-1.5 font-mono text-[11.5px] text-faint">
                /workflows/{previewSlug || "…"}
              </p>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="Trigger" subtitle="What starts a run" headingId="workflow-trigger-heading">
        <fieldset>
          <legend className="sr-only">Trigger type</legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {TRIGGER_OPTIONS.map((option) => {
              const checked = trigger === option.value;
              return (
                <label
                  key={option.value}
                  className={`peer flex cursor-pointer items-start gap-2.5 rounded-md border px-3.5 py-3 transition-colors ${
                    checked
                      ? "border-primary bg-primary/[0.06]"
                      : "border-line bg-ink hover:border-line-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="trigger"
                    value={option.value}
                    checked={checked}
                    onChange={() => setTrigger(option.value)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${
                      checked ? "border-primary" : "border-line-strong"
                    }`}
                  >
                    {checked && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium text-fg">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-muted">
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {trigger === "schedule" && (
          <div className="mt-4 max-w-sm">
            <label htmlFor="workflow-schedule" className="mb-1.5 block text-[13px] font-medium text-fg">
              Schedule
            </label>
            <div className="relative">
              <select
                id="workflow-schedule"
                value={schedulePreset}
                onChange={(event) => setSchedulePreset(event.target.value)}
                className={`${inputCls} appearance-none pr-8`}
              >
                {SCHEDULE_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
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
          </div>
        )}
      </Panel>

      <Panel
        title="Steps"
        subtitle={`${steps.length} step${steps.length === 1 ? "" : "s"}`}
        headingId="workflow-steps-heading"
        action={
          <button type="button" onClick={addStep} className={secondaryActionCls}>
            <PlusIcon width={13} height={13} aria-hidden />
            Add step
          </button>
        }
        bodyClassName="p-5"
      >
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-right font-mono text-[11px] text-faint">
                {index + 1}
              </span>
              <input
                type="text"
                value={step}
                onChange={(event) => updateStep(index, event.target.value)}
                placeholder={
                  index === 0 ? "e.g. Fetch pending orders" : "Describe this step"
                }
                autoComplete="off"
                aria-label={`Step ${index + 1}`}
                aria-invalid={Boolean(errors.steps) && step.trim() === ""}
                className={inputCls}
              />
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveStep(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move step ${index + 1} up`}
                  className={stepMoveCls}
                >
                  <ChevronDownIcon width={12} height={12} aria-hidden className="rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(index, 1)}
                  disabled={index === steps.length - 1}
                  aria-label={`Move step ${index + 1} down`}
                  className={stepMoveCls}
                >
                  <ChevronDownIcon width={12} height={12} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  disabled={steps.length === 1 && step === ""}
                  aria-label={`Remove step ${index + 1}`}
                  className={`${stepMoveCls} hover:border-bad/60 hover:text-bad`}
                >
                  <CloseIcon width={12} height={12} aria-hidden />
                </button>
              </div>
            </div>
          ))}
        </div>
        {errors.steps && (
          <p role="alert" className="mt-2.5 text-[12.5px] text-bad">
            {errors.steps}
          </p>
        )}
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={primaryActionCls}>
          Create workflow
        </button>
        <Link href="/workflows" className={secondaryActionCls}>
          Back to workflows
        </Link>
        <p className="text-[12.5px] text-faint">
          Saved in this browser until the Runbolt API is connected.
        </p>
      </div>
    </form>
  );
}
