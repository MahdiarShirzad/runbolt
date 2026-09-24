import type { Block } from "@/content/docs/content";

/**
 * Legal documents use the same typed-block model as documentation, so the
 * renderer and typography stay identical across the site.
 */

export interface LegalDoc {
  slug: string;
  title: string;
  updated: string;
  description: string;
  blocks: Block[];
}

export const legalDocs: Record<string, LegalDoc> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    updated: "2026-09-24",
    description:
      "What Runbolt collects, how execution data is handled, how long it is kept, and how to reach us about it.",
    blocks: [
      { type: "p", text: "This policy explains what data Runbolt handles, why, and what control you have over it. It is written to be read — each section covers one topic." },
      { type: "callout", kind: "note", text: "This is a plain-language summary of how the product behaves, not a substitute for legal review. Material changes will be announced before they take effect." },
      { type: "h2", text: "What we collect" },
      { type: "list", items: [
        "**Account data** — your name, email address, and a hashed password. Passwords are never stored in plaintext.",
        "**Workspace data** — organization names, team members, and the roles they hold.",
        "**Workflow definitions** — the graphs you build: nodes, connections, and configuration.",
        "**Execution data** — for each run: status, timing, inputs and outputs of each node, and structured logs.",
        "**Operational metadata** — API key identifiers (never raw keys), request IDs, and coarse usage counts needed to run and bill the service.",
      ] },
      { type: "h2", text: "Execution data deserves its own note" },
      { type: "p", text: "Workflows are automation you author — what flows through them is your data and, often, your customers' data. Runbolt stores step inputs and outputs so runs can be debugged, and structured logs so failures are explainable. Design workflows so that sensitive values pass through the [secrets store](/security#secrets) rather than being inlined into steps, and treat anything a workflow processes as potentially present in that run's history." },
      { type: "h2", text: "How we use data" },
      { type: "list", items: [
        "Operating the service — executing your workflows and returning results.",
        "Debugging and observability — showing you what a run did, step by step.",
        "Security — protecting accounts, detecting abuse, and enforcing access control.",
        "Billing — counting executions on paid plans.",
        "Product communication — service notices and, only with your opt-in, product updates.",
      ] },
      { type: "p", text: "We do not sell personal data, and we do not use your execution data to advertise to anyone." },
      { type: "h2", text: "Where data lives and how it is protected" },
      { type: "p", text: "Durable state — users, workflows, executions, and credentials — lives in PostgreSQL. Queues and locks live in Redis and are ephemeral. Credentials such as API keys are encrypted at rest with **AES-256-GCM**, access is governed by role-based control, and outbound workflow requests are subject to SSRF protections that block calls to internal addresses. You can read more on the [security page](/security)." },
      { type: "h2", text: "How long we keep it" },
      { type: "list", items: [
        "**Execution history** — 7 days on the Developer plan, 90 days on Team, and a custom window on Enterprise. After that, step payloads are removed.",
        "**Workflow definitions** — kept while your account is active, including immutable past versions.",
        "**Account data** — kept until you delete your account, then removed within 30 days except where law requires retention.",
      ] },
      { type: "h2", text: "Sub-processors" },
      { type: "p", text: "Running Runbolt involves infrastructure providers for hosting, managed PostgreSQL, managed Redis, and transactional email. Each processes data only to deliver the service. A current list is available on request." },
      { type: "h2", text: "Your rights and choices" },
      { type: "p", text: "You can access, export, or delete your data through your workspace, or by contacting us. Requests from individuals whose data flows through your workflows are your responsibility as the controller — we will assist you with them as described in our [DPA](/dpa)." },
      { type: "h2", text: "Contact" },
      { type: "p", text: "Questions about this policy: [privacy@runbolt.dev](mailto:privacy@runbolt.dev). For security matters, use the channel on the [security page](/security#disclosure) instead." },
    ],
  },

  terms: {
    slug: "terms",
    title: "Terms of Service",
    updated: "2026-09-24",
    description:
      "The agreement for using Runbolt: accounts, acceptable use, workflows, plans and billing, and liability.",
    blocks: [
      { type: "p", text: "These terms govern your use of Runbolt. By creating an account you agree to them. They are intentionally short — the product behavior they reference is documented in full in the [documentation](/docs)." },
      { type: "callout", kind: "note", text: "This is a plain-language summary of the agreement, not a substitute for legal review. Material changes will be announced before they take effect." },
      { type: "h2", text: "Accounts" },
      { type: "p", text: "Keep your credentials safe and your account information accurate. API keys are secrets: store them in the secrets store rather than in workflow logic or version control, and rotate them when team membership changes. You are responsible for activity that happens under your keys." },
      { type: "h2", text: "Acceptable use" },
      { type: "list", items: [
        "Don't use Runbolt to process data you have no right to process, or to break the law.",
        "Don't attempt to disrupt the service — including deliberately overloading queues or circumventing rate limits.",
        "Don't probe or test the security of the platform without an agreement in place. [Responsible disclosure](/security#disclosure) is welcome and appreciated.",
        "Don't use the service to attack, spam, or surveil others.",
      ] },
      { type: "h2", text: "Your workflows" },
      { type: "p", text: "You decide what your workflows do, and you own the results. Runbolt executes them faithfully: retries with exponential backoff, explicit failure states, and immutable versions — an edit creates a new version rather than changing history. If a workflow performs an action, that action is yours, including the ones that fire after a retry succeeds." },
      { type: "h2", text: "Plans, usage, and billing" },
      { type: "p", text: "One workflow run counts as one execution, regardless of how many nodes it contains; retried steps within the same run do not count again. The Developer plan is free. Paid plans renew per the billing period shown at checkout; upgrades apply immediately and downgrades take effect at the end of the current period. Execution history is retained per your plan — 7 days on Developer, 90 days on Team, custom on Enterprise." },
      { type: "h2", text: "Availability" },
      { type: "p", text: "We build Runbolt for reliability — deterministic execution, dead-letter queues, and manual recovery are core product behavior — but the service is provided as-is during this phase, without an SLA. Enterprise customers can contract for one. Planned maintenance is announced in advance." },
      { type: "h2", text: "Termination" },
      { type: "p", text: "You can delete your account at any time, and we'll remove your data as described in the [privacy policy](/privacy#how-long-we-keep-it). We may suspend accounts that violate these terms — with notice where possible — and reinstate them once the issue is resolved." },
      { type: "h2", text: "Liability" },
      { type: "p", text: "To the maximum extent permitted by law, Runbolt's liability is limited to the fees you paid in the twelve months before the claim. We are not liable for indirect or consequential damages, or for outcomes of workflows you authored." },
      { type: "h2", text: "Changes to these terms" },
      { type: "p", text: "If we change these terms materially, we'll notify you by email at least 30 days before the change takes effect. Continued use after that date means you accept the updated terms." },
      { type: "h2", text: "Contact" },
      { type: "p", text: "Questions about these terms: [legal@runbolt.dev](mailto:legal@runbolt.dev)." },
    ],
  },

  dpa: {
    slug: "dpa",
    title: "Data Processing Addendum",
    updated: "2026-09-24",
    description:
      "How Runbolt acts as a processor for data that flows through your workflows: scope, security measures, sub-processors, and breach handling.",
    blocks: [
      { type: "p", text: "When your workflows process personal data, you are the controller and Runbolt is the processor. This addendum describes how we handle that role. It forms part of our agreement with you and applies automatically on paid plans; Enterprise customers may request a countersigned copy." },
      { type: "callout", kind: "note", text: "This is a plain-language summary of the addendum, not a substitute for legal review. Material changes will be announced before they take effect." },
      { type: "h2", text: "Scope of processing" },
      { type: "list", items: [
        "**Data categories** — whatever your workflows send: payloads delivered by triggers, values fetched from your systems, and the step inputs and outputs recorded for each run.",
        "**Purpose** — executing your workflows and providing the observability needed to debug them.",
        "**Duration** — for the life of your account, with execution payloads removed at the end of your plan's history window.",
      ] },
      { type: "p", text: "We process data only on your instructions — your workflow definitions are those instructions — and not for our own purposes." },
      { type: "h2", text: "Security measures" },
      { type: "list", items: [
        "Credentials encrypted at rest with **AES-256-GCM**.",
        "Role-based access control across workspaces: owner, admin, developer, viewer.",
        "SSRF protections on outbound workflow requests, blocking internal addresses and private ranges.",
        "Idempotency enforcement to prevent duplicate processing from double-fired triggers.",
        "Durable state in PostgreSQL with row-level locking during state transitions; ephemeral queues in Redis.",
        "Structured, access-controlled logs — treat log access as part of your own access model.",
      ] },
      { type: "h2", text: "Sub-processors" },
      { type: "p", text: "We rely on a short list of infrastructure providers for hosting, managed PostgreSQL, managed Redis, and transactional email. Each is bound by data-processing terms, and we review additions before they touch workflow data. You can request the current list at any time, and we will give notice before adding or replacing a sub-processor." },
      { type: "h2", text: "Data subject requests" },
      { type: "p", text: "If an individual whose data flows through your workflows exercises their rights, you handle the request as controller. Where the request requires action on our side — locating execution data, deleting a payload, extracting a run — we will assist without undue delay." },
      { type: "h2", text: "Security incidents" },
      { type: "p", text: "If we become aware of unauthorized access to workflow data, we will notify you without undue delay, describe what happened and what was affected, and keep you informed as we investigate. Security issues found by others are handled through our [responsible disclosure process](/security#disclosure)." },
      { type: "h2", text: "Return and deletion" },
      { type: "p", text: "On request or at account termination, we delete workflow and execution data within 30 days, except where law requires retention. Because workflow versions are immutable, deleting a workflow removes all of its versions and their execution history." },
      { type: "h2", text: "International transfers" },
      { type: "p", text: "Infrastructure may be located outside your jurisdiction. Transfers are safeguarded by the sub-processor's data-processing terms and, where applicable, standard contractual clauses. Contact us if your regulatory environment requires a specific region and we will discuss available options." },
      { type: "h2", text: "Contact" },
      { type: "p", text: "DPA questions and countersignature requests: [legal@runbolt.dev](mailto:legal@runbolt.dev)." },
    ],
  },
};

export const legalOrder = ["privacy", "terms", "dpa"] as const;
