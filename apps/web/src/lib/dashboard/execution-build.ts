import { hashString, mulberry32 } from "./random";
import { STEP_PLANS } from "./seeds";
import type { ExecutionStatus, ExecutionStep } from "./types";

/**
 * Canonical, deterministic execution-step synthesis.
 *
 * Both the curated execution history (`data.ts`) and the analytics dataset use
 * these helpers so a run looks identical no matter which surface renders it.
 */

const DEFAULT_FAILURE_DETAIL = "HTTP 502 from upstream after 3 attempts";

export function stepPlan(slug: string): string[] {
  return STEP_PLANS[slug] ?? ["step-1", "step-2", "step-3"];
}

export function stepCount(slug: string): number {
  return stepPlan(slug).length;
}

export function buildExecutionSteps(
  slug: string,
  status: ExecutionStatus,
  durationMs: number | null,
  failingStep: number | null,
  rand: () => number,
  failureDetail: string = DEFAULT_FAILURE_DETAIL,
): ExecutionStep[] {
  const names = stepPlan(slug);
  return names.map((name, i) => {
    const isFailing = failingStep === i;
    const isLast = i === names.length - 1;
    const stepStatus: ExecutionStatus = isFailing
      ? "failed"
      : status === "running" && isLast
        ? "running"
        : status === "cancelled" && i >= names.length - 2
          ? "cancelled"
          : "success";
    const stepDuration =
      stepStatus === "running"
        ? null
        : Math.max(12, Math.round((durationMs ?? 600) / names.length + (rand() - 0.5) * 180));
    return {
      name,
      status: stepStatus,
      durationMs: stepDuration,
      ...(isFailing ? { detail: failureDetail } : {}),
    };
  });
}

/** Synthesises plausible steps for an execution known only by its outcome. */
export function synthesizeExecutionSteps(
  slug: string,
  status: ExecutionStatus,
  durationMs: number | null,
  failureDetail?: string | null,
): ExecutionStep[] {
  const rand = mulberry32(hashString(`${slug}:${status}:${durationMs ?? "live"}`));
  const failingStep = status === "failed" ? Math.floor(rand() * stepCount(slug)) : null;
  return buildExecutionSteps(
    slug,
    status,
    durationMs,
    failingStep,
    rand,
    failureDetail ?? DEFAULT_FAILURE_DETAIL,
  );
}
