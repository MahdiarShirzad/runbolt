import { getDocMeta, type DocMeta } from "./registry";

/**
 * Documentation content model. Articles are lists of typed blocks so the
 * renderer stays decoupled from the source — swap this static module for a
 * real docs source later without touching UI components.
 */

export type CalloutKind = "note" | "tip" | "warning" | "important";

export type CodeLanguage = "ts" | "js" | "json" | "bash" | "python" | "go";

export interface ApiParam {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

export interface ApiEndpointDoc {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  params?: ApiParam[];
  request?: string;
  response?: string;
}

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; language: CodeLanguage; title?: string; code: string; lineNumbers?: boolean }
  | { type: "callout"; kind: CalloutKind; text: string }
  | { type: "ui"; variant: "builder" | "run" }
  | { type: "endpoints"; endpoints: ApiEndpointDoc[] };

export interface DocContent {
  meta: DocMeta;
  blocks: Block[];
}

function page(slug: string, blocks: Block[]): DocContent {
  const docMeta = getDocMeta(slug);
  if (!docMeta) throw new Error(`Unknown doc slug: ${slug}`);
  return { meta: docMeta, blocks };
}

export const docPages: Record<string, DocContent> = Object.fromEntries(
  [
    page("getting-started", [
      { type: "p", text: "Build your first Runbolt workflow in a few minutes. This guide takes you from an empty canvas to a running, observable pipeline that receives a webhook, calls an API, and writes to a database." },
      { type: "h2", text: "Overview" },
      { type: "p", text: "A workflow in Runbolt is a graph of nodes. Each node does one thing — receive an event, make a request, transform data, write to a database, or run a job. Nodes are connected into execution paths, and every run of the graph is recorded as an execution you can inspect." },
      { type: "callout", kind: "note", text: "Workflows are versioned automatically when deployed. You can always roll back to a previous version from the deployment history." },
      { type: "h2", text: "Create a workflow" },
      { type: "p", text: "From the dashboard, choose **New workflow** and give it a slug. The slug is how you reference the workflow from the API and CLI, so pick something stable:" },
      { type: "code", language: "bash", title: "terminal", code: "$ runbolt workflows create order-fulfillment\n✓ Created workflow order-fulfillment (v1)" },
      { type: "ui", variant: "builder" },
      { type: "h2", text: "Add a trigger" },
      { type: "p", text: "Every workflow starts with a trigger. For this guide, add a **Webhook** node — it exposes a URL that starts an execution whenever it receives a request." },
      { type: "list", items: ["Drag a Webhook node onto the canvas.", "Set the path to `/hooks/orders`.", "Copy the generated URL — you will need it to test the workflow."] },
      { type: "h2", text: "Add an HTTP node" },
      { type: "p", text: "Next, add an **HTTP Request** node and connect it after the trigger. Point it at the API you want to call. The response body is available to downstream nodes as `http.body`." },
      { type: "code", language: "json", title: "http node · config", code: "{\n  \"method\": \"POST\",\n  \"url\": \"https://api.stripe.com/v1/charges\",\n  \"headers\": {\n    \"Authorization\": \"Bearer {{ secrets.STRIPE_KEY }}\"\n  },\n  \"retry\": {\n    \"maxAttempts\": 3,\n    \"backoff\": \"exponential\"\n  }\n}" },
      { type: "h2", text: "Add a database node" },
      { type: "p", text: "Add a **Database** node to persist the result. Database nodes take a connection from your workspace secrets and run a parameterized query — outputs are mapped from upstream nodes with the expression editor." },
      { type: "code", language: "json", title: "database node · config", code: "{\n  \"connection\": \"postgres-primary\",\n  \"query\": \"INSERT INTO orders (id, total, status) VALUES ($1, $2, $3)\",\n  \"params\": [\"{{ http.body.id }}\", \"{{ http.body.total }}\", \"'pending'\"]\n}" },
      { type: "h2", text: "Run the workflow" },
      { type: "p", text: "Deploy the workflow, then trigger it. You can send a request to the webhook URL, press **Run** in the builder, or use the CLI:" },
      { type: "code", language: "bash", title: "terminal", code: "$ runbolt deploy\n✓ Deployed order-fulfillment (v1)\n$ runbolt run order-fulfillment --input '{\"orderId\":\"ord_48213\"}'\n→ run_9f2ac1e7 created" },
      { type: "ui", variant: "run" },
      { type: "h2", text: "Inspect the execution" },
      { type: "p", text: "Open the run to see each node's status, duration, logs, and output. If a node fails, the execution shows the failing step, the error, and the retry history." },
      { type: "code", language: "json", title: "GET /v1/executions/run_9f2ac1e7", code: "{\n  \"id\": \"run_9f2ac1e7\",\n  \"workflow\": \"order-fulfillment\",\n  \"status\": \"success\",\n  \"steps\": [\n    { \"name\": \"webhook\", \"status\": \"success\", \"duration_ms\": 18 },\n    { \"name\": \"charge-card\", \"status\": \"success\", \"duration_ms\": 171 },\n    { \"name\": \"persist-order\", \"status\": \"success\", \"duration_ms\": 94 }\n  ]\n}" },
      { type: "h2", text: "Next steps" },
      { type: "list", items: ["Learn the [core concepts](/docs/core-concepts) behind workflows, nodes, and executions.", "Add [workers](/docs/workers) for long-running jobs.", "Trigger workflows from code with the [API](/docs/api) or an [SDK](/docs/sdks)."] },
    ]),

    page("core-concepts", [
      { type: "p", text: "Runbolt is built around a small set of concepts that compose into everything else. Understanding these five makes the rest of the documentation straightforward." },
      { type: "h2", text: "Workflows" },
      { type: "p", text: "A workflow is a versioned graph of nodes that describes an automation. Workflows are defined visually in the builder or in code, deployed to an environment, and triggered by events or API calls. See [Workflows](/docs/workflows)." },
      { type: "h2", text: "Nodes" },
      { type: "p", text: "Nodes are the building blocks — a trigger, an HTTP call, a condition, a transformation, a database query, a worker job. Each node has a typed configuration and produces a typed output that downstream nodes can reference. See [Nodes](/docs/nodes)." },
      { type: "h2", text: "Triggers" },
      { type: "p", text: "Triggers start executions. Runbolt supports webhooks, schedules, queues, and explicit API triggers. A workflow can have exactly one entry trigger; fan-out happens through nodes, not multiple triggers." },
      { type: "h2", text: "Executions" },
      { type: "p", text: "Every run of a workflow is an execution with a stable ID, a state machine (`queued → running → succeeded | failed`), per-step timing, logs, and outputs. Executions are immutable and queryable. See [Executions](/docs/executions)." },
      { type: "h2", text: "Workers" },
      { type: "p", text: "Workers execute long-running or resource-intensive jobs outside the request path. Jobs are placed on managed queues with retries and backpressure. See [Workers](/docs/workers)." },
      { type: "code", language: "ts", title: "example.ts", lineNumbers: true, code: "const run = await runbolt.workflows.execute({\n  workflowId: \"order-fulfillment\",\n  input: { orderId: \"ord_48213\" },\n});\n\nconsole.log(run.id); // run_9f2ac1e7" },
      { type: "callout", kind: "tip", text: "Use execution logs to debug individual nodes — each step records its own stdout, timing, and output." },
    ]),

    page("workflows", [
      { type: "p", text: "A workflow is a graph of nodes with a single trigger. This page covers creating, structuring, and versioning workflows." },
      { type: "h2", text: "Creating workflows" },
      { type: "p", text: "Create workflows in the visual builder or from the CLI. The builder is the fastest way to explore; the CLI fits code review and CI pipelines." },
      { type: "code", language: "bash", title: "terminal", code: "$ runbolt workflows create customer-sync\n$ runbolt workflows list\nNAME             VERSION  UPDATED\ncustomer-sync    v3       2h ago\norder-fulfillment v42     3d ago" },
      { type: "h2", text: "Structuring execution paths" },
      { type: "p", text: "Connect nodes to define the path an execution takes. **Condition** nodes branch the graph — each branch is followed only when its expression evaluates to true. Every path should terminate in a terminal state; runs that end without one are marked `failed`." },
      { type: "h2", text: "Versions" },
      { type: "p", text: "Each deploy produces an immutable version. Running executions keep the version they started on, so deploys never corrupt in-flight work." },
      { type: "callout", kind: "note", text: "Workflows are versioned automatically when deployed. Roll back from the deployment history at any time." },
      { type: "h2", text: "Organizing workflows" },
      { type: "p", text: "Use environments to separate development from production. Promote a version from staging to production once it has run clean in staging." },
      { type: "code", language: "bash", title: "terminal", code: "$ runbolt deploy --env staging\n✓ Deployed customer-sync (v4) to staging\n$ runbolt promote customer-sync --from staging --to production\n✓ Promoted customer-sync v4 → production" },
    ]),

    page("nodes", [
      { type: "p", text: "Nodes are the building blocks of workflows. Each node has a type, a configuration, and a typed output." },
      { type: "h2", text: "Node types" },
      { type: "list", items: ["**Trigger** — starts executions: webhooks, schedules, queues.", "**HTTP** — calls REST or GraphQL endpoints with retries.", "**Condition** — branches the graph on expressions.", "**Transform** — maps, filters, and reshapes data between steps.", "**Database** — queries and writes to SQL databases.", "**Worker** — offloads jobs to managed queues.", "**Delay** — pauses runs for a duration or until a date."] },
      { type: "h2", text: "Configuring nodes" },
      { type: "p", text: "Select a node to open the inspector. Configuration accepts static values and expressions. Expressions reference upstream outputs and workspace secrets:" },
      { type: "code", language: "json", title: "node config", code: "{\n  \"url\": \"https://api.example.com/customers\",\n  \"headers\": {\n    \"Authorization\": \"Bearer {{ secrets.CRM_TOKEN }}\"\n  },\n  \"body\": {\n    \"customerId\": \"{{ trigger.body.customerId }}\"\n  }\n}" },
      { type: "h2", text: "Node outputs" },
      { type: "p", text: "Every node writes its result to the execution context. Downstream nodes reference outputs with dot paths — `http.status`, `db.rows`, `transform.value` — and the inspector shows the exact output of each node for a given run." },
      { type: "callout", kind: "tip", text: "Use execution logs to debug individual nodes. Each step's output is recorded on the execution, so you never guess what a node received." },
    ]),

    page("executions", [
      { type: "p", text: "An execution is one run of a workflow. Executions are immutable, observable records — the unit you debug, audit, and alert on." },
      { type: "h2", text: "Lifecycle" },
      { type: "p", text: "Executions move through a small state machine:" },
      { type: "list", items: ["`queued` — accepted, waiting for capacity.", "`running` — actively executing steps.", "`succeeded` — every path reached a terminal state.", "`failed` — a step exhausted its retries or the run hit a deadline.", "`cancelled` — stopped by a user or policy."] },
      { type: "h2", text: "Inspecting executions" },
      { type: "p", text: "Query an execution by ID to get its status, steps, and output. The dashboard shows the same data with logs attached to each step." },
      { type: "code", language: "json", title: "GET /v1/executions/:id", code: "{\n  \"id\": \"run_7c31aa92\",\n  \"workflow\": \"customer-sync\",\n  \"status\": \"running\",\n  \"steps\": [\n    { \"name\": \"validate\", \"status\": \"success\", \"duration_ms\": 8 },\n    { \"name\": \"http.sync\", \"status\": \"success\", \"duration_ms\": 204 },\n    { \"name\": \"db.upsert\", \"status\": \"running\" }\n  ],\n  \"retries\": 1,\n  \"started_at\": \"2026-09-22T12:31:04Z\"\n}" },
      { type: "h2", text: "Retention" },
      { type: "p", text: "Execution history is retained per plan — 7 days on Developer, 90 days on Team, custom retention on Enterprise. Export executions to your own storage for longer horizons." },
      { type: "callout", kind: "tip", text: "Use execution logs to debug individual nodes — filter by status to jump straight to failed steps." },
    ]),

    page("workers", [
      { type: "p", text: "Workers run long-running and resource-intensive jobs on managed queues, off the request path." },
      { type: "h2", text: "Queues" },
      { type: "p", text: "Each workflow can enqueue jobs onto a named queue. Queues provide ordering within a concurrency group and backpressure under load. Jobs survive restarts — a worker crash never loses work." },
      { type: "code", language: "json", title: "worker node · config", code: "{\n  \"queue\": \"fulfillment\",\n  \"concurrency\": 10,\n  \"job\": {\n    \"type\": \"fulfill.order\",\n    \"payload\": \"{{ db.order }}\"\n  }\n}" },
      { type: "h2", text: "Retries and backoff" },
      { type: "p", text: "Configure retry policy per node. Failed attempts are recorded on the execution with their error and duration." },
      { type: "code", language: "json", title: "retry policy", code: "{\n  \"retry\": {\n    \"maxAttempts\": 5,\n    \"backoff\": \"exponential\",\n    \"initialDelay\": \"2s\",\n    \"maxDelay\": \"5m\"\n  }\n}" },
      { type: "callout", kind: "warning", text: "Production workflows should define retry and timeout policies. Without them, a failing dependency fails the whole run on first error." },
      { type: "h2", text: "Idempotency" },
      { type: "p", text: "Because retries re-run jobs, worker jobs should be idempotent. Pass an idempotency key when the job performs side effects — Runbolt deduplicates on the key." },
    ]),

    page("webhooks", [
      { type: "p", text: "Webhook nodes expose a URL that starts an execution whenever an external service sends an event." },
      { type: "h2", text: "Receiving events" },
      { type: "p", text: "Every webhook node gets a stable URL per environment. Requests are accepted, queued, and acknowledged quickly — slow downstream processing never times out the caller." },
      { type: "code", language: "bash", title: "terminal", code: "$ curl -X POST https://hooks.runbolt.dev/wf/order-fulfillment \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"orderId\": \"ord_48213\"}'\n{\"runId\": \"run_9f2ac1e7\"}" },
      { type: "h2", text: "Verifying senders" },
      { type: "p", text: "Verify webhook signatures before trusting a payload. Runbolt validates HMAC signatures for you, or you can verify inside the workflow:" },
      { type: "code", language: "ts", title: "verify.ts", lineNumbers: true, code: "import { verifySignature } from \"@runbolt/sdk\";\n\nif (!verifySignature(trigger.headers, trigger.rawBody, secret)) {\n  throw new Error(\"invalid signature\");\n}" },
      { type: "callout", kind: "important", text: "Secrets should never be committed to workflow configuration. Reference them with `{{ secrets.NAME }}` and manage values in workspace settings." },
      { type: "h2", text: "Responding" },
      { type: "p", text: "Webhook nodes can return a synchronous response with a status code and body, or acknowledge immediately and deliver results later via a webhook out node." },
    ]),

    page("integrations", [
      { type: "p", text: "Integrations connect Runbolt to the services you already use — databases, payment providers, CRMs, and messaging tools." },
      { type: "h2", text: "Using integrations" },
      { type: "p", text: "Add an integration from the node picker. Integrations are pre-configured HTTP or database nodes with typed actions and credential handling built in." },
      { type: "h2", text: "Available integrations" },
      { type: "list", items: ["PostgreSQL, MySQL — database nodes with parameterized queries.", "Stripe — charges, customers, and webhooks.", "Slack — messages and alerts.", "GitHub — issues, releases, and CI events.", "Any HTTP API — via the generic HTTP node."] },
      { type: "h2", text: "Custom integrations" },
      { type: "p", text: "When a first-class integration does not exist, compose one from HTTP and transform nodes, or wrap it in a worker job. Anything reachable over HTTP is automatable." },
      { type: "callout", kind: "tip", text: "Store integration credentials as workspace secrets and reference them with `{{ secrets.NAME }}` — never inline them in node configuration." },
    ]),

    page("api", [
      { type: "p", text: "The Runbolt API is a REST API over HTTPS. It uses resource-oriented URLs, JSON bodies, and standard HTTP status codes." },
      { type: "h2", text: "Authentication" },
      { type: "p", text: "Authenticate with a bearer token from workspace settings. Tokens are scoped to a workspace and environment." },
      { type: "code", language: "bash", title: "terminal", code: "$ curl https://api.runbolt.dev/v1/workflows \\\n  -H \"Authorization: Bearer $RUNBOLT_KEY\"" },
      { type: "h2", text: "Endpoints" },
      {
        type: "endpoints",
        endpoints: [
          {
            method: "GET",
            path: "/v1/workflows",
            description: "List workflows in the workspace.",
            params: [
              { name: "limit", type: "integer", description: "Page size, 1–100. Defaults to 20." },
              { name: "cursor", type: "string", description: "Pagination cursor from a previous response." },
            ],
            response: "{\n  \"data\": [\n    { \"id\": \"wf_9f2ac1\", \"slug\": \"order-fulfillment\", \"version\": 42 }\n  ],\n  \"next_cursor\": null\n}",
          },
          {
            method: "POST",
            path: "/v1/workflows",
            description: "Create a workflow.",
            request: "{\n  \"slug\": \"customer-sync\",\n  \"graph\": { \"nodes\": [], \"edges\": [] }\n}",
            response: "{\n  \"id\": \"wf_7c31aa\",\n  \"slug\": \"customer-sync\",\n  \"version\": 1\n}",
          },
          {
            method: "GET",
            path: "/v1/workflows/:id",
            description: "Retrieve a workflow and its current version.",
            response: "{\n  \"id\": \"wf_7c31aa\",\n  \"slug\": \"customer-sync\",\n  \"version\": 12,\n  \"updated_at\": \"2026-09-22T10:14:00Z\"\n}",
          },
          {
            method: "POST",
            path: "/v1/workflows/:id/execute",
            description: "Trigger an execution of the workflow.",
            params: [
              { name: "input", type: "object", description: "Payload available to the workflow as `trigger.body`.", required: true },
              { name: "idempotency_key", type: "string", description: "Deduplicates triggers with the same key." },
            ],
            request: "{\n  \"input\": { \"customerId\": \"cus_123\" },\n  \"idempotency_key\": \"cus_123:sync\"\n}",
            response: "{\n  \"id\": \"run_7c31aa92\",\n  \"status\": \"queued\"\n}",
          },
          {
            method: "GET",
            path: "/v1/executions/:id",
            description: "Retrieve an execution, its steps, and output.",
            response: "{\n  \"id\": \"run_7c31aa92\",\n  \"workflow\": \"customer-sync\",\n  \"status\": \"success\",\n  \"steps\": [\n    { \"name\": \"validate\", \"status\": \"success\", \"duration_ms\": 8 }\n  ]\n}",
          },
        ],
      },
      { type: "h2", text: "Errors" },
      { type: "p", text: "Errors return a JSON body with a stable `code` and a human-readable message. HTTP status follows convention: `400` for invalid requests, `401` for bad auth, `429` for rate limits." },
      { type: "code", language: "json", title: "error response", code: "{\n  \"error\": {\n    \"code\": \"invalid_request\",\n    \"message\": \"input must be an object\"\n  }\n}" },
      { type: "h2", text: "Rate limits" },
      { type: "p", text: "API requests are rate limited per workspace. Responses include `X-RateLimit-Remaining`; when exhausted, retry with exponential backoff and respect `Retry-After`." },
    ]),

    page("sdks", [
      { type: "p", text: "SDKs wrap the REST API with typed clients, retries, and auth handling. They are the recommended way to trigger and observe workflows from application code." },
      { type: "h2", text: "Installation" },
      { type: "code", language: "bash", title: "terminal", code: "$ npm install @runbolt/sdk" },
      { type: "h2", text: "TypeScript" },
      { type: "code", language: "ts", title: "customer-sync.ts", lineNumbers: true, code: "import { Runbolt } from \"@runbolt/sdk\";\n\nconst runbolt = new Runbolt({ apiKey: process.env.RUNBOLT_KEY });\n\nconst workflow = await runbolt.workflows.execute({\n  workflowId: \"customer-sync\",\n  input: {\n    customerId: \"cus_123\",\n  },\n});\n\nconsole.log(workflow.id); // run_7c31aa92" },
      { type: "h2", text: "Python" },
      { type: "code", language: "python", title: "main.py", lineNumbers: true, code: "from runbolt import Runbolt\n\nclient = Runbolt(api_key=os.environ[\"RUNBOLT_KEY\"])\n\nrun = client.workflows.execute(\n    workflow_id=\"customer-sync\",\n    input={\"customerId\": \"cus_123\"},\n)\nprint(run.id)" },
      { type: "h2", text: "Waiting for completion" },
      { type: "p", text: "All SDKs can await an execution's terminal state, which is useful for short workflows invoked from request handlers or tests:" },
      { type: "code", language: "ts", title: "await.ts", code: "const result = await runbolt.executions.wait(run.id, { timeout: \"60s\" });\nconsole.log(result.status); // success" },
      { type: "callout", kind: "note", text: "SDKs read the base URL and API key from `RUNBOLT_BASE_URL` and `RUNBOLT_KEY` when not passed explicitly." },
    ]),

    page("deployment", [
      { type: "p", text: "Deployment moves workflow versions between environments — from local development to staging to production." },
      { type: "h2", text: "Environments" },
      { type: "p", text: "Every workspace has `development`, `staging`, and `production` environments. Each environment resolves its own secrets and webhook URLs, so the same workflow runs everywhere without edits." },
      { type: "h2", text: "Deploying with the CLI" },
      { type: "code", language: "bash", title: "terminal", code: "$ runbolt deploy --env staging\n✓ Compiled 12 workflows in 1.8s\n✓ Deployed order-fulfillment (v43) to staging\n✓ Deployed customer-sync (v13) to staging" },
      { type: "h2", text: "Promoting versions" },
      { type: "p", text: "Promotion copies an exact version to the target environment. Because versions are immutable, what you tested is what ships." },
      { type: "code", language: "bash", title: "terminal", code: "$ runbolt promote order-fulfillment --from staging --to production\n✓ Promoted order-fulfillment v43 → production" },
      { type: "callout", kind: "note", text: "Workflows are versioned automatically when deployed. In-flight executions always finish on the version they started with." },
      { type: "h2", text: "CI integration" },
      { type: "p", text: "Run `runbolt deploy` from CI with a machine token scoped to the target environment. Deploys are atomic — a version is live for all new executions or not at all." },
    ]),

    page("troubleshooting", [
      { type: "p", text: "Most issues fall into a few recognizable patterns. Start from the execution — its steps, logs, and errors usually point at the cause." },
      { type: "h2", text: "Common errors" },
      { type: "list", items: ["`UPSTREAM_TIMEOUT` — a dependency did not respond in time. Check the step's duration and add a retry policy or raise the timeout.", "`SIGNATURE_MISMATCH` — a webhook failed verification. Confirm the signing secret matches the sender's configured secret.", "`SECRET_NOT_FOUND` — a `{{ secrets.* }}` reference has no value in this environment.", "`DEADLOCK_DETECTED` — the database node hit a lock conflict. Retries usually resolve it; serialize writes if it recurs.", "`DEADLINE_EXCEEDED` — the run exceeded its per-run timeout. Break the work into worker jobs."] },
      { type: "h2", text: "Diagnosing a failing run" },
      { type: "p", text: "Open the execution, find the first failed step, and read its logs. Steps before the failure succeeded and their outputs are recorded — compare the input the step received against what you expected." },
      { type: "h2", text: "Runs stuck in queued" },
      { type: "p", text: "Queued runs wait for worker capacity. If a queue's concurrency is saturated, raise it or check for long-running jobs holding slots." },
      { type: "h2", text: "Getting help" },
      { type: "p", text: "If an execution fails in a way this page does not describe, reach out with the execution ID — support can see the same trace you can." },
    ]),
  ].map((p) => [p.meta.slug, p]),
);
