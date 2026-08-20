# Backend Conventions

Generic backend coding conventions. Follow unless project-specific docs or implemented patterns override.

---

## Core Technology Principles

- Use a structured API framework with module boundaries and DI (e.g. NestJS, Fastify, Spring Boot)
- Use framework conventions: modules, controllers, services, guards, interceptors, pipes, DTOs
- All persistence logic goes through repositories — never directly in controllers
- If a data model reference exists, treat it as source of truth for entities, relationships, and naming
- Use static typing for: request/response contracts, domain models, repository interfaces, config objects

---

## Architecture

### Layered Architecture

```text
controller → service → repository → model
```

| Layer | Responsibility |
|-------|----------------|
| Controller | HTTP transport: parse input, call services, map responses |
| Service | Business logic, cross-entity validation, workflow orchestration |
| Repository | Queries, transactions, persistence details |
| Model/Schema | Structure, constraints, indexes |

- Controllers may use multiple services; services may use multiple repositories
- Controllers must not contain business rules or direct database access
- Define explicit interfaces for repositories, integration providers, and complex domain services

### Feature Modules

```text
src/modules/<feature>/
  controllers/
  dto/
  schemas/
  repositories/
  services/
  interfaces/
  mappers/
  <feature>.module.ts
```

### Shared Infrastructure

```text
src/
  common/ (interceptors, filters, guards, decorators, pipes, utils, constants)
  config/
  database/
  integrations/
  modules/
```

### Separation of Concerns

- **Transport** — routing, status codes, serialization
- **Domain** — rules, invariants, workflows
- **Persistence** — queries, indexes, transactions
- **Integration** — external APIs, queues, storage, email, AI providers

---

## Controller Rules

- Transport-only: receive requests, parse params/query/body, call services, return response DTOs
- Never implement business rules, build queries, or call third-party SDKs directly
- Use DTOs for: create body, update body, list query filters, route params
- Validate at the boundary — reject invalid input before it reaches services
- Use consistent response shapes across the API
- Paginated list format: `{ data: T[], total, page, limit }` (see `royascaff/engine/conventions.md`)
- For selector endpoints: return minimal projections (id, label, needed fields only)

### REST Defaults

- `GET /resources` — paginated list with filters/sorting
- `GET /resources/lite` — minimal list for selectors
- `GET /resources/:id` — full details
- `POST /resources` — create
- `PUT/PATCH /resources/:id` — update
- `DELETE /resources/:id` — delete
- Workflow actions: `POST /resources/:id/<action>` — name by intent (`approve`, `publish`, `upload`)

---

## Service Rules

- All domain rules live in services: lifecycle, state transitions, cross-entity validation, calculations, orchestration
- The backend is the source of truth — never rely on frontend calculations
- Services orchestrate; repositories persist — no low-level query syntax or vendor SDK details in services
- Design with constructor injection for testability (mock repos and integrations)
- For operations with external side effects: design for safe retries/idempotency where needed

---

## Repository Rules

- Own all data access: CRUD, filtered/paginated queries, lite projections, relation loading, transactions
- Hide persistence details — services must not depend on ORM-specific APIs
- List methods support (where appropriate): pagination, sorting, filtering, text search, date ranges, relation filters
- Define indexes for frequent filters, sorts, and unique constraints

---

## Schema and Data Model Rules

- One schema per aggregate/collection/table, close to the owning feature module
- Enable `createdAt`/`updatedAt` on persistent entities
- Use enums for statuses, roles, categories, and fixed vocabularies
- Snapshot historical values on transactional records when referenced data can change (pricing, names)
- Store metadata in DB, binaries in object storage — no large payloads in primary documents

---

## Validation

- Validate at API boundary and again in services for cross-field/domain rules
- Cover: required fields, types/formats, enums, numeric ranges, string lengths, safe query params, ID format
- Return clear field-level errors for client-facing validation failures

---

## Security

- **Auth**: support login, registration, password reset, token refresh as needed; use JWT/session cookies/OAuth
- **Authorization**: protect APIs by default; public routes must be explicit and minimal; use role/permission checks at service/guard layer
- **Secrets**: never hardcode; read from env/secrets manager; validate at startup; support rotation
- **Passwords**: never store plain-text; use bcrypt/argon2; never log passwords/tokens
- **Input safety**: validate/sanitize all input; parameterize queries; enforce size limits; validate upload content types
- **Output safety**: no stack traces/internal paths to clients; avoid over-fetching sensitive fields; redact PII
- **Transport**: HTTPS only in prod; secure cookie flags; explicit CORS (never `*` with credentials); security headers; rate-limit auth endpoints
- **Dependencies**: keep updated; scan for vulnerabilities in CI

---

## Performance

- Paginate all list endpoints — never unbounded result sets
- Use projection/lite queries for selectors and dashboards
- Avoid N+1 queries — use joins, populate, or batch loading
- Cache read-heavy slow-changing data with explicit invalidation
- Index fields used in filters, sorts, unique constraints
- Prefer cursor-based pagination for very large datasets
- Use transactions only where consistency requires them
- Offload heavy reporting to read replicas or async jobs
- Move slow/unreliable work off request path (email, file processing, reports, webhooks, AI inference) — use queues with retries, dead-letter, idempotency
- External calls: set timeouts, retry with backoff where safe, circuit-break on failure
- Stream large uploads/downloads; compress responses; store large files in object storage
- Measure before optimizing — track latency, error rate, throughput per endpoint

---

## Third-Party Integrations

- **Adapter pattern**: provider service (wraps vendor SDK) + domain service (orchestrates business use)
- Group by capability: `integrations/{storage,mail,messaging,payments,ai,webhooks}/`
- No direct SDK calls from controllers — all through services or integration providers
- Credentials/endpoints from config — never code constants

---

## Configuration and Environment

- Centralize in a dedicated config module: typed `config.ts` + `env.validation.ts` for startup validation
- Categories: database, auth secrets, port/URL, storage, email, AI, feature flags
- Fail fast at startup on missing critical config
- Use feature flags for incomplete/risky features instead of scattered env checks

---

## Error Handling

| Status | Use for |
|--------|---------|
| `400` | Validation failures, malformed input |
| `401` | Missing/invalid authentication |
| `403` | Authenticated but not authorized |
| `404` | Resource not found |
| `409` | Conflict (unique constraint, invalid state transition) |
| `422` | Semantically invalid but well-formed input |
| `429` | Rate limit exceeded |
| `500` | Unexpected server errors |

- Use global exception filters/middleware — not repetitive try/catch per controller
- Return consistent error shape: `{ success: false, message, statusCode, error?, errors?: [{ field, message }] }` (see `royascaff/engine/conventions.md`)
- Log full details server-side; return safe messages to clients

---

## Logging and Observability

- Structured logging (JSON/key-value): auth events, entity changes, integration failures, job outcomes, slow requests
- Propagate correlation/request ID through logs and downstream calls
- Expose: liveness/readiness endpoints, dependency health, metrics (latency, error rate, queue depth)
- Never log: passwords, tokens, credit cards, government IDs, unnecessary PII

---

## Testing

- **Unit tests**: services with mocked repos/integrations — focus on rules, edge cases, state transitions
- **Integration tests**: repositories against real/in-memory DB when query correctness matters
- **E2E tests**: auth flows, main CRUD, permission boundaries, workflow endpoints
- Co-locate or mirror source structure; name tests by behavior

---

## Naming

- Singular class names; plural route names (REST convention)
- DTOs: `Create<Entity>Dto`, `Update<Entity>Dto`, `List<Entity>QueryDto`
- Repositories: `<Entity>Repository`
- Services: `<Entity>Service`, `<Domain>Service` for cross-cutting logic
- Module names aligned with business capabilities, not UI page names

---

## Do Not

- Put business logic in controllers
- Access database/ORM directly from controllers
- Hardcode secrets, URLs, or environment-specific values
- Couple domain services to vendor SDKs
- Treat frontend calculations as source of truth
- Skip input validation
- Create god-services mixing unrelated domains
- Return unbounded lists or load unbounded relations
- Log secrets or sensitive personal data
