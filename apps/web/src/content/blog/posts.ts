import type { Block } from "@/content/docs/content";

/**
 * Blog content uses the same typed-block model as documentation, so
 * articles render with identical typography and can embed code, lists,
 * and callouts without a second renderer.
 */

export interface Post {
  slug: string;
  title: string;
  date: string;
  tag: "Engineering" | "Product";
  readingTime: string;
  excerpt: string;
  blocks: Block[];
}

export const posts: Post[] = [
  {
    slug: "workflow-versions-are-immutable",
    title: "Why workflow versions never change",
    date: "2026-09-16",
    tag: "Engineering",
    readingTime: "5 min read",
    excerpt:
      "Editing a running workflow in place is how you lose the ability to explain what happened. Publishing in Runbolt creates a new version — here's why that decision shapes everything else.",
    blocks: [
      { type: "p", text: "A workflow that runs in production is not a document — it's a promise. When a run started three weeks ago charged a card, someone will eventually ask: which version of the workflow did that, and what exactly did it do? If your editor mutates the live definition in place, that question becomes unanswerable." },
      { type: "h2", text: "The problem with in-place edits" },
      { type: "p", text: "Most automation tools let you edit a live workflow freely, and it works fine — until the day a customer asks why they were billed twice. Then you're debugging against a definition that has changed five times since the incident, comparing memory against logs that describe a graph that no longer exists." },
      { type: "p", text: "The root cause is a missing distinction between **what a workflow is** and **what a workflow is right now**. Execution history needs to refer to something stable." },
      { type: "h2", text: "How versioning works in Runbolt" },
      { type: "p", text: "Editing a workflow creates a draft. Publishing the draft locks it as a new, immutable version, and every execution — past and future — is pinned to the exact version it ran on. The definition each run used is always one hop away:" },
      { type: "code", language: "ts", title: "publish.ts", code: `const version = await runbolt.workflows.publish("order-fulfillment");\n\n// → v42 locked · previous v41 stays queryable\n\nconst run = await runbolt.executions.get("run_9f2ac1e7");\nrun.version; // "v41" — the definition this run used` },
      { type: "callout", kind: "tip", text: "Rolling back is just publishing an old version again. Because versions are immutable, a rollback can never rewrite the history of runs that already happened." },
      { type: "h2", text: "What this buys you" },
      { type: "list", items: [
        "**Reproducible debugging** — a failed run shows the exact graph that produced it, not today's graph.",
        "**Trivial rollbacks** — re-publish v41 and you're done; no diffing, no restoring from backups.",
        "**Honest audits** — \"what did this automation do in July?\" has a definitive answer.",
      ] },
      { type: "h2", text: "The trade-off" },
      { type: "p", text: "Immutable versions mean storage grows with every publish, and \"live editing\" is no longer a feature — you publish deliberately instead. In practice that friction is the point: the moment before publishing is the right moment to look at the diff. Workflows deserve the same care as the rest of your codebase, and that starts with treating a deployed definition the way you treat a deployed build." },
      { type: "p", text: "Versioning is part of the [workflow model](/docs/workflows) — the builder and the CLI both write through it, so there's no path around it." },
    ],
  },
  {
    slug: "idempotency-keys",
    title: "Retries that don't double-charge",
    date: "2026-08-28",
    tag: "Engineering",
    readingTime: "6 min read",
    excerpt:
      "A retried step and a double-fired webhook are the same problem: the system did something, and nobody knows if it happened twice. Idempotency keys are how execution engines say \"no\" to the second one.",
    blocks: [
      { type: "p", text: "Automation fails in one of two directions: it does nothing, or it does something twice. The first is visible and annoying. The second is silent and expensive — a webhook fires, your engine times out waiting, the retry succeeds, and somewhere a customer's card gets charged twice." },
      { type: "h2", text: "Two failure modes, one root cause" },
      { type: "list", items: [
        "**The ambiguous timeout** — the request may or may not have been processed before the connection died. Retrying is the only way to make progress, but the action might already be done.",
        "**The double-fired trigger** — the same event arrives twice: a retry from the sender, a user double-click, a replayed queue message.",
      ] },
      { type: "p", text: "Both come from the same gap: the executor can't ask the target system \"did you already do this?\" — so it has to decide without asking. That decision needs to be reproducible, which means it needs a stable name for the operation." },
      { type: "h2", text: "Idempotency keys" },
      { type: "p", text: "An idempotency key is that name: a string that identifies the *intent* of an execution, not the attempt. Before a trigger starts a run, Runbolt records the key with a hash of the payload. If the same key arrives again — from a retry, a replay, or a double-fire — the engine returns the original run instead of starting a second one:" },
      { type: "code", language: "ts", title: "trigger.ts", code: `const run = await runbolt.workflows.trigger(\n  "charge-order",\n  { orderId: "ord_48213", total: 129.99 },\n  { idempotencyKey: "ord_48213:charge" },\n);\n\n// Second call with the same key, even minutes later:\n// → returns run_9f2ac1e7, no new execution` },
      { type: "callout", kind: "note", text: "Keys are scoped per workflow, so `ord_48213:charge` in two different workflows never collides. Scope by what makes the operation unique, not by the payload — payloads change, intent doesn't." },
      { type: "h2", text: "Where the check happens" },
      { type: "p", text: "The check and the record have to be atomic, or two concurrent arrivals both see \"no key\" and both proceed. Runbolt enforces this at the state transition with a `SELECT ... FOR UPDATE` lock in PostgreSQL — the same mechanism that keeps execution states race-free when workers crash mid-job. The lock is uncontended in the normal path; it only matters when the same intent actually collides, which is exactly when it should." },
      { type: "h2", text: "Designing your own triggers" },
      { type: "p", text: "The best idempotency keys come from your domain, not from the transport. An order ID plus an action — `ord_48213:charge` — says what the run is *for*. A random UUID per request says nothing: every arrival looks new, and the engine has to start a run every time. If you can't derive a key from the event, the honest fallback is the event's own ID; most systems that can replay events can also name them." },
      { type: "p", text: "Idempotency is on by default for webhook triggers in Runbolt, and available on every SDK trigger. See the [API reference](/docs/api) for the exact semantics." },
    ],
  },
  {
    slug: "anatomy-of-a-run",
    title: "The anatomy of a run",
    date: "2026-09-24",
    tag: "Product",
    readingTime: "4 min read",
    excerpt:
      "Trigger, steps, states, trace — what actually exists between \"webhook received\" and \"result stored\", and why every piece of it is queryable rather than buried in a log stream.",
    blocks: [
      { type: "p", text: "\"It failed\" is the least useful sentence in operations. Useful is: which step, on which attempt, with what input, failing how, since when. Getting from the first sentence to the second shouldn't require cross-referencing four log systems — that's the gap Runbolt exists to close, and it starts with how a run is represented." },
      { type: "h2", text: "States, not logs" },
      { type: "p", text: "A run is a state machine first and a log stream second. Every execution moves through explicit states — `queued`, `running`, `retrying`, `succeeded`, `failed` — and every transition is recorded. States answer \"what is happening\" instantly; logs answer \"why\" when you need to go deeper." },
      { type: "code", language: "json", title: "GET /v1/runs/run_9f2ac1e7", code: `{\n  "id": "run_9f2ac1e7",\n  "workflow": "order-fulfillment",\n  "version": "v42",\n  "status": "running",\n  "steps": [\n    { "name": "webhook",    "status": "success", "duration_ms": 18 },\n    { "name": "condition",  "status": "success", "duration_ms": 12 },\n    { "name": "charge",     "status": "success", "duration_ms": 171 },\n    { "name": "persist",    "status": "retrying", "attempt": 2 }\n  ]\n}` },
      { type: "h2", text: "Step-level tracking" },
      { type: "p", text: "Each node gets its own record: status, duration, input, output, and error. This is what makes the difference between \"the workflow failed\" and \"the database upsert failed on attempt 2 because of a row lock, then succeeded on attempt 3\". The workflow engine resolves the graph; the step records prove what each node actually did." },
      { type: "h2", text: "Why this matters at 3 a.m." },
      { type: "p", text: "When something breaks at night, the cost is not the failure — it's the time spent assembling context. With per-step state and payload capture, the debugging loop is one page: open the run, see the failing step, read its error, decide between retry, rollback, or fix-and-republish. Every field in that view exists because someone would otherwise reconstruct it by hand." },
      { type: "list", items: [
        "**Trace** — per-step durations as a waterfall, so latency is visible at a glance.",
        "**Retry history** — every attempt with its cause, not just the final outcome.",
        "**Inputs and outputs** — the exact payload each node saw and produced.",
      ] },
      { type: "p", text: "The [executions guide](/docs/executions) walks through the full lifecycle — including what happens when a run ends up in the dead-letter queue and how to recover it." },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getPostNeighbors(slug: string): {
  prev?: Post;
  next?: Post;
} {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? posts[index - 1] : undefined,
    next: index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
