# Templates

The engine ships 21 templates in [engine/templates/](../../engine/templates/) plus 13 reference guides in [engine/templates/references/](../../engine/templates/references/).

Templates are copied into `project/` when a flow step runs. Reference guides are not — they stay in the engine as instructions for whoever is filling the template in.

## Phase legend

| Phase | Flow |
|-------|------|
| 0–4 | [Initial build](../flows/01-initial-build.md) |
| 5 | [Change mode](../flows/02-change-mode.md) |
| P | [Polish](../flows/03-polish.md) |
| 6 | [Bug fix](../flows/04-bug-fix.md) |
| R | [Reverse engineer](../flows/05-reverse-engineer.md) |

Pack lifecycle templates — change request, impact, status, blueprint index, verification, merge report — are shared across Phase 3.x, Phase 5, Phase P, and Phase 6 Path A.

## Main blueprint templates

### `profile-template.md`

**Output:** `project/profile.md` · **Phase:** 0 (Step 0.0b), R.0

System identity. Sections: Product, Applications table (Key, App, Type, Repo, Framework, UI library, Auth), Repositories, Tech Stack, Brand Tokens, Environments, Integrations, System Conventions.

The **Key** column is the highest-leverage field in the whole blueprint: it defines `target-app` values and the `project/actions/<key>/` folder names.

### `description-template.md`

**Output:** `project/description.md` · **Phase:** 0 (Step 0.1B), R.2.4

Product definition driving all downstream planning. Sections: 1 Product Summary, 2 Core Workflow, 3 Core Features, 4 Key Entities, 5 User Roles, 6 Integrations, 7 Tech and Constraints, 8 Business Rules, 9 Out of Scope, 10 Success Criteria.

### `modules-template.md`

**Output:** `project/plan/modules.md` · **Phase:** 1 (Step 1.1), R.2.1

Module map and feature inventory. Per module: Scope, Audience, Entities, Depends on. Features are listed inline with visibility tags `[both]`, `[backend-only]`, `[frontend]`. There is no separate features file.

### `custom-feature-rules-template.md`

**Output:** `project/rules.md` · **Phase:** 1 (Step 1.2), R.2.3

Project-specific rules for special features. Per rule: Type (AI, Integration, Async Job, Storage, Security, Business Logic), Must, Provider, Must not. Each references a specific module and feature.

### `data-model-template.md`

**Output:** `project/plan/data-model.md` · **Phase:** 1 (Step 1.3), R.1.1

Persistence model. Conventions section (primary keys, timestamps), then per entity: Purpose, a field table (Field, Type, Constraints, Ref), Relations, Indexes.

### `services-template.md`

**Output:** `project/actions/<api-app>/services/<module>.md` · **Phase:** 2 (Step 2.1), R.1.2, and pack blueprints in Phase 5

Per-module backend service specs. Per service: `SVC-<MODULE>-NN` ID, Status, Methods, Dependencies, Side effects, Rules, and type (`internal` or `external`).

### `endpoints-template.md`

**Output:** `project/actions/<api-app>/endpoints/<module>.md` · **Phase:** 2 (Step 2.2), R.1.3, and pack blueprints in Phase 5

Per-module API endpoint tables. Columns: ID (`EP-<MODULE>-NN`), Method, Route, Auth, Input, Return, Service, Status, Notes.

### `pages-template.md`

**Output:** `project/actions/<app-key>/pages/<module>.md` · **Phase:** 2 (Step 2.3), R.1.4, and pack blueprints in Phase 5 and P

Per-module web page specs. Per page: Route, Status, Components, Service and the EP-IDs it calls, Guard, Notes. Page IDs are `PG-<MODULE>-NN`.

### `views-template.md`

**Output:** `project/actions/<app-key>/views/<module>.md` · **Phase:** 2 (Step 2.3), R.1.4, and pack blueprints in Phase 5 and P

Per-module mobile screen specs. Per screen: Route or Navigation, Status, Components, Service and EP-IDs, Guard, Platform notes, Notes. View IDs are `VW-<MODULE>-NN`.

### `index-template.md`

**Output:** `services/_index.md`, `endpoints/_index.md`, `pages/_index.md`, or `views/_index.md` · **Phase:** created alongside Phase 2 specs, updated at every merge

The routing registry a reader loads *first* to find which module file to open, doubling as the build-status map for that directory.

```md
| Module | File | IDs / Route prefix | Status | Done/Total | Purpose |
|--------|------|--------------------|--------|-----------|---------|
| Auth | `auth.md` | `/auth` · `EP-AUTH-01..08` | done | 8/8 | login, refresh, password reset |
| Users | `users.md` | `/users` · `EP-USERS-01..06` | partial | 5/6 | admin user management (export deferred) |
| Billing | `billing.md` | `/billing` · `EP-BILLING-01..04` | planned | 0/4 | subscription + invoices |
```

Maintenance rule: update Status and `Done/Total` whenever an artifact in that module changes status. The module file is the source of truth; the registry is the summary. After updating any `_index.md`, refresh `project/status.md`.

### `status-template.md`

**Output:** `project/status.md` · **Phase:** 4 (Step 4.1), R.Done.1, refreshed after merges

System-wide build dashboard. Sections: Snapshot with per-app counts, By Module, In Progress (`partial`), Next Up (the roadmap), Deferred with reasons.

## Work pack and change templates

### `build-program-template.md`

**Output:** `project/changes/build-program.md` · **Phase:** 3.0 (`REQ-INIT`), R.Done.2 (`REQ-R`)

The ordered implementation queue. Metadata (`request-id`, Source, dates), slice rules, a packs table (Part, Pack folder, Module, Depends on, Target apps, Pack status, Notes), Progress metrics, Next pack, and instructions for materializing the pack folders.

### `change-log-template.md`

**Output:** `project/changes/change-log.md` · **Phase:** created at 3.0, Step 5.0.3, P.1, or any first pack creation

The live index of all packs. Summary counts by `pack-status`, then In flight, Completed, and Cancelled/blocked tables, plus maintenance rules including the datetime ID requirement.

### `change-request-template.md`

**Output:** `project/changes/change-<ID>-<slug>/change-request.md` · **Phase:** 5 (Step 5.0), 3.0, P.1

Structured change capture plus the discovery interview schema.

```md
## Metadata
- **date**: [YYYY-MM-DD]
- **change-type**: [new-feature | new-module | new-app | modify-feature | modify-endpoint |
                    modify-page | modify-service | modify-data-model | refactor | bug-fix | polish | general]
- **target-app**: [app-key from profile.md | new-[name] | backend-only | all-apps]
- **affected-repos**: [backend | frontend | admin | backend+frontend | new-repo:[name] | all]
- **priority**: [high | medium | low]
- **request-id**: [REQ-N | —]
- **part**: [N/M | —]
- **depends-on**: [change-<ID> | —]
- **blocks**: [change-<ID> | —]
- **pack-status**: [drafted | in-progress | verified | merged | cancelled | blocked]
```

Then Scope (modules, features, endpoints, pages/views, services), Description, Acceptance Criteria as numbered testable outcomes, and optional Notes.

The interview section map:

| # | Section | Mandatory | Skip when |
|---|---------|-----------|-----------|
| 1 | Core change definition | Always | — |
| 2 | Feature behavior, type-specific | Always | `polish` uses UI notes instead |
| 3 | Data and integrations | Conditional | `modify-page`, `modify-endpoint` I/O only, `refactor`, `polish` |
| 4 | Security and permissions | Conditional | Auth unchanged and no new endpoints; always skip for `polish` |
| 5 | Edge cases and errors | Conditional | Pure UI or `polish` |
| 6 | Summary and confirmation | Always | — |

### `impact-template.md`

**Output:** pack `impact.md` · **Phase:** 5 (Step 5.1), abbreviated in 3.0 and P.2

Code reconnaissance and impact analysis in one artifact. A recon table covering the schema, service, endpoint, and page layers; feature state; affected modules; the checklist of pack blueprint files; risk; recommendation; status targets; dependencies.

### `change-status-template.md`

**Output:** pack `status.md` · **Phase:** 5 (Step 5.3), 3.0, P

The per-pack artifact dashboard. `pack-status`, `request-id`, `depends-on`, Artifacts done, an artifacts table (ID/Name, Layer, Status, Notes), Blockers, Next action, and sync rules.

### `change-blueprint-index-template.md`

**Output:** pack `blueprint/_index.md` · **Phase:** 5 (Step 5.3), 3.0, P.2

The registry of artifacts a pack owns. Columns: Layer, File, IDs/Names, Status, Done/Total, Purpose. Plus the pack-level `Done/Total` and the delta rules.

### `verification-template.md`

**Output:** pack `verify-code.md`, and optionally `verify-plan.md` · **Phase:** 5 (Step 5.5), P.4, per-pack verify in 3.x

Pre-build plan consistency and post-build code verification. A plan consistency checklist, a code verification checklist, and a PASS/FAIL result.

The system-level Phase 4 report is separate and lives at `project/verify/verification-report.md`.

### `merge-report-template.md`

**Output:** pack `merge-report.md` · **Phase:** 5 (Step 5.6), P.5

What merged into main after verification passed. Merged date, `pack-status`, verified by, a table of main files updated, what was skipped, and post-merge checks.

### `new-app-template.md`

**Output:** used inside a change pack, not as a standalone main file · **Phase:** 5 (Step 5.1b)

Defines a new application when `change-type` is `new-app`, reusing the existing backend. Sections: New App Definition (app name, purpose, target platform, tech stack, auth strategy), Modules to Include, New Modules and Features, App Pages or Views.

### `bug-report-template.md`

**Output:** `project/bugs/bug-<ID>-<slug>.md` · **Phase:** 6 Path B (Steps 6.1–6.6)

An individual bug record. Status; Reported (date, severity, affected area); Description; Expected Behavior; Steps to Reproduce; Root Cause; Fix Applied; a verification checklist; Related Files.

Path A escalates to a change pack instead and only needs the bug-log row.

## Reference guides

The 13 files in [engine/templates/references/](../../engine/templates/references/) are verbose companions to the compact templates. Templates hold the schema and examples; guides hold section-by-section instructions, field dictionaries, extended formats, and completion checklists.

| Guide | Pairs with | What it adds |
|-------|------------|--------------|
| `description-template-guide.md` | description | Per-section field meanings, optional Section 11 Additional Context, a completion checklist before Phase 1 |
| `profile-template-guide.md` | profile | How to derive from existing code versus greenfield, Applications table rules, app-key to spec-folder mapping, mobile app guidance, completion checklist |
| `modules-template-guide.md` | modules | File-level rules, feature entry rules, recommended structure with Module Priority and Dependency Summary |
| `data-model-template-guide.md` | data model | Modeling principles, Collection Overview, Relationship Summary, embedded versus referenced, suggested enums, schema shape blocks, minimal first backend version |
| `custom-feature-rules-template-guide.md` | custom feature rules | Rule-type templates for AI, integration, async job, storage, and security; Global Feature Rules; when not to duplicate engine rules |
| `services-template-guide.md` | services | SVC-ID header format, internal versus external types, layering rules, extended entry format |
| `endpoints-template-guide.md` | endpoints | Column reference, the auth value table, envelope and pagination conventions |
| `pages-template-guide.md` | pages | Extended page entry with Type, Layout, and UI States; form, table, and shell conventions |
| `views-template-guide.md` | views | Extended screen entry, deep links, platform-native component guidance |
| `change-request-template-guide.md` | change request | Full discovery questions per change type, field reference, and the choice between the user filling it in versus the AI interviewing |
| `new-app-template-guide.md` | new app | When to use it, app-slug rules, module selection, client spec creation steps, the Step 5.1b checklist |
| `impact-template-guide.md` | impact | Ripple map extended format, reuse opportunities, plan-versus-code drift, the Step 5.1 done-when checklist |
| `verification-template-guide.md` | verification | File naming for `verify-plan.md` and `verify-code.md`, table-based extended checks for recon coverage, service coverage, auth, custom rules, and code layering |

**Templates with no guide** — these are self-contained: `index-template`, `change-log-template`, `change-status-template`, `change-blueprint-index-template`, `build-program-template`, `merge-report-template`, `status-template`, `bug-report-template`.

## Related

- [Project layout](02-project-layout.md) — which template creates which path
- [Conventions](04-conventions.md) — the defaults templates inherit
- [Extending and releasing](../contributing/02-extending-and-releasing.md) — adding a template
- [Initial build](../flows/01-initial-build.md)
