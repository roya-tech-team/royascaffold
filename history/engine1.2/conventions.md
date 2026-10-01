# Engine Conventions — Global Defaults

All spec files (endpoints, services, pages, views) inherit these defaults.
A spec only documents a value when it **deviates** from this file.

**System-specific facts** (framework versions, database, queues, storage, AI/email/payment providers, brand colors, product name, repo paths) live only in generated `project/profile.md`. Never put them in `royascaff/engine/`.

---

## API Conventions

| Convention | Default |
|------------|---------|
| Route prefix | `/api/v1` |
| Auth model | JWT bearer; global auth + role/permission guards; workspace-scoped guards when the product needs them |
| Success envelope | `{ success: true, data: <payload> }` |
| Error envelope | `{ success: false, message: string, statusCode: number, error?: string, errors?: [{ field, message }] }` |
| Pagination | `{ data: T[], total: number, page: number, limit: number }` via query params `?page=1&limit=20` |
| Validation | Validate request DTOs at the API boundary (whitelist unknown fields) |
| Rate limiting | Auth endpoints: 10/min/IP · All other: 100/min/user (override per product in profile/rules) |

Concrete guard/class names and libraries come from `project/profile.md` Tech Stack.

## Frontend Conventions

| Convention | Default |
|------------|---------|
| API base | Environment/config API URL — all HTTP calls go through the app's API client, never third-party SDKs from UI |
| Auth | JWT in `Authorization: Bearer` header via HTTP interceptor |
| Loading state | Spinner (or equivalent) on async operations |
| Error state | Toast / inline error on failure |
| Success state | Navigate to next route or show success feedback |
| Empty state | Context-appropriate empty message + optional CTA |
| Guards | Unauthenticated → login · Guest-only routes → app home if already logged in · Role/workspace guards as defined in profile |

## Artifact ID Scheme

IDs are stable cross-references across services, endpoints, and pages/views.

| Artifact | Pattern | Example |
|----------|---------|---------|
| Service | `SVC-<MODULE>-NN` | `SVC-USERS-01` |
| Endpoint | `EP-<MODULE>-NN` | `EP-USERS-01` |
| Page | `PG-<MODULE>-NN` | `PG-USERS-01` |
| View | `VW-<MODULE>-NN` | `VW-USERS-01` |
| Custom rule | `RULE-<AREA>-NN` | `RULE-AUTH-01` |

- `<MODULE>` — short uppercase token from the module name (`Auth` → `AUTH`, `Users` → `USERS`).
- `NN` — two-digit sequence **per module file**, starting at `01`.
- IDs never reuse a number after deletion; append the next free number.
- Client specs reference endpoints by these IDs (e.g. `→ EP-USERS-01`).

## Naming Conventions

| Item | Convention |
|------|-----------|
| Entities | PascalCase singular (`User`, `Project`, `Dashboard`) |
| Collections / tables | lowercase plural (`users`, `projects`, `dashboards`) |
| DTOs | PascalCase + `Dto` suffix (`CreateProjectDto`, `AuthResponseDto`) |
| Services | PascalCase + `Service` (`AuthService`, `ProjectService`) |
| Controllers | PascalCase + `Controller` (`AuthController`) |
| Guards | PascalCase + `Guard` (`JwtAuthGuard`, `WorkspaceRoleGuard`) |
| Modules | PascalCase + `Module` (`AuthModule`) |
| Frontend services | PascalCase + `Service` (`AuthService`, `ProjectApiService`) |
| Frontend components | PascalCase + `Component` (`LoginFormComponent`) |

## Build Status

Every buildable artifact (service, endpoint, page/view) carries a **status** so any reader — human or AI — can tell at a glance what is built, what is half-built, what is only planned, and what was deliberately postponed. This is what lets a model resume work without re-discovering the whole codebase.

### Status Values

| Status | Meaning | When to use |
|--------|---------|-------------|
| `planned` | Specced in the blueprint, **no code yet** | Artifact was designed but implementation hasn't started |
| `partial` | **Code exists but is incomplete** (missing methods, states, validation, or endpoints wired) | Work was started and paused, or only part of the spec is implemented |
| `done` | **Implemented and verified** against its spec | Code exists, compiles, and matches the spec |
| `deferred` | **Intentionally postponed** to a later time | A decision was made to skip this for now — **must include a reason** in Notes |

Rules:
- **Default on creation is `planned`.** A spec written before code always starts `planned`.
- **`deferred` always needs a reason** (e.g. `deferred: post-MVP`, `deferred: waiting on payment provider`). Without a reason, use `planned`.
- **Never delete a `deferred`/`planned` artifact silently** — it is the record of unfinished work. Only remove it via an explicit change or bug fix.
- Status is **maintained in-place** next to the spec; it is never tracked only in a separate log.

### Where status is recorded (single source of truth → summary)

| Level | File | Granularity | Role |
|-------|------|-------------|------|
| Per artifact | `endpoints/<module>.md`, `services/<module>.md`, `pages/<module>.md`, `views/<module>.md` | one status per endpoint / service / page | **source of truth** |
| Per module | each subdirectory's `_index.md` | rolled-up status + `Done/Total` count | fast scan map |
| Whole system | `project/status.md` | per-app + roadmap (In Progress / Next Up / Deferred) | bird's-eye "where are we / what's next" |

### Rollup rule (per-module status in `_index.md`)

- All artifacts `done` → module is `done`
- Any artifact `partial`, or a mix of `done` + `planned` → module is `partial`
- No code started (all `planned`) → module is `planned`
- All remaining work is `deferred` → module is `deferred`

`project/status.md` and each `_index.md` are **summaries** — they must always agree with the per-artifact status in the **main** spec files.

---

## Main vs pack vs index

| Layer | What it tracks | When it updates |
|-------|----------------|-----------------|
| **Main** `project/plan`, `project/actions`, `project/status.md` | Roadmap + implemented reality (see exception) | Phase 0–2 / Phase R write; pack **merge** updates status |
| **Pack** `changes/change-<ID>-…/blueprint/` + `status.md` | In-flight specs + per-artifact status (`<ID>` = `YYYYMMDD-HHMMSS`, never sequential) | While drafting and implementing |
| **Index** `changes/change-log.md` | Every pack's `pack-status` + Artifacts done | On every pack-status transition |
| **Build program** `changes/build-program.md` | Ordered REQ-INIT / REQ-R pack queue | Initial Build 3.0 / Phase R.Done.2 |
| **Bugs index** `bugs/bug-log.md` | `PENDING` · `DONE` · `ESCALATED` | On every bug transition |

### Exception — planned specs on main

**Initial Build Phase 2** may write full action specs to main with status `planned` (product intent / backlog).  
**Phase R** may write main with `done` / `partial` / `planned` reflecting the existing codebase.

That does **not** allow editing main during implementation. While a pack is in flight, change only the pack `blueprint/`; at **merge**, update main artifact status (`planned`→`done`/`partial`) and any after-state gap fill.

### Pack-status (change-log + change-request metadata)

| Status | Meaning |
|--------|---------|
| `drafted` | Request + pack blueprint written; code not started |
| `in-progress` | Implementation started |
| `verified` | `verify-code.md` PASS; not yet merged |
| `merged` | Main blueprint updated |
| `cancelled` | Abandoned; main never touched |
| `blocked` | Waiting on `depends-on` |

**Rules:**

- Never edit main plan/actions for in-flight work — use the pack `blueprint/`.
- Never leave `change-log.md` stale relative to pack `status.md`.
- Greenfield implementation = REQ-INIT packs (not a monolith Phase 3). Phase R gaps = REQ-R packs.
- Resume from `change-log.md` (+ `build-program.md` if present); merged overview from `project/status.md`.
