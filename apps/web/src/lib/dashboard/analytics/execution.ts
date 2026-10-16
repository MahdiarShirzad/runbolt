import { synthesizeExecutionSteps } from "../execution-build";
import type { Execution } from "../types";
import { getAnalyticsEvents } from "./dataset";
import type { AnalyticsEvent } from "./types";

/**
 * Adapts an analytics observation into the app's shared `Execution` contract so
 * dashboard rows, the execution drawer and the `/executions/[id]` detail route
 * all describe the exact same run.
 */
export function eventToExecution(event: AnalyticsEvent): Execution {
  return {
    id: event.id,
    workflowId: event.workflowId,
    workflowName: event.workflowName,
    status: event.status,
    trigger: event.trigger,
    startedAt: new Date(event.startedAt).toISOString(),
    finishedAt:
      event.durationMs == null
        ? null
        : new Date(event.startedAt + event.durationMs).toISOString(),
    durationMs: event.durationMs,
    steps: synthesizeExecutionSteps(
      event.workflowSlug,
      event.status,
      event.durationMs,
      event.errorCategory,
    ),
  };
}

/** Resolves a dashboard run id against the analytics dataset. */
export function getAnalyticsExecutionById(
  id: string,
  now: number = Date.now(),
): Execution | null {
  const event = getAnalyticsEvents(now).find((candidate) => candidate.id === id);
  return event ? eventToExecution(event) : null;
}
