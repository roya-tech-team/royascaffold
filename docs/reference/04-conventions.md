# Conventions

Source: [engine/conventions.md](../../engine/conventions.md)

Global defaults that every spec inherits. **A spec documents a value only when it deviates from this file.**

That rule is what keeps specs readable. An endpoint spec does not restate the route prefix, the auth model, or the response envelope — those are assumed. It records the exceptions.

## Where system-specific facts go

Framework versions, database choice, queues, storage, AI, email, and payment providers, brand colors, product name, and repository paths live **only** in generated `project/profile.md`. They never appear in `royascaff/engine/`.

Concrete guard and class names, and the libraries behind them, come from the profile's Tech Stack section.

## API conventions

| Convention | Default |
|------------|---------|
| Route prefix | `/api/v1` |
| Auth model | JWT bearer; global auth plus role and permission guards; workspace-scoped guards when the product needs them |
| Success envelope | `{ success: true, data: <payload> }` |
| Error envelope | `{ success: false, message: string, statusCode: number, error?: string, errors?: [{ field, message }] }` |
| Pagination | `{ data: T[], total: number, page: number, limit: number }` via query params `?page=1&limit=20` |
| Validation | Validate request DTOs at the API boundary, whitelisting unknown fields |
| Rate limiting | Auth endpoints 10 per minute per IP; all others 100 per minute per user. Override per product in the profile or rules. |

## Frontend conventions

| Convention | Default |
|------------|---------|
| API base | Environment or config API URL. All HTTP calls go through the app's API client, never third-party SDKs from the UI. |
| Auth | JWT in the `Authorization: Bearer` header via an HTTP interceptor |
| Loading state | Spinner or equivalent on async operations |
| Error state | Toast or inline error on failure |
| Success state | Navigate to the next route, or show success feedback |
| Empty state | Context-appropriate empty message plus an optional call to action |
| Guards | Unauthenticated goes to login; guest-only routes go to app home if already logged in; role and workspace guards as defined in the profile |

The four UI states are not optional decoration — verification check 10 requires every data-driven page to document loading, empty, error, and success.

## Artifact ID scheme

| Artifact | Pattern | Example |
|----------|---------|---------|
| Service | `SVC-<MODULE>-NN` | `SVC-USERS-01` |
| Endpoint | `EP-<MODULE>-NN` | `EP-USERS-01` |
| Page | `PG-<MODULE>-NN` | `PG-USERS-01` |
| View | `VW-<MODULE>-NN` | `VW-USERS-01` |
| Custom rule | `RULE-<AREA>-NN` | `RULE-AUTH-01` |

`<MODULE>` is a short uppercase token from the module name. `NN` is a two-digit sequence per module file starting at `01`. IDs never reuse a number after deletion — append the next free one. Client specs reference endpoints by ID, for example `→ EP-USERS-01`.

Full detail in [Status and IDs](03-status-and-ids.md).

## Naming conventions

| Item | Convention |
|------|-----------|
| Entities | PascalCase singular — `User`, `Project`, `Dashboard` |
| Collections and tables | lowercase plural — `users`, `projects`, `dashboards` |
| DTOs | PascalCase plus `Dto` — `CreateProjectDto`, `AuthResponseDto` |
| Services | PascalCase plus `Service` — `AuthService`, `ProjectService` |
| Controllers | PascalCase plus `Controller` — `AuthController` |
| Guards | PascalCase plus `Guard` — `JwtAuthGuard`, `WorkspaceRoleGuard` |
| Modules | PascalCase plus `Module` — `AuthModule` |
| Frontend services | PascalCase plus `Service` — `AuthService`, `ProjectApiService` |
| Frontend components | PascalCase plus `Component` — `LoginFormComponent` |

## Build status

Conventions also defines the four artifact statuses, the rollup rule, and where status is recorded. That material is covered in full in [Status and IDs](03-status-and-ids.md).

Summary: every buildable artifact is `planned`, `partial`, `done`, or `deferred`; `deferred` requires a reason; the per-artifact status in the module file is the source of truth; `_index.md` and `status.md` are summaries that must agree with it.

## Main versus pack versus index

| Layer | What it tracks | When it updates |
|-------|----------------|-----------------|
| **Main** — `plan/`, `actions/`, `status.md` | Roadmap plus implemented reality | Phase 0–2 and Phase R write; pack merge updates status |
| **Pack** — `changes/change-<ID>-…/blueprint/` and `status.md` | In-flight specs and per-artifact status | While drafting and implementing |
| **Index** — `changes/change-log.md` | Every pack's `pack-status` and Artifacts done | On every pack-status transition |
| **Build program** — `changes/build-program.md` | Ordered REQ-INIT or REQ-R queue | Initial Build 3.0 or Phase R.Done.2 |
| **Bugs index** — `bugs/bug-log.md` | `PENDING`, `DONE`, `ESCALATED` | On every bug transition |

### Exception — planned specs on main

**Initial Build Phase 2** may write full action specs to main with status `planned`, representing product intent and backlog. **Phase R** may write main with `done`, `partial`, or `planned` reflecting the existing codebase.

That does **not** allow editing main during implementation. While a pack is in flight, change only the pack `blueprint/`. At merge, update main artifact status and fill any after-state gaps.

### Pack-status vocabulary

| Status | Meaning |
|--------|---------|
| `drafted` | Request and pack blueprint written; code not started |
| `in-progress` | Implementation started |
| `verified` | `verify-code.md` PASS; not yet merged |
| `merged` | Main blueprint updated |
| `cancelled` | Abandoned; main never touched |
| `blocked` | Waiting on `depends-on` |

### Rules

- Never edit main plan or actions for in-flight work — use the pack `blueprint/`.
- Never leave `change-log.md` stale relative to a pack's `status.md`.
- Greenfield implementation is REQ-INIT packs, not a monolith Phase 3. Phase R gaps are REQ-R packs.
- Resume from `change-log.md` plus `build-program.md` if present. Merged overview comes from `project/status.md`.

## How deviation-only works in practice

Suppose your API uses the default `/api/v1` prefix, JWT bearer auth, and the standard envelopes. An endpoint spec then reads as just the facts specific to that endpoint:

```md
| ID | Method | Route | Auth | Input | Return | Service | Status |
|----|--------|-------|------|-------|--------|---------|--------|
| EP-AUTH-01 | POST | /auth/login | public | LoginDto | AuthResponseDto | SVC-AUTH-01 | done |
```

The `public` value is meaningful precisely *because* the default is authenticated. If your product used a different prefix or a session-cookie model, that would be recorded once in `project/profile.md` and the specs would still stay this short.

The same applies to Phase R: when scanning existing code, the flow's instruction is that if auth matches the global default, do not repeat it — note only `@Public()` routes and custom guards.

## Related

- [Engine rules](06-engine-rules.md) — the coding conventions behind these defaults
- [Status and IDs](03-status-and-ids.md)
- [Templates](05-templates.md)
- [Verification checks](08-verification-checks.md)
