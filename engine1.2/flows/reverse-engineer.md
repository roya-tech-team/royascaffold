# AI-Control Engine — Reverse-Engineer Flow (Phase R)

## Overview

This flow **reverse-engineers an existing or legacy codebase** and auto-generates the full set of
`project/` blueprint documents. It is the onboarding counterpart to `royascaff/engine/flows/initial-build.md`:
where Phases 0–4 assume you are *describing* a new application, this flow *reads* the code that already
exists and produces the same artifacts.

**When to use this flow**:
- An existing codebase has no `project/` blueprint yet.
- A legacy system is being onboarded into the AI-Control framework.
- A team inherits a codebase and needs full documentation before making changes.

**Relationship to other flows**:
- This flow produces the same `project/` artifacts that Phases 0–4 of `royascaff/engine/flows/initial-build.md`
  would produce, **plus** `plan/roles-and-authorization.md` (which initial-build does not generate
  separately — reverse-engineering adds it because auth patterns can be extracted from existing code):
  `profile.md`, `description.md`, `plan/modules.md` (includes features), `plan/data-model.md`,
  `plan/roles-and-authorization.md`,
  `actions/<api-app>/services/<module>.md` + `_index.md`,
  `actions/<api-app>/endpoints/<module>.md` + `_index.md`,
  `actions/<web-app>/pages/<module>.md`, and `rules.md`.
- After completion, use **Phase 5** (`royascaff/engine/flows/change-mode.md`) or **Phase 6**
  (`royascaff/engine/flows/bug-fix.md`) for all future work. No need to re-run this flow.
- This flow does **not** generate code or run the standard verification (those apply to greenfield
  builds). Instead, Phase R.3 runs a **drift analysis** that validates the generated blueprint against
  the actual code.

**Key references** (load on every step that generates specs):
- **`royascaff/engine/conventions.md`** — global defaults for all specs. A spec only documents a value when it
  **deviates** from conventions. Generated endpoint/service/page specs must inherit these defaults.
- **`royascaff/engine/rules/backend-rule.md`** — architectural layering standard. Used during scanning to
  identify architecture violations for the drift report.
- **`royascaff/engine/rules/frontend-rule.md`** — frontend isolation and layering standard. Same purpose.

**Two zones still apply**:
- **`royascaff/engine/`** — this flow (`flows/reverse-engineer.md`), generic templates (`royascaff/engine/templates/`),
  and generic rules (`royascaff/engine/rules/`). Reusable across any product. Layout contract:
  `royascaff/engine/project-layout.md`.
- **`project/`** — **generated** living blueprint (not shipped empty):
  `profile.md`, `description.md`, `plan/`, `actions/`, `rules.md`, `verify/`, `status.md`.

The engine never hardcodes a specific system's data. All concrete facts about *this* system —
applications, repositories, tech stack, brand tokens, environments, integrations — live in
**`project/profile.md`**.

Follow each phase in order. Each step declares its **Input**, **Template** (optional), **Output**,
**Actions**, and **Done-when** criteria.

---

## Bootstrap — Create Blueprint Root

- **Input**: `royascaff/engine/project-layout.md`
- **Output**: `project/` root skeleton (directories only)
- **Actions**:
  1. Load `royascaff/engine/project-layout.md`.
  2. Run the **Bootstrap gate**: if `project/` is missing, create `plan/`, `actions/`, `changes/`, `bugs/`, `verify/`, `docs/`.
  3. Do **not** write placeholder READMEs. Create each real file only when its Phase R step runs.
- **Done when**: Blueprint root exists and is ready for R.0 writes.

---

## Phase R.0 — Discovery & Workspace Mapping

### Goal
Scan the workspace, identify all applications and their technology stacks, and produce a confirmed
system profile in `project/profile.md` that the rest of the flow will reference.

### Step R.0.1 — Workspace Scan

- **Input**: Workspace root directory (all repositories/folders)
- **Template**: `royascaff/engine/templates/profile-template.md`
- **Output**: `project/profile.md`
- **Actions**:
  1. Scan the workspace root for all repositories, monorepo packages, and standalone applications.
  2. Read configuration files to detect applications and their types:
     - `package.json` — name, scripts, dependencies, workspaces (monorepo detection)
     - `angular.json` / `nx.json` / `turbo.json` / `lerna.json` — monorepo workspace configs
     - `tsconfig.json` / `tsconfig.*.json` — TypeScript project references
     - `nest-cli.json` — NestJS monorepo projects
     - `Dockerfile` / `docker-compose.yml` — containerized services
     - `.env` / `.env.*` files — environment variables, database URLs, API keys
     - `Procfile` / `serverless.yml` / `vercel.json` / `netlify.toml` — deployment configs
  3. For each discovered application, classify its type:
     - **API** — backend service (NestJS, Express, Fastify, etc.)
     - **Web** — frontend web application (Angular, React, Vue, Next.js, etc.)
     - **Mobile** — mobile application (React Native, Flutter, Ionic, etc.)
     - **Worker** — background job processor, cron service
     - **Shared** — shared library or package (monorepo)
  4. For each application, extract framework, language, database, auth strategy, UI library, and
     build tool using the detection heuristics in **Appendix A**.
  5. Identify integrations from dependencies and env vars:
     - Payment, email, storage, AI, messaging, and any other third-party SDK detected.
  6. Populate `project/profile.md` from `royascaff/engine/templates/profile-template.md`:
     - Fill the **Applications** table — each row defines an app **Key** (this key becomes the
       `project/actions/<key>/` folder name), name, type, framework, and repo path.
     - Fill the **Repositories**, **Tech Stack**, **Integrations**, **Environments**, and
       **Brand Tokens** sections.
  7. Handle monorepo vs multi-repo (see **Appendix B**).

- **Done when**:
  - `project/profile.md` exists and the template's **Completion Checklist** is satisfied
  - All applications are listed with correct types, frameworks, and repo paths
  - All integrations are documented
  - Database(s) and auth strategy are identified
  - The **Applications** table has stable **Key** values for `project/actions/<key>/` folders

### ⛔ Confirmation Gate — Profile Review (MANDATORY)

Before continuing to Phase R.1, **stop** and present the discovered profile for explicit approval.

**What to present**:
1. **Discovered applications** — the Applications table (key, type, framework, path)
2. **Tech stack summary** — languages, frameworks, databases, UI libraries, build tools
3. **Integrations** — all detected third-party providers
4. **Architecture type** — monorepo vs multi-repo, shared libraries
5. **Any unknowns** — items that could not be auto-detected (mark with ❓)

**How to present**:
- Format as a concise, readable list (not prose).
- End with: **"Does this profile look correct? Please confirm or correct before I scan the codebase."**
- Wait for explicit confirmation. Do not interpret silence or ambiguous replies as confirmation.
- If corrections requested: update `project/profile.md` and re-present.

---

## Phase R.1 — Codebase Deep Scan

### Goal
Read the actual source code of every application discovered in Phase R.0 and extract schemas, services,
endpoints, and frontend pages/views into their respective blueprint documents.

**Important**: This phase reads code — it does not generate or modify code. All outputs are
documentation files in `project/`.

**Scan order** (follows the traceability chain from `flow.md`):
```
Data Model → Services → Endpoints → Pages/Views
```
Process API apps first (schemas → services → endpoints), then frontend apps (pages/views). This
ensures that when scanning frontend apps, the backend endpoints are already documented.

**Scope discipline**: Resolve modules from the code's folder structure. Create **one file per module**
in the relevant subdirectory. Register every file in the subdirectory's `_index.md` registry.

**Spec defaults**: All generated spec files inherit defaults from `royascaff/engine/conventions.md`. Only
document values that **deviate** from conventions.

**Status from code**: Because this flow reads code that already exists, every extracted artifact is
recorded with a **status** (`royascaff/engine/conventions.md`): `done` when it is fully implemented, `partial`
when the code is incomplete (`// TODO`, `NotImplementedException`, empty method bodies, missing UI
states). Never use `planned` here — if there is no code, there is no artifact to extract. Each
`_index.md` records the rolled-up status + `Done/Total` (see `royascaff/engine/templates/index-template.md`).

---

### Step R.1.1 — Schema/Model Extraction

- **Input**: Backend app source code (from repo paths in `project/profile.md`), database type
- **Template**: `royascaff/engine/templates/data-model-template.md`
- **Output**: `project/plan/data-model.md`
- **Actions**:
  1. Identify the schema/model directory pattern (e.g. `src/modules/*/schemas/`, `src/entities/`,
     `src/models/`, `prisma/schema.prisma`).
  2. Scan every schema/model file. Use the framework detection patterns in **Appendix A** to
     identify entity definitions.
  3. For each entity, extract: entity name, collection/table name, fields (name, type, required,
     default), relationships (refs vs embedded), indexes, enums, validators, timestamps,
     discriminators.
  4. For DTOs, scan for: input DTOs (`Create*Dto`, `Update*Dto`), output DTOs, validation
     decorators (`class-validator`, Joi, Zod).
  5. Populate `project/plan/data-model.md` using the template format.

- **Done when**:
  - Every schema/model file in the codebase has a corresponding entity in `data-model.md`
  - Field types, required flags, and constraints are documented
  - Relationships (references vs embedded) are explicit
  - Index recommendations are provided
  - Enum types are declared; validation rules are stated
  - No schema file was skipped

---

### Step R.1.2 — Service Discovery

- **Input**: Backend app source code, `project/plan/data-model.md`, `royascaff/engine/rules/backend-rule.md` (as architectural reference), `royascaff/engine/conventions.md` (for spec defaults)
- **Template**: `royascaff/engine/templates/services-template.md`
- **Output**: One file per module at `project/actions/<api-app>/services/<module>.md` + `project/actions/<api-app>/services/_index.md`
- **Actions**:
  1. Identify the service directory pattern (e.g. `src/modules/*/services/`).
  2. Scan every service file. Use detection patterns in **Appendix A**.
  3. For each service, determine **type**: `internal` (business logic, uses repositories) or
     `external` (wraps third-party API/SDK).
  4. For each service, extract: class name, module, type, public methods (name, params, return
     type, purpose), dependencies (injected services, repositories, models, config), repositories
     used, external APIs called.
  5. Group services by module. Create one file per module following the template format.
     Inherit `royascaff/engine/conventions.md` defaults — only document deviations.
  6. Create the registry: `project/actions/<api-app>/services/_index.md` — one row per module
     (module name, file link, service count, **status**, **Done/Total**, brief purpose).
  7. Set each service's **status**: `done` if fully implemented, `partial` if incomplete (TODO,
     empty methods, not wired). Roll up per-module status in `_index.md`.
  8. Note any layering violations found (e.g. business logic in controllers, services calling
     vendor SDKs directly without adapter pattern) — these feed into R.3 drift analysis.

- **Done when**:
  - Every service file has a corresponding entry in the correct module file
  - Services are correctly classified as internal or external
  - Public methods, dependencies, and repositories are documented
  - Each service carries a status (`done`/`partial`); `_index.md` rollup + `Done/Total` match
  - `_index.md` lists all module files
  - No service file was skipped; all referenced entities exist in `data-model.md`

---

### Step R.1.3 — Endpoint Extraction

- **Input**: Backend app source code, `project/actions/<api-app>/services/_index.md`, `royascaff/engine/rules/backend-rule.md` (as architectural reference), `royascaff/engine/conventions.md` (for spec defaults)
- **Template**: `royascaff/engine/templates/endpoints-template.md`
- **Output**: One file per module at `project/actions/<api-app>/endpoints/<module>.md` + `project/actions/<api-app>/endpoints/_index.md`
- **Actions**:
  1. Identify the controller/route directory pattern (e.g. `src/modules/*/controllers/`).
  2. Scan every controller/route file. Use detection patterns in **Appendix A**.
  3. For each endpoint, extract: HTTP method, route path (full, including controller prefix and
     params), auth requirements (guards, decorators, `@Public()`), input (body DTO, query, params,
     uploads), output (response DTO, status codes, shape), services called, business rules,
     middleware (rate limiting, etc.).
  4. Identify global prefixes (e.g. `app.setGlobalPrefix('api/v1')`) and versioning strategy.
  5. Group endpoints by module. Create one file per module following the template format.
     Inherit `royascaff/engine/conventions.md` defaults — only document deviations (e.g. if auth matches
     the global default `JwtAuthGuard + RolesGuard`, don't repeat it; only note `@Public()` or
     custom guards).
  6. Create the registry: `project/actions/<api-app>/endpoints/_index.md` — one row per module
     (module name, file link, endpoint count, route prefix, **status**, **Done/Total**).
  7. Set each endpoint's **status**: `done` if implemented, `partial` if incomplete. Roll up
     per-module status in `_index.md`.

- **Done when**:
  - Every controller/route file has corresponding entries in the correct module file
  - HTTP methods and route paths are accurate
  - Auth requirements documented for every endpoint
  - Input/output DTOs specified
  - Every endpoint declares which services it calls; services exist in `services/`
  - Each endpoint carries a status (`done`/`partial`); `_index.md` rollup + `Done/Total` match
  - `_index.md` lists all module files; no controller/route file was skipped

---

### Step R.1.4 — Frontend Page Discovery (per web/mobile app)

Repeat this step for **each frontend application** discovered in Phase R.0. Web apps produce
`pages/<module>.md` files; mobile apps produce `views/<module>.md` files.

- **Input**: Frontend app source code, `project/actions/<api-app>/endpoints/_index.md`, `royascaff/engine/rules/frontend-rule.md` (as architectural reference), `royascaff/engine/conventions.md` (for spec defaults)
- **Template**: `royascaff/engine/templates/pages-template.md` (web) or `royascaff/engine/templates/views-template.md` (mobile)
- **Output**: One file per module at `project/actions/<app-key>/pages/<module>.md`
- **Actions**:
  1. Identify routing and page/component structure. Use detection patterns in **Appendix A**.
  2. For each page/view, extract: route path (or navigation target), components used, frontend
     services called, API calls made (match against `endpoints/`), UI states (loading, empty,
     error, success), auth guard, forms (fields, validation, submit handler).
  3. Identify shared/layout components (nav, sidebar, headers, footers, layout wrappers, shared
     modals/tables/forms) and frontend state management.
  4. Group pages by module. Create one file per module following the template format.
     Inherit `royascaff/engine/conventions.md` frontend defaults — only document deviations.
  5. Note any frontend isolation violations (direct HTTP calls bypassing services, direct
     external API calls, hardcoded URLs) — these feed into R.3 drift analysis.

- **Done when**:
  - Every page/view has a corresponding entry in the correct module file
  - Route paths match the actual routing configuration
  - Components, services, and API calls are documented
  - UI states (loading/empty/error/success) are captured
  - Auth guards are documented
  - Each page/view carries a status (`done`/`partial`); the app's `pages/_index.md` (or `views/_index.md`) rollup + `Done/Total` match
  - All referenced endpoints exist in the API app's `endpoints/`
  - No page/view was skipped; step repeated for every frontend app

---

## Phase R.2 — Plan Synthesis

### Goal
Synthesize the raw extraction results from Phase R.1 into higher-level planning documents: modules
(with features), roles and authorization, rules, and a product description. These complete the
`project/` blueprint to the same standard as Phases 0–4 of `initial-build.md`.

---

### Step R.2.1 — Module & Feature Mapping

- **Input**: `project/plan/data-model.md`, `project/actions/<api-app>/services/_index.md`,
  `project/actions/<api-app>/endpoints/_index.md`, all `project/actions/<web-app>/pages/`
- **Template**: `royascaff/engine/templates/modules-template.md`
- **Output**: `project/plan/modules.md` (includes features — no separate `features.md`)
- **Actions**:
  1. Use the **folder structure** as the primary signal for module boundaries:
     - Backend: each folder under `src/modules/` (NestJS) or `src/` top-level grouping.
     - Frontend: each feature module, lazy-loaded route, or `pages/` subdirectory.
  2. Cross-reference service dependencies to validate module boundaries.
  3. For each module, document: name, purpose, backend scope, frontend scope, dependencies.
  4. Mark special modules: `infrastructure` (auth, core, shared) or `integration` (external providers).
  5. For each module, group endpoints and pages into logical **features** (inline in `modules.md`):
     - A feature is a user-facing capability. Use endpoint groupings as primary signal.
  6. For each feature: name, visibility (`frontend` / `backend-only` / `both`), subfeatures
     (if code reveals distinct sub-capabilities), endpoints/pages/services involved.
  7. Cross-cutting features: document under the primary module with cross-references.

- **Done when**:
  - All business capabilities grouped into named modules in `modules.md`
  - Each module declares backend/frontend scope and its features inline
  - Module dependencies documented
  - No orphaned services, endpoints, or pages outside a defined module
  - Infrastructure and integration modules identified separately
  - All features have visibility declared

---

### Step R.2.2 — Roles & Authorization

- **Input**: All source code (guards, decorators, role checks, middleware), `project/plan/modules.md`
- **Output**: `project/plan/roles-and-authorization.md`
- **Actions**:
  1. **Detect roles**: scan for role enums, constants, decorator arguments (e.g. `@Roles('admin')`,
     `WorkspaceRole`, `UserRole`).
  2. **Detect auth strategy**: JWT, session, OAuth2, API keys. Document token flow (issuance,
     refresh, expiry, storage in frontend).
  3. **Map role-to-endpoint access**: for each role, list accessible endpoint groups/modules.
  4. **Map role-to-page access**: for each role, list reachable frontend pages (route guards).
  5. **Detect ownership rules**: `ownerId === userId`, workspace-scoped resources, tenant isolation.
  6. **Detect special guards**: `@Public()`, workspace role guards, admin-only guards.
  7. Populate `project/plan/roles-and-authorization.md`: roles table, auth flow description,
     endpoint access matrix, page access matrix, ownership and scoping rules.

- **Done when**:
  - All system roles documented
  - Auth flow described
  - Role-to-endpoint and role-to-page access mapped
  - Ownership and scoping rules explicit
  - Special guards noted

---

### Step R.2.3 — Rules Detection

- **Input**: All source code, `project/profile.md`, `project/plan/modules.md`,
  `project/plan/roles-and-authorization.md` (auth rules already captured — skip auth here)
- **Template**: `royascaff/engine/templates/custom-feature-rules-template.md`
- **Output**: `project/rules.md`
- **Actions**:
  1. **Detect integration providers** — payment, email/SMS, storage, AI/ML, push notifications.
     For each: document provider, module/service, isolation pattern.
  2. **Detect async jobs, cron, queues** — Bull/BullMQ, Redis pub/sub, cron decorators, webhooks,
     event emitters.
  3. **Detect security patterns** — rate limiting, CORS, input validation, Helmet, CSRF, upload
     restrictions.
  4. **Detect logging and observability** — logging framework, monitoring, health checks.
  5. **Detect caching** — Redis, in-memory, cache invalidation patterns.
  6. Populate `project/rules.md`: rules grouped by category (integrations, async, security,
     observability, caching). Each rule: rule ID, module/feature reference, constraint, rationale.
     Auth rules: reference `plan/roles-and-authorization.md` — do not duplicate.
     Generic rules remain in `royascaff/engine/rules/` only.

- **Done when**:
  - All integration providers documented with module/feature references
  - Async jobs, queues, and webhooks captured
  - Security patterns documented
  - Each rule references a specific module and feature
  - Auth rules deferred to `roles-and-authorization.md` — no duplication
  - Generic rules remain in `royascaff/engine/rules/` only

---

### Step R.2.4 — Description Generation

- **Input**: `project/plan/modules.md`, `project/plan/data-model.md`,
  `project/plan/roles-and-authorization.md`, `project/rules.md`, `project/profile.md`,
  README file(s) if available
- **Template**: `royascaff/engine/templates/description-template.md`
- **Output**: `project/description.md`
- **Actions**:
  1. Read `README.md` (or equivalent) as starting point: product name, purpose, audience,
     features, architecture.
  2. Synthesize into a cohesive description: **Product Summary**, **Primary Users** (from roles
     in `roles-and-authorization.md`), **Core Workflow** (from page flow + endpoint chains),
     **Core Features** (from `modules.md`), **Key Entities** (from `data-model.md`),
     **Integrations** (from `rules.md` + `profile.md`), **Constraints** (from `rules.md`).
  3. If no README: construct entirely from code analysis.
  4. Mark uncertain sections with `[INFERRED]`.

- **Done when**:
  - `project/description.md` covers all template sections
  - Product purpose, users, workflow, features, entities, integrations documented
  - Inferred sections clearly marked

---

### ⛔ Confirmation Gate — Full Blueprint Review (MANDATORY)

Before continuing to Phase R.3, **stop** and present the full synthesized blueprint for review.

**What to present**:
1. **Product summary** — description overview
2. **Modules** — list with scope (backend/frontend)
3. **Features per module** — names and visibility
4. **Data model** — entity count, key entities, relationships
5. **Roles & auth** — roles detected, auth strategy
6. **Services** — count per module (internal vs external)
7. **Endpoints** — count per module
8. **Pages/views** — count per module per app
9. **Rules** — integration providers, async jobs
10. **Gaps** — anything marked `[INFERRED]` or uncertain (❓)

**How to present**:
- Format as a concise summary table or list.
- End with: **"This is the synthesized blueprint from your codebase. Please review and confirm before I run the drift analysis, or tell me what to correct."**
- Wait for explicit confirmation. Do not interpret silence or ambiguous replies as confirmation.
- If corrections requested: update, re-present.

---

## Phase R.3 — Drift Analysis & Reconciliation

### Goal
Validate that the generated blueprint accurately reflects the codebase, identify discrepancies, and
produce a reconciliation report with actionable recommendations.

---

### Step R.3.1 — Cross-Document Consistency

- **Input**: All generated `project/` documents
- **Output**: Internal consistency findings (fed into the drift report)
- **Actions**:
  Run these checks (matching Phase 4 of `initial-build.md`), adapted for reverse-engineering.
  Focus: **does the generated plan accurately reflect the code?**

  1. **Module-to-Feature Coverage** — every module in `modules.md` has features; no features outside modules
  2. **Feature-to-Service Coverage** — every backend-relevant feature has ≥1 internal service; every integration has an external service; no orphaned services
  3. **Feature-to-Endpoint Coverage** — every backend-relevant feature has ≥1 endpoint; no orphaned endpoints
  4. **Endpoint-to-Service Linking** — every endpoint declares called services; those services exist; no direct repository/provider references
  5. **Feature-to-Page Coverage** — every frontend-visible feature has ≥1 page; no orphaned pages
  6. **Entity Consistency** — all entities in services/endpoints/pages are defined in `data-model.md`; all DTOs exist or are derivable
  7. **Endpoint-to-Page Linking** — every endpoint in a page's "Backend Endpoints Used" exists in `endpoints/`; routes and methods match
  8. **Auth Coverage** — every protected endpoint declares auth; every protected page declares route guard; consistent with `roles-and-authorization.md`
  9. **Custom Rules Compliance** — `project/rules.md` constraints reflected in services/endpoints/pages
  10. **UI State Coverage** — every data-driven page documents loading/empty/error/success; forms have validation; lists have pagination + empty states
  11. **Path and Naming Consistency** — no dead/stale paths; names consistent across all files and `_index.md` registries
  12. **Code Layering Compliance** — BE: controller → service → repository; FE: page → frontend service → endpoint; no business logic in controllers/components; integration providers isolated
  13. **Frontend Third-Party Isolation** — every HTTP call targets configured `apiUrl`; no hardcoded external URLs; no direct third-party calls from frontend — zero tolerance
  14. **Self-Contained Blueprint** — no `royascaff/engine/` file contains system-specific data; `project/` docs reference only other `project/` docs and `royascaff/engine/rules/`; copying `project/` alone is enough to rebuild
  15. **Build Status Coverage** — every service/endpoint/page/view carries a status; each `_index.md` rollup + `Done/Total` matches the per-artifact statuses; anything not `done` is either `planned`, `partial`, or `deferred` (with a reason). Code that exists but is spec'd as `planned` is a drift — fix the status.

- **Done when**: All 15 checks evaluated and findings recorded.

---

### Step R.3.2 — Drift Report

- **Input**: Cross-document consistency findings (R.3.1), all source code, all `project/` documents
- **Output**: `project/verify/reverse-engineer-report.md`
- **Actions**:
  1. **Scan for undocumented code** — controllers/routes not in `endpoints/`, services not in
     `services/`, schemas not in `data-model.md`, pages not in `pages/`, utilities/middleware/
     guards/pipes/interceptors not accounted for.
  2. **Identify incomplete features** — `// TODO`, `NotImplementedException`, empty service
     methods, placeholder pages, unused imports, dead code paths.
  3. **Detect architecture violations** (compare against `royascaff/engine/rules/backend-rule.md` and
     `royascaff/engine/rules/frontend-rule.md`) — controllers calling repos directly, frontend pages
     making direct HTTP calls, frontend calling external APIs, business logic in controllers,
     circular dependencies.
  4. **Find stale/dead code** — unused exports, dead routes, stale schema fields, commented-out
     blocks, deprecated endpoints.
  5. **Check configuration drift** — env vars referenced but missing, defined but unused,
     hardcoded secrets, env mismatches across environments.
  6. Produce the report using this template:

```markdown
# Reverse-Engineer Report

## Generated: <YYYY-MM-DD>
## Codebase: <project name from profile.md>
## Overall Status: [CLEAN | DRIFT DETECTED | SIGNIFICANT DRIFT]

---

## 1. Cross-Document Consistency

### Module Coverage: [✓ | ✗]
### Feature Coverage: [✓ | ✗]
### Service Coverage: [✓ | ✗]
### Endpoint-Service Linking: [✓ | ✗]
### Entity Consistency: [✓ | ✗]
### Endpoint-Page Linking: [✓ | ✗]
### Auth Coverage: [✓ | ✗]
### Custom Rules Compliance: [✓ | ✗]
### UI State Coverage: [✓ | ✗]
### Path and Naming Consistency: [✓ | ✗]
### Code Layering: [✓ | ✗]
### Frontend Third-Party Isolation: [✓ | ✗]
### Self-Contained Blueprint: [✓ | ✗]

(Details only for ✗ items)

---

## 2. Documented & Implemented (✓)

| Category | Count | Notes |
|----------|-------|-------|
| Modules | <N> | |
| Features | <N> | |
| Entities | <N> | |
| Internal Services | <N> | |
| External Services | <N> | |
| Endpoints | <N> | |
| Pages/Views | <N> (per app) | |
| Rules | <N> | |

---

## 3. Undocumented Code

| File / Path | Type | Description | Recommendation |
|-------------|------|-------------|----------------|
| | controller/service/schema/page/utility/middleware | | Add to plan / Ignore / Mark as tech debt |

---

## 4. Incomplete Features

| Feature | Module | What Exists | What's Missing | Recommendation |
|---------|--------|-------------|----------------|----------------|
| | | | | Complete / Remove / Mark as TBD |

---

## 5. Architecture Violations

| Violation | File | Line(s) | Severity | Recommendation |
|-----------|------|---------|----------|----------------|
| | | | CRITICAL/HIGH/MEDIUM/LOW | Fix / Refactor / Accept |

---

## 6. Stale/Dead Code

| File / Symbol | Type | Evidence | Recommendation |
|---------------|------|----------|----------------|
| | unused export/dead route/stale field/commented code | | Remove / Investigate / Keep |

---

## 7. Configuration Drift

| Issue | Details | Recommendation |
|-------|---------|----------------|
| Referenced but missing | | Add to .env |
| Defined but unused | | Remove from .env |
| Hardcoded secret | | Move to .env |
| Env mismatch | | Reconcile |

---

## 8. Reconciliation Summary

| Category | Count | Action Required |
|----------|-------|-----------------|
| Undocumented code items | <N> | <N> to add, <N> to ignore |
| Incomplete features | <N> | <N> to complete, <N> to defer |
| Architecture violations | <N> | <N> critical, <N> non-critical |
| Stale/dead code items | <N> | <N> to remove, <N> to investigate |
| Configuration drift items | <N> | <N> to fix |

## 9. Recommended Next Steps

1. <Prioritized list of actions>
2. ...
```

- **Done when**: Report is complete, every drift category evaluated, recommendations actionable.

---

### Step R.3.3 — Reconciliation Recommendations

- **Input**: `project/verify/reverse-engineer-report.md`
- **Output**: Updated `project/` documents (if user approves), finalized report
- **Scope rule**: When updating `project/` docs, follow the per-module approach — look up
  `_index.md` registries for exact files, update only affected module files.
- **Actions**:
  1. For each drift item, recommend one action:
     - **Add to plan** — code is valid, should be in the blueprint. Update immediately.
     - **Fix in code** — violates `royascaff/engine/rules/`. Create a Phase 5 change request
       (`royascaff/engine/flows/change-mode.md`).
     - **Remove from code** — dead/stale. Create a Phase 5 change request.
     - **Mark as tech debt** — known but not urgent. Document in report.
  2. Present recommendations to the user.
  3. Apply "Add to plan" items immediately (update `project/` docs, `_index.md` registries).
  4. Note "Fix in code" and "Remove from code" as future Phase 5 change requests.
  5. Update the drift report with final disposition of each item.

- **Done when**:
  - Every drift item has a recommended action
  - "Add to plan" items applied; `_index.md` registries updated
  - "Fix" and "Remove" items noted as future work
  - Report reflects final dispositions

---

## Phase R.Done — Handoff

Phase R documents existing code on **main** (correct). It does **not** implement fixes in a giant loop. Incomplete work and drift become work packs under `request-id: REQ-R`, same isolation as Phase 5.

### Step R.Done.1 — Generate the Status Dashboard

- **Template**: `royascaff/engine/templates/status-template.md`
- **Output**: `project/status.md`
- **Actions**: Roll up per-artifact statuses from R.1 + incomplete findings from R.3: Snapshot, By Module, **In Progress** (`partial`), **Next Up**, **Deferred**.
- **Done when**: `project/status.md` exists and counts match every `_index.md`.

### Step R.Done.2 — Create REQ-R Build Program (gaps + drift)

- **Input**: `project/status.md`, drift/reconciliation report, `partial`/`planned` artifacts on main
- **Template**: `royascaff/engine/templates/build-program-template.md`
- **Output**: `project/changes/build-program.md` (`request-id: REQ-R`) + pack folders + `change-log.md` rows

#### Actions

1. Create `change-log.md` if missing.
2. From incomplete features (`partial` / missing code) and drift items marked **fix in code** / **add to plan then implement**:
   - Create one pack per coherent slice (prefer vertical module slice; group tiny fixes if tightly related)
   - `change-type`: `bug-fix` | `modify-*` | `new-feature` as appropriate
   - Folder pattern: `change-<ID>-r-<slug>/` (unique datetime `<ID>` per pack — see `project-layout.md`)
   - Slice pack `blueprint/` from main for owned artifacts; register `drafted` or `blocked`
3. Write `build-program.md` with ordered packs, Progress, and **Next pack**.
4. **Do not** implement packs inside Phase R. Never “fix all drift now” in one session.
5. Present handoff: documentation complete; implementation continues via Phase 5 packs in change-log / build-program.

- **Done when**: REQ-R program exists (or explicitly empty if codebase is clean with no gaps); user knows the next pack or that none are needed.

### Summary

| Document | Path | Source |
|----------|------|--------|
| System profile | `project/profile.md` | R.0 |
| Product description | `project/description.md` | R.2.4 |
| Modules & features | `project/plan/modules.md` | R.2.1 |
| Data model | `project/plan/data-model.md` | R.1.1 |
| Roles & authorization | `project/plan/roles-and-authorization.md` | R.2.2 |
| Custom rules | `project/rules.md` | R.2.3 |
| Services / endpoints / pages / views | `project/actions/…` | R.1.* |
| Status dashboard | `project/status.md` | R.Done.1 |
| Drift report | `project/verify/reverse-engineer-report.md` | R.3 |
| Build program (gaps) | `project/changes/build-program.md` | R.Done.2 (`REQ-R`) |

### Handoff to other flows

- **Complete a REQ-R pack** → Phase 5 from Step 5.4 on that pack (`royascaff/engine/flows/change-mode.md`)
- **New feature** → Phase 5 (new pack)
- **Bug** → Phase 6 (`royascaff/engine/flows/bug-fix.md`)
- **UI polish only** → Phase P (`royascaff/engine/flows/polish.md`)
- Do **not** re-run Phase R unless onboarding a different codebase

### TBDs and Open Items

- Sections marked `[INFERRED]` in `description.md` that need team confirmation
- Drift items marked "Investigate" (may become packs after decision)
- Missing product facts code alone could not reveal

---

## Appendix A — Framework Detection Patterns

Use these patterns to identify frameworks, decorators, and conventions during the codebase scan.
These are detection heuristics — adapt to the specific codebase's conventions.

### Backend Frameworks

#### NestJS
```
Signals:
  - Dependencies: @nestjs/core, @nestjs/common, @nestjs/platform-express
  - Config: nest-cli.json
  - Decorators: @Controller(), @Injectable(), @Module(), @Get(), @Post(),
    @Put(), @Patch(), @Delete(), @UseGuards(), @Body(), @Param(), @Query()
  - Schema: @Schema(), @Prop() (with @nestjs/mongoose)
  - Entity: @Entity(), @Column() (with @nestjs/typeorm)
  - Module pattern: @Module({ imports, controllers, providers, exports })
  - Guard pattern: @UseGuards(AuthGuard), implements CanActivate
  - Pipe pattern: @UsePipes(ValidationPipe), implements PipeTransform
  - Interceptor: @UseInterceptors(), implements NestInterceptor
  - DI: constructor(private readonly serviceA: ServiceA)
```

#### Express
```
Signals:
  - Dependencies: express
  - Pattern: const app = express(), const router = express.Router()
  - Routes: router.get('/path', handler), app.post('/path', handler)
  - Middleware: app.use(middleware), router.use(middleware)
  - Error handling: app.use((err, req, res, next) => ...)
```

#### Fastify
```
Signals:
  - Dependencies: fastify
  - Pattern: const app = fastify(), fastify.register()
  - Routes: fastify.get('/path', options, handler)
  - Schema: route schema definitions with JSON Schema
  - Plugins: fastify.register(plugin, options)
```

### Frontend Frameworks

#### Angular
```
Signals:
  - Dependencies: @angular/core, @angular/common, @angular/router
  - Config: angular.json
  - Decorators: @Component(), @NgModule(), @Injectable(), @Input(), @Output()
  - Routing: RouterModule.forRoot(routes), RouterModule.forChild(routes)
  - Services: @Injectable({ providedIn: 'root' })
  - Standalone: standalone: true, imports: [...], routes array
  - Lazy loading: loadChildren: () => import('./module').then(m => m.Module)
  - Forms: ReactiveFormsModule, FormsModule, FormGroup, FormControl
  - HTTP: HttpClient, HttpClientModule
```

#### React
```
Signals:
  - Dependencies: react, react-dom, react-router-dom
  - Config: next.config.js (Next.js), vite.config.ts (Vite)
  - Components: function Component() { return <JSX> }, const Component = () => <JSX>
  - Hooks: useState, useEffect, useContext, useReducer, custom hooks (use*)
  - Routing: <Route path="/..." element={<Component/>}>, createBrowserRouter
  - File-based routing: pages/ directory (Next.js), app/ directory (Next.js App Router)
  - State: Context, Redux (@reduxjs/toolkit), Zustand, Recoil
  - API: fetch(), axios, useSWR, useQuery (React Query / TanStack Query)
```

#### Vue
```
Signals:
  - Dependencies: vue, vue-router
  - Config: vue.config.js, vite.config.ts, nuxt.config.ts
  - Components: <template>, <script>, <style> in .vue files
  - Composition API: setup(), ref(), reactive(), computed(), watch()
  - Options API: data(), methods, computed, mounted, created
  - Routing: createRouter({ routes }), router.js / router/index.ts
  - State: Vuex (createStore), Pinia (defineStore)
  - File-based routing: pages/ directory (Nuxt.js)
```

### ORM / Database Frameworks

#### Mongoose (MongoDB)
```
Signals:
  - Dependencies: mongoose, @nestjs/mongoose
  - Schema: @Schema(), @Prop(), SchemaFactory.createForClass()
  - Legacy: new mongoose.Schema({}), mongoose.model('Name', schema)
  - Types: Schema.Types.ObjectId, Schema.Types.Mixed
  - Refs: { type: Schema.Types.ObjectId, ref: 'ModelName' }
  - Indexes: @Index(), schema.index({})
  - Virtuals: schema.virtual('name')
  - Middleware: schema.pre('save'), schema.post('save')
  - Plugins: schema.plugin()
```

#### TypeORM (SQL)
```
Signals:
  - Dependencies: typeorm, @nestjs/typeorm
  - Entity: @Entity(), @PrimaryGeneratedColumn(), @Column()
  - Relations: @ManyToOne(), @OneToMany(), @ManyToMany(), @JoinTable(), @JoinColumn()
  - Repository: @InjectRepository(), Repository<Entity>
  - Migrations: src/migrations/, migration files with up()/down()
  - Query: createQueryBuilder(), .find(), .findOne()
```

#### Prisma
```
Signals:
  - Dependencies: @prisma/client, prisma
  - Schema: prisma/schema.prisma
  - Model: model ModelName { ... }
  - Enum: enum EnumName { ... }
  - Relations: @relation(fields: [...], references: [...])
  - Client: const prisma = new PrismaClient()
  - Migrations: prisma/migrations/
```

#### Sequelize
```
Signals:
  - Dependencies: sequelize, sequelize-typescript
  - Model: Model.init(), sequelize.define()
  - Decorators: @Table, @Column, @HasMany, @BelongsTo
  - Migrations: src/migrations/, sequelize-cli
```

---

## Appendix B — Monorepo vs Multi-Repo Handling

### Monorepo Detection

A monorepo is detected when:
- `package.json` has a `workspaces` field (npm/yarn workspaces)
- `lerna.json` exists at the root
- `nx.json` exists (Nx workspace)
- `turbo.json` exists (Turborepo)
- `angular.json` has multiple `projects` entries
- `nest-cli.json` has a `projects` field with multiple entries
- `pnpm-workspace.yaml` exists

### Monorepo Handling

1. **Scan each package/app separately** — treat each workspace package as a separate Application entry in `project/profile.md`.
2. **Shared packages** — packages under `packages/` or `libs/` imported by multiple apps: list as `Shared` type. Exports documented in consuming app's files.
3. **Dependency graph** — document which apps depend on which shared packages.
4. **Single profile, multiple apps** — all apps share one `project/profile.md`. Each gets its own `project/actions/<app-key>/` folder.

### Multi-Repo Handling

1. **Scan each repo independently** — each maps to one or more Application entries.
2. **Cross-repo dependencies** — document API contracts. Captured in `endpoints/` and `pages/` cross-references.
3. **Shared types/contracts** — document as a shared library in `profile.md`.

---

## Appendix C — Low-Quality Code Guidance

Legacy codebases often have inconsistencies. Follow these guidelines:

- **Missing types / `any`**: infer from usage, document with `[INFERRED]`, note in drift report.
- **Poor naming / no comments**: read function body + calling context, document with `[INFERRED]`.
- **Mixed patterns**: document what the code does (not what it should do), flag violations in drift report.
- **Scattered business logic**: document under closest service in `services/<module>.md`, flag as violation.
- **Undocumented env vars**: scan all source for `process.env.*` / `ConfigService.get()`, add to `profile.md`, flag in drift report.
- **Legacy database patterns (raw SQL)**: extract entity shapes from queries, document in `data-model.md`, flag in drift report.

---

## Appendix D — `project/actions/` Folder Structure

One subfolder per application, keyed by the **Key** column from `project/profile.md`. Specs split
**per module** with registry indexes.

```
project/actions/
  <api-app-key>/
    endpoints/
      _index.md             # Registry: module name, file link, endpoint count, route prefix
      <module-name>.md
    services/
      _index.md             # Registry: module name, file link, service count, purpose
      <module-name>.md
  <web-app-key>/
    pages/
      <module-name>.md
  <mobile-app-key>/
    views/
      <module-name>.md
```

**Rules**:
- Folder name **must** match app key (lowercase, kebab-case).
- API apps: `services/` + `endpoints/` subdirectories, each with `_index.md`.
- Web apps: `pages/` subdirectory.
- Mobile apps: `views/` subdirectory.
- Every module file registered in its subdirectory's `_index.md`.
- Shared libraries: no `actions/` folder — exports documented in consuming app's files.

---

## Quick Reference — Phase Summary

| Phase | Steps | What it does | Key output |
|-------|-------|-------------|------------|
| **R.0** | R.0.1 | Scan workspace, detect apps, frameworks, integrations | `project/profile.md` |
| **R.1** | R.1.1 – R.1.4 | Deep-scan code: schemas, services, endpoints, pages | `data-model.md`, `services/` + `_index.md`, `endpoints/` + `_index.md`, `pages/` |
| **R.2** | R.2.1 – R.2.4 | Synthesize modules+features, roles, rules, description | `modules.md`, `roles-and-authorization.md`, `rules.md`, `description.md` |
| **R.3** | R.3.1 – R.3.3 | Drift analysis, consistency checks, reconciliation | `reverse-engineer-report.md` |
| **R.Done** | R.Done.1–2 | Status dashboard + REQ-R build program / packs; handoff to Phase 5 | `status.md`, `changes/build-program.md` |

---
