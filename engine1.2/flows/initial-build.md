# AI-Control Engine — Initial Build Flow (Phases 0–4)

Use this flow once to go from product description to a fully built, verified application.
Follow each phase in order. Each step declares **Inputs**, **Template**, **Output**, and **Done-when** criteria.

`project/` is **not** pre-seeded. Before Phase 0, run the bootstrap gate so the engine creates the blueprint root. Layout contract: `royascaff/engine/project-layout.md`.

---

## Bootstrap — Create Blueprint Root

- **Input**: `royascaff/engine/project-layout.md`
- **Output**: `project/` root skeleton (directories only)
- **Actions**:
  1. Load `royascaff/engine/project-layout.md`.
  2. Run the **Bootstrap gate**: if `project/` is missing, create `plan/`, `actions/`, `changes/`, `bugs/`, `verify/`, `docs/`.
  3. Do **not** write placeholder READMEs or empty stub files. Create each real file only when its phase step runs, from the matching template.
- **Done when**: Blueprint root exists (or already existed) and is ready for Phase 0 writes.

---

## Phase 0 — Understand

**Goal**: Produce a complete, unambiguous product specification in `project/description.md` and a confirmed system profile in `project/profile.md`.

### Step 0.0 — Choose Description Path

- **Input**: `project/description.md` (optional — may not exist yet)
- **Output**: Decision — Path A or Path B

| Path | When |
|------|------|
| **A — Full description** | `project/description.md` exists with substantive content: product purpose, primary user, core workflow, core features, key entities all described; no `[placeholder]` or `TBD` remains |
| **B — Step-by-step** | Any of the above is false, or file does not exist |

- **Done when**: Path A or Path B is selected and recorded.

### Step 0.0b — Establish System Profile

- **Input**: existing repos/code (if any), the description
- **Template**: `royascaff/engine/templates/profile-template.md`
- **Output**: `project/profile.md`
- **Actions**: Confirm or create `project/profile.md` — applications, repositories, tech stack, brand tokens, environments, integrations. For existing codebases derive from actual repos; for greenfield fill intended choices. Get the **Applications** table right first — its **Key** column defines `target-app` values and `project/actions/<key>/` folder names.
- **Done when**: `project/profile.md` exists, template checklist is satisfied, and it lists apps, repos, stack, brand, environments, and integrations.

### Step 0.1A — Adopt Full Description (Path A)

- **Input**: `project/description.md`
- **Output**: `project/description.md` (validated; minor edits only)
- **Actions**:
  1. Read `project/description.md` as authoritative.
  2. Run Done-when checklist; fix only gaps, ambiguities, or formatting.
  3. Do **not** replace with template layout unless explicitly asked.
- **Done when**: Product purpose clear, primary user + workflow described, core features listed, key entities identified, integrations/constraints documented, no TBD placeholders.

Proceed to **Phase 1**.

### Step 0.1B — Build Description Step-by-Step (Path B)

- **Input**: `project/description.md` (empty, partial, or missing)
- **Template**: `royascaff/engine/templates/description-template.md`
- **Output**: `project/description.md` (built section by section)
- **Actions**:
  1. Walk through each template section (1–11) with the user.
  2. For each: ask for info, draft section, confirm, proceed.
  3. Do not skip to Phase 1 until template **Completion Checklist** is satisfied.
  4. Final pass: review for consistency, remove leftover placeholders.
- **Done when**: All template sections filled or N/A, template checklist satisfied, no TBD placeholders.

Proceed to **Phase 1**.

---

## Phase 1 — Plan

**Goal**: Generate planning documents — modules (with features), custom rules, and data model. Outputs land in `project/plan/` and `project/rules.md`.

### Step 1.1 — Create Modules & Features Map

- **Input**: `project/description.md`
- **Template**: `royascaff/engine/templates/modules-template.md`
- **Output**: `project/plan/modules.md`
- **Done when**:
  - All business capabilities grouped into named modules
  - Each module declares backend/frontend scope and dependencies
  - All product features listed under the correct module with visibility (frontend/backend-only/both)
  - Feature names are stable and reusable
  - No orphaned features outside modules

### Step 1.2 — Create Custom Feature Rules

- **Input**: `project/description.md`, `project/plan/modules.md`
- **Template**: `royascaff/engine/templates/custom-feature-rules-template.md`
- **Output**: `project/rules.md`
- **Done when**:
  - Project-specific rules documented (AI usage, integrations, async jobs, security)
  - Each rule references a specific module and feature
  - Provider/integration requirements explicit
  - Constraints and forbidden behaviors clear
  - Generic rules remain in `royascaff/engine/rules/` only

### Step 1.3 — Create Data Model

- **Input**: `project/description.md`, `project/plan/modules.md`, `project/rules.md`
- **Template**: `royascaff/engine/templates/data-model-template.md`
- **Output**: `project/plan/data-model.md`
- **Done when**:
  - All persistent entities defined with schema shapes per project database (per `project/profile.md`)
  - Field types, required flags, and constraints documented
  - Relationships (references vs embedded) explicit
  - Index recommendations provided
  - Enum types declared
  - Validation rules stated

---

## Phase 2 — Actions

**Goal**: Generate service map, endpoint specs, and client (page/view) specs on **main** under `project/actions/<app-key>/`. This is the product intent backlog (artifact status `planned`). Implementation happens later via REQ-INIT packs in Phase 3 — not by editing these files mid-build.

**Call chain** (dependency direction):
```
<app>/pages/ → <api-app>/endpoints/ → <api-app>/services/ → repositories / external providers
```

Create services before endpoints, endpoints before client specs.

**Status at spec time**: Every artifact created in Phase 2 starts with **status `planned`** (no code exists yet — see `royascaff/engine/conventions.md`). Each `_index.md` registry (`royascaff/engine/templates/index-template.md`) records the per-module rolled-up status and `Done/Total` count — at this phase every module is `planned` with `0/N` done.

### Step 2.1 — Create Services Map

- **Input**: `project/description.md`, `project/plan/modules.md`, `project/plan/data-model.md`, `royascaff/engine/rules/backend-rule.md`, `project/rules.md`
- **Template**: `royascaff/engine/templates/services-template.md`
- **Output**: `project/actions/<api-app>/services/_index.md` + per-module files in `services/`
- **Done when**:
  - Every backend-relevant feature covered by at least one **internal** service
  - Services grouped by module
  - Each service declares type (`internal`/`external`), public methods, dependencies
  - Internal services own business logic, may use repositories and other services
  - External services wrap third-party integrations per `royascaff/engine/rules/backend-rule.md` isolation rules
  - All referenced entities/DTOs exist in `data-model.md`
  - Every external API has a corresponding external service

### Step 2.2 — Create Endpoints Specification

- **Input**: `project/description.md`, `project/plan/modules.md`, `project/plan/data-model.md`, `project/actions/<api-app>/services/_index.md`, `royascaff/engine/rules/backend-rule.md`, `project/rules.md`
- **Template**: `royascaff/engine/templates/endpoints-template.md`
- **Output**: `project/actions/<api-app>/endpoints/_index.md` + per-module files in `endpoints/`
- **Done when**:
  - Every backend-relevant feature has at least one endpoint
  - Endpoints grouped by module
  - Each endpoint declares method, route, auth, input, output, constraints
  - Each endpoint declares which **services** it calls (must exist in `services/`)
  - Endpoints do not call repositories or external providers directly
  - CRUD patterns follow `royascaff/engine/rules/backend-rule.md`
  - Custom feature rules reflected
  - All referenced DTOs/entities exist in `data-model.md`

### Step 2.3 — Create Client Specifications (Pages / Views) — one per app

Create one client spec per frontend app. Web → `pages/`, Mobile → `views/`. Repeat for each frontend app.

- **Input**: `project/description.md`, `project/plan/modules.md`, `project/plan/data-model.md`, `project/actions/<api-app>/endpoints/_index.md`, `royascaff/engine/rules/frontend-rule.md`, `project/rules.md`
- **Template**: `royascaff/engine/templates/pages-template.md` (web) or `royascaff/engine/templates/views-template.md` (mobile)
- **Output**: `project/actions/<app-key>/pages/` (web) or `project/actions/<app-key>/views/` (mobile)
- **Done when**:
  - Every frontend-visible feature has at least one page/view in the relevant app
  - Pages/views grouped by module
  - Each page/view declares route, components, frontend services, models, and **endpoints** used
  - Pages/views call frontend HTTP services only — not backend services directly
  - UI states (loading/empty/error/success) documented
  - Frontend/mobile patterns follow `royascaff/engine/rules/frontend-rule.md`
  - All referenced endpoints exist in the API app's `endpoints/`
  - Custom feature rules reflected

---

## Phase 3 — Build (via work packs)

**Goal**: Implement the Phase 2 planned blueprint into code **one work pack at a time** — never the whole system in one session.

**Invariant:** Phase 0–2 write the full intent to **main** with artifact status `planned`. Implementation edits happen only inside change packs; main artifact status flips to `done`/`partial` at **merge**. Same lifecycle as Phase 5 (`royascaff/engine/flows/change-mode.md`). Layout: `royascaff/engine/project-layout.md`.

**Resume:** Read `project/changes/change-log.md` + `project/changes/build-program.md` first, then open the next pack.

### ⛔ Pre-Build Confirmation Gate (MANDATORY — do not skip)

Before creating the build program or writing **any** code, present for approval:

1. **What will be packed** — modules/slices from Phase 2 (not “build everything now”)
2. **Proposed pack order** — foundation → Auth → modules by dependency → cross-cutting
3. **Target repos/folders** — from `project/profile.md`
4. **Frontend visual approach** — design system / brand tokens from profile

End with: **"Can I proceed with creating the build program and work packs?"**

Wait for explicit confirmation. Silence ≠ confirmation.

---

### Step 3.0 — Create Build Program

- **Input**: `project/plan/modules.md`, main `project/actions/**` (all `planned`), `project/profile.md`
- **Template**: `royascaff/engine/templates/build-program-template.md`
- **Output**:
  - `project/changes/build-program.md` with `request-id: REQ-INIT`
  - Pack folders `change-<ID>-init-<slug>/` materialized
  - Rows in `project/changes/change-log.md`

#### Actions

1. Create `change-log.md` from `royascaff/engine/templates/change-log-template.md` if missing.
2. Slice **vertical packs per module** (data-model slice → services → endpoints → pages/views for that module).
3. Order packs:
   - Foundation (app shell, shared infra) first
   - **Auth** next
   - Remaining modules by dependency from `modules.md`
   - Cross-cutting (jobs, integrations) last
4. For each pack, mint a unique datetime `<ID>` (`YYYYMMDD-HHMMSS`; see `project-layout.md` — never sequential numbers) and create `project/changes/change-<ID>-init-<slug>/`:
   - `change-request.md` — `change-type: new-module` or `new-feature`; `request-id: REQ-INIT`; `part: N/M`; `depends-on` (peer ID/folder); `pack-status: drafted` or `blocked`
   - `blueprint/` — copy/slice **only** that module’s specs from main (`plan/` excerpts + `actions/.../<module>.md`)
   - `status.md` + `blueprint/_index.md` (artifacts start `planned`)
   - `impact.md` — abbreviated create list for code files
   - Register in `change-log.md`
5. Write `build-program.md` with the ordered table + Progress + **Next pack**.
6. **Stop.** Present the program. Ask which pack to run (default: first unblocked).

- **Done when**: Build program exists; all packs registered; user has chosen the next pack (or paused).

---

### Step 3.x — Execute one pack (loop)

For the chosen pack only:

1. **Dependency gate** — if `depends-on` is not `verified` or `merged`, set this pack `blocked`, update change-log, stop.
2. **Implement → verify → merge** — follow `royascaff/engine/flows/change-mode.md` from **Step 5.4** through **Step 5.6** (pack blueprint already drafted in 3.0).
   - Implementer load set: pack `change-request.md` + `blueprint/` + `impact.md` + `status.md` (+ minimal main read-only for that module if needed)
   - Do **not** load unrelated modules or implement other packs in the same session
3. On merge: main artifact statuses for owned IDs → `done`/`partial`/`deferred`; refresh main `_index.md` + `project/status.md`; update `build-program.md` Progress / Next pack.
4. **Hard stop** after merge (or after verify if user defers merge). Next chat resumes from change-log / build-program.

Repeat Step 3.x until exit criteria.

### Phase 3 exit criteria

- All non-`deferred` REQ-INIT packs are `merged`, **or**
- User explicitly pauses: remaining packs stay `drafted`/`blocked`; main keeps those artifacts `planned`; `project/status.md` **Next Up** lists them.

Do **not** run a monolith “generate all backend then all frontend” pass.

---

## Phase 4 — Verify

**Goal**: Run consistency checks across documents and code for the **merged** system (plus remaining `planned` backlog).

**When to run full Phase 4:** build program complete (all non-deferred packs `merged`), **or** user requests a mid-stream audit. Each pack already has its own scoped `verify-code.md`; Phase 4 is the system-level gate.

### Cross-Document Consistency Checks

Run these checks and fix any gaps:

1. **Module-to-Feature Coverage** — every module in `modules.md` has features; no features outside modules
2. **Feature-to-Service Coverage** — every backend-relevant feature has ≥1 internal service; every integration has an external service; no orphaned services
3. **Feature-to-Endpoint Coverage** — every backend-relevant feature has ≥1 endpoint; no orphaned endpoints
4. **Endpoint-to-Service Linking** — every endpoint declares called services; those services exist; no direct repository/provider references
5. **Feature-to-Page Coverage** — every frontend-visible feature has ≥1 page; no orphaned pages
6. **Entity Consistency** — all entities in services/endpoints/pages are defined in `data-model.md`; all DTOs exist or are derivable
7. **Endpoint-to-Page Linking** — every endpoint in a page's "Backend Endpoints Used" exists in `endpoints/`; routes and methods match
8. **Auth Coverage** — every protected endpoint declares auth; every protected page declares route guard; consistent across BE/FE
9. **Custom Rules Compliance** — `project/rules.md` constraints reflected in services/endpoints/pages/code
10. **UI State Coverage** — every data-driven page documents loading/empty/error/success; forms have validation; lists have pagination + empty states
11. **Path and Naming Consistency** — no dead/stale paths; names consistent across all files
12. **Code Layering Compliance** — BE: controller → service → repository; FE: page → frontend service → endpoint; no business logic in controllers/components; integration providers isolated
13. **Frontend Third-Party Isolation** — every HTTP call targets configured `apiUrl`; no hardcoded external URLs; no direct third-party calls from frontend — zero tolerance
14. **Self-Contained Blueprint** — no `royascaff/engine/` file contains system-specific data; `project/` docs reference only other `project/` docs and `royascaff/engine/rules/`; copying `project/` alone is enough to rebuild
15. **Build Status Coverage** — every service/endpoint/page/view carries a status; each `_index.md` rollup + `Done/Total` matches the per-artifact statuses; anything not `done` is either `planned`, `partial`, or `deferred` (with a reason). Code that exists but is spec'd as `planned` is a drift — fix the status.

### Step 4.1 — Generate the Status Dashboard

- **Template**: `royascaff/engine/templates/status-template.md`
- **Output**: `project/status.md`
- **Actions**: Roll up the per-artifact statuses and `_index.md` counts into the system dashboard: per-app snapshot, per-module table, **In Progress** (`partial`), **Next Up** (ordered roadmap of `planned` work in build order), and **Deferred** (with reasons). This is the file a future model reads first to know where the build stands.
- **Done when**: `project/status.md` exists and its counts match every `_index.md`.

### Verification Report

Save to `project/verify/verification-report.md`:

```markdown
# Verification Report

## Status: [PASS | ISSUES FOUND]

## Module Coverage: [✓ | ✗]
## Feature Coverage: [✓ | ✗]
## Service Coverage: [✓ | ✗]
## Endpoint-Service Linking: [✓ | ✗]
## Entity Consistency: [✓ | ✗]
## Endpoint-Page Linking: [✓ | ✗]
## Auth Coverage: [✓ | ✗]
## Custom Rules Compliance: [✓ | ✗]
## UI State Coverage: [✓ | ✗]
## Path Consistency: [✓ | ✗]
## Code Layering: [✓ | ✗]
## Frontend Third-Party Isolation: [✓ | ✗]
## Self-Contained Blueprint: [✓ | ✗]
## Build Status Coverage: [✓ | ✗]

## Summary
[Overall assessment and recommended fixes]
```

---

## Done

When Phase 3 exit criteria are met and Phase 4 verification passes (or user paused with a clear Next Up):

- Confirmed system profile in `project/profile.md`
- Complete planning + action specs on main (implemented artifacts `done`; backlog may remain `planned`)
- `project/changes/build-program.md` + REQ-INIT packs in `change-log.md`
- Code for merged packs in repos from `project/profile.md`
- Verification report (when Phase 4 ran) in `project/verify/`
- Build-status dashboard in `project/status.md`

Further product work: Phase 5 (`change-mode.md`). Resume unfinished REQ-INIT packs via `change-log.md` / `build-program.md`.
