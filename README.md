<div align="center">

<img src="https://img.shields.io/badge/runbolt-workflow%20execution%20platform-0f172a?style=for-the-badge&labelColor=0f172a&color=6366f1" alt="Runbolt" height="36"/>

# Runbolt

**Workflow Automation & Execution Platform**

*Reliable workflow execution infrastructure for developers and teams.*

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)

</div>

---

## What is Runbolt?

Runbolt is a **developer-first workflow automation platform** that provides the infrastructure to design, deploy, and reliably execute multi-step asynchronous processes.

It sits between simple job queues (BullMQ/Celery) and heavy enterprise engines (Temporal/Airflow) — giving you a **visual, composable layer** over robust async execution primitives, without the overhead.

```
[ TRIGGER ] → [ CONDITION ] → [ ACTION ]
                                    ↓
[ RESULT ] ←  [ WORKER ]  ← [ QUEUE ]
```

---

## The Problem

Modern applications outgrow their automation setups fast.

**Before Runbolt — Fragile & Scattered:**
```
GitHub Webhook → [ Custom Express Route ]
                        ↓
                 [ DB Update ] → (Fails randomly on timeout)
                        ↓
                 [ Cron Job ] → [ Custom Script ] → [ Discord Alert ]

→ Logs scattered across 4 systems. Failures require manual DB surgery.
```

**With Runbolt — Centralized & Observable:**
```
Trigger (GitHub) → [ Runbolt Execution Engine ]
                            ↓
                   [ BullMQ Queue ]
                            ↓
                   [ Worker Node ]
                            ↓
          [ Step: Transform ] → [ Step: Store ] → [ Step: Notify ]
                            ↓
               [ Centralized Execution History ]
```

---

## Core Features

### 🎨 Visual Workflow Builder
- Node-based drag-and-drop canvas powered by **Reactflow**
- Logical branching and conditional paths
- Dynamic data passing between nodes: `{{ steps.trigger.data.email }}`
- Pre-publish validation

### ⚙️ Deterministic Execution Engine
- DAG (Directed Acyclic Graph) resolution with strict state tracking
- Automatic retries with **exponential backoff** (2s → 4s → 8s)
- Dead-letter queue for permanently failed jobs
- Manual cancel and resume support

### 🔌 Triggers & Actions
| Type | Options |
|------|---------|
| **Triggers** | Webhook, Cron Schedule, Manual API Invocation |
| **Actions** | HTTP Request, PostgreSQL Query, Delay/Sleep, Data Transform, External Integrations |

### 🔍 Observability
- Step-level duration, input/output payloads, and full error traces
- Real-time execution visualization via **WebSockets**
- Structured logs with `execution_id`, `org_id`, and `node_id` on every line

### 🔐 Security
- API keys encrypted at rest with **AES-256-GCM**
- RBAC: Owner / Admin / Member / Viewer
- SSRF protection blocking requests to internal IPs and private CIDRs
- Idempotency keys to prevent duplicate webhook executions

---

## Real-World Use Cases

<details>
<summary><b>GitHub PR Automation</b></summary>

**Trigger:** PR Merged  
**Steps:** Fetch Jira ticket ID → Transition issue status → Send Discord notification

</details>

<details>
<summary><b>Stripe Webhook Processing</b></summary>

**Trigger:** `invoice.payment_failed`  
**Steps:** Query DB → Wait 24h → Send drip email → Update user status in PostgreSQL

</details>

<details>
<summary><b>Scheduled Database Sync</b></summary>

**Trigger:** Cron (daily at 2 AM)  
**Steps:** Fetch API data → Transform to CSV → Upload to S3

</details>

<details>
<summary><b>AI Content Pipeline</b></summary>

**Trigger:** Scheduled Job  
**Steps:** Fetch news RSS → Call Groq API (llama-3.3-70b) → Post to internal blog

</details>

<details>
<summary><b>User Onboarding</b></summary>

**Trigger:** API (User Created)  
**Steps:** Add to mailing list → Wait 3 days → Check activity → Send personalized follow-up

</details>

---

## Architecture

### System Overview

```
[ NEXT.JS ] ←── WebSockets ──→ [ WORKERS ]
     ↓                               ↓
[ NESTJS ] ←──── BullMQ ────→ [ REDIS QUEUE ]
     ↓                               ↓
[ POSTGRES ]               [ EXTERNAL APIs ]
```

### Infrastructure Layout

```
Internet → [ Nginx (TLS) ]
             ├── /api/*   → NestJS Container
             ├── /socket  → NestJS (WebSocket)
             └── /*       → Next.js Container

Internal: NestJS Worker ↔ Redis ↔ Postgres
```

### Data / Infrastructure Boundary

| Layer | Technology | Source of Truth? |
|-------|-----------|-----------------|
| Durable State | **PostgreSQL** — Users, Workflows, Executions, Credentials | ✅ Yes |
| Ephemeral Infrastructure | **Redis** — BullMQ queues, Pub/Sub, distributed locks | ❌ No |

### Concurrency & Safety
- `SELECT ... FOR UPDATE` locks during execution state transitions
- Idempotency keys prevent duplicate executions from double-firing webhooks
- Workflow versions are **immutable** — editing always creates a new version

---

## Database Schema

```sql
users             (id, email, password_hash)
organizations     (id, name)
workflows         (id, org_id, name, is_active)
workflow_versions (id, workflow_id, definition_jsonb, published_at)
executions        (id, version_id, status, started_at, completed_at)
execution_steps   (id, execution_id, node_id, status, input_json, output_json, error)
credentials       (id, org_id, service, encrypted_token)
webhooks          (id, workflow_id, secret, path)
```

---

## API Surface

```http
POST   /workflows                      # Create workflow
POST   /workflows/:id/versions         # Draft new version
POST   /workflows/:id/publish          # Lock & deploy version
POST   /webhooks/:path                 # Trigger execution
GET    /executions?workflowId=:id      # List runs
POST   /executions/:id/retry           # Retry failed execution
GET    /executions/:id/logs            # Stream step logs
```

---

## Repository Structure

```
/apps
  /api        → NestJS (Modular Monolith)
  /web        → Next.js Dashboard
  /worker     → Node.js / BullMQ Executor
/packages
  /shared-types → Zod schemas & shared interfaces
/infrastructure
  docker-compose.yml
  nginx.conf
```

### NestJS Module Breakdown

```
src/modules/
  ├── auth/           JWT, sessions, guards
  ├── organizations/  Tenancy boundaries
  ├── workflows/      CRUD & versioning logic
  ├── executions/     Orchestration API
  ├── integrations/   Adapters (GitHub, Slack, etc.)
  └── workers/        BullMQ processors
```

---

## Tech Stack

| Domain | Tools |
|--------|-------|
| **Frontend** | Next.js, Tailwind CSS, Reactflow, Zustand, TanStack Query |
| **Backend** | NestJS (TypeScript), Zod |
| **Database** | PostgreSQL + Prisma, JSONB for payloads |
| **Queue / Cache** | Redis + BullMQ |
| **Real-Time** | Socket.IO |
| **AI** | Groq API (llama-3.3-70b-versatile) |
| **Observability** | Pino (structured logging) |
| **Infrastructure** | Docker, Docker Compose, Nginx |

---

## Development Roadmap

| Phase | Milestone | Status |
|-------|-----------|--------|
| 0 | Architecture, Docker Compose, DB schema | ✅ |
| 1 | NestJS/Next.js skeleton, JWT auth, RBAC | 🔄 |
| 2 | Workflow CRUD & version immutability | ⏳ |
| 3 | Reactflow canvas — drag, connect, save | ⏳ |
| 4 | Redis + BullMQ integration | ⏳ |
| 5 | **Execution Engine — DAG parsing & step tracking** | ⏳ |
| 6 | Failure handling, exponential backoff, DLQ | ⏳ |
| 7 | Dynamic webhook URLs & payload mapping | ⏳ |
| 8 | Real-time monitoring via WebSockets | ⏳ |
| 9 | Encrypted credential vault, SSRF protection | ⏳ |
| 10 | App integrations (Slack, GitHub, Postgres) | ⏳ |
| 11 | Cron scheduling via Redis delayed jobs | ⏳ |
| 12 | Groq AI — NL to workflow, error analysis | ⏳ |
| 13 | Observability, metrics, audit trail | ⏳ |
| 14 | Integration & chaos testing | ⏳ |
| 15 | Production Docker + Nginx deployment | ⏳ |

---

## MVP Definition

Runbolt reaches MVP when:

- [x] Users can visually connect a Webhook Trigger → HTTP Action
- [x] Webhooks reliably create Executions and run jobs via BullMQ
- [x] Execution state is tracked in PostgreSQL and visible in the UI
- [x] API keys are AES-256 encrypted at rest

---

## Engineering Challenges

This project goes well beyond standard CRUD. The core challenges:

**State Machine Safety** — Transitioning executions between `RUNNING → FAILED → RETRYING` without race conditions when workers crash mid-job, solved with `SELECT FOR UPDATE` in PostgreSQL.

**Idempotency at Scale** — A "Retry" click or a double-fired webhook must never charge a card twice. Handled via payload hashing and idempotency key enforcement.

**Observability Volume** — A 20-step workflow running thousands of times per day generates enormous telemetry. Mitigation involves batching logs and planning for a time-series DB in V3.

---

## Why Runbolt?

> Most CRUD apps just write to a database. Runbolt is **infrastructure**.

It demonstrates: distributed systems, message queues, async orchestration, concurrency control, encryption, and security engineering — the skills that separate engineers who build apps from engineers who build **platforms other developers rely on**.

---

<div align="center">

Built with precision by [Mahdyar Shirzad](https://github.com/MahdiarShirzad)

</div>