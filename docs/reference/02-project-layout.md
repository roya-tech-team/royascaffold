# Project layout

Source: [engine/project-layout.md](../../engine/project-layout.md)

The contract for what the engine creates and where. Load it whenever you need to know where a file belongs.

## Product model

| Zone | Shipped with RoyaScaff | Role |
|------|------------------------|------|
| `royascaff/engine/` | Yes — the product | How to build: flows, templates, rules, this layout |
| `project/` | No — created by the engine | What this system is: the SSOT blueprint |

**Rebuild test:** after a merge, copying `project/` alone must be enough to understand and rebuild the implemented app.

**Engine purity:** `royascaff/engine/` never contains system-specific data. Those facts live only in generated `project/profile.md`.

## Isolation invariant

> During implementation, edit packs — not main. Main receives updates at merge, after verification passes.

- In-flight work lives only inside a work pack under `project/changes/change-<ID>-<slug>/`
- Do not edit main plan, actions, rules, profile, or description while a pack is in flight
- Main files may be **read** for context. Phase 2 and Phase R may **write** the roadmap to main with `planned`, `partial`, or `done`
- In-flight progress lives in `changes/change-log.md` and the pack's `status.md`, plus `build-program.md` for REQ-INIT and REQ-R

## Bootstrap gate

Run before any phase that writes blueprint files.

1. Check whether `project/` exists at the workspace root, or at the path designated as the blueprint root.
2. **If missing** — create the root skeleton below, directories only, with no README placeholders. Then continue the active flow, creating each file from its template when that step runs.
3. **If present** — do not recreate.
4. **Phases 5, P, and 6** require an existing blueprint. If `project/profile.md` is missing, stop and route to Phase 0 or Phase R.

Default blueprint root: `<workspace>/project/`.

### Root skeleton

```text
project/
  plan/
  actions/
  changes/
  bugs/
  verify/
  docs/
```

Do **not** create placeholder READMEs. Structure and purpose are defined by this contract and the templates.

## Full layout

Files the engine creates over time.

```text
project/
  profile.md
  description.md
  rules.md
  status.md                  # build-state dashboard (done + planned backlog)
  plan/
    modules.md
    data-model.md
    roles-and-authorization.md
  actions/
    <api-app-key>/
      services/_index.md + <module>.md
      endpoints/_index.md + <module>.md
    <web-app-key>/
      pages/_index.md + <module>.md
    <mobile-app-key>/
      views/_index.md + <module>.md
  changes/
    change-log.md            # LIVE INDEX - all changes + pack-status
    build-program.md         # REQ-INIT / REQ-R ordered pack queue
    change-<ID>-<slug>/      # work pack
  bugs/
    bug-log.md               # LIVE INDEX - PENDING | DONE | ESCALATED
    bug-<ID>-<slug>.md       # Path B direct fixes
  verify/
    verification-report.md
    reverse-engineer-report.md
  docs/
```

## Pack and bug IDs

> **Never use sequential counters** (`001`, `002`, `change-02`, `bug-01`). Parallel branches allocate the same next number and collide on merge.

### Format

| Kind | Path pattern | Example |
|------|--------------|---------|
| Change, polish, or escalated bug pack | `changes/change-<ID>[-<kind>]-<slug>/` | `change-20260729-125201-billing-api/` |
| Init or reverse-engineer pack | `changes/change-<ID>-init-<slug>/` or `…-r-<slug>/` | `change-20260729-125205-init-auth/` |
| Direct bug report (Path B) | `bugs/bug-<ID>-<slug>.md` | `bug-20260729-130044-login-500.md` |

`<ID>` is the **local datetime** `YYYYMMDD-HHMMSS` at creation time.

Datetime rather than a short hash because it is lexicographically sortable, human-readable, and unique across branches without a shared counter.

### Generation rules

1. Compute `<ID>` from the machine's local clock as `YYYYMMDD-HHMMSS`.
2. If that path already exists — a same-second collision, including batch creation — append `-` plus four lowercase hex characters: `20260729-125201-a3f2`.
3. When creating several packs in one session, each gets its **own** unique ID.
4. **Never** read a "next number" from the change-log or bug-log. Those counters were removed.
5. `depends-on` and `blocks` reference the peer by folder stem or ID: `change-20260729-125201` or the full `change-20260729-125201-init-auth`.
6. **Legacy:** existing `change-<NNN>-*` and `bug-<NNN>-*` folders stay valid. Do not renumber. New work always uses datetime IDs.

## Change work pack layout

```text
project/changes/change-<ID>-<slug>/
  change-request.md      # metadata, acceptance criteria, request-id, depends-on, pack-status
  impact.md
  status.md              # pack dashboard: per-artifact planned/partial/done
  blueprint/             # SELF-CONTAINED delta specs - implement from here
    plan/                # only touched slices (modules, data-model, rules excerpts)
    actions/
      <api>/services/<module>.md
      <api>/endpoints/<module>.md
      <web>/pages/<module>.md
      <mobile>/views/<module>.md
    _index.md            # what this pack owns + Done/Total
  verify-plan.md         # optional
  verify-code.md
  merge-report.md        # written at merge time
```

**Implementer load set** for any chat or user: `change-request.md`, `blueprint/`, `impact.md`, `status.md`.

### Delta writing rule

| Layer | Inside pack `blueprint/` | On merge into main |
|-------|--------------------------|--------------------|
| Data model | After-state of the affected entity plus a short `## Delta` note | In-place update — never append a change section at the bottom of a main file |
| Services, endpoints, pages | Only artifacts owned by this change, as after-state entries | Merge rows into main module files; refresh `_index.md` |
| Unchanged main content | Not copied | Untouched |

## Change log index contract

`project/changes/change-log.md` is a **live registry**, not a finished-work archive.

### Pack-status vocabulary

| Status | Meaning |
|--------|---------|
| `drafted` | Request and pack blueprint written; code not started |
| `in-progress` | Implementation started |
| `verified` | `verify-code.md` PASS; not yet merged into main |
| `merged` | Main blueprint updated; the pack is a historical record |
| `cancelled` | Abandoned; main never touched |
| `blocked` | Waiting on `depends-on` parts not yet `verified` or `merged` |

### Sync rules (mandatory)

1. Creating a change folder adds or updates the row immediately, as `drafted`.
2. Every pack-status transition updates the **same row** — never leave the index stale.
3. Mirror the pack's `Done/Total` into the In flight table's Artifacts done column.
4. Resuming any change or polish work means **reading `change-log.md` first**, then opening the folder.
5. Main `project/status.md` reflects merged work only; in-flight state lives in the change-log and pack `status.md`.

### Multi-part features

Flat folders sharing a `request-id` in metadata, for example `REQ-7`, with an optional `depends-on`. Each part has its own pack and its own change-log row. Independent parts may run in parallel; dependent parts stay `blocked` until their dependencies are `verified` or `merged`.

### Build programs

| request-id | Created by | Purpose |
|------------|------------|---------|
| `REQ-INIT` | Initial Build Step 3.0 | Slice Phase 2's planned main into ordered init packs |
| `REQ-R` | Phase R.Done.2 | Gaps and drift-fix items after reverse-engineering |

File: `project/changes/build-program.md`. Pack folders: `change-<ID>-init-<slug>/` or `change-<ID>-r-<slug>/`. Implement via change mode from Step 5.4 — never as a monolith Phase 3.

## When each path is created

| Path | Created by | Template |
|------|------------|----------|
| Root skeleton dirs | Bootstrap gate | — |
| `profile.md` | Phase 0 / R.0 | `profile-template.md` |
| `description.md` | Phase 0 / R | `description-template.md` |
| `plan/*`, `rules.md` | Phase 1 / R | modules, data-model, custom-feature-rules |
| `actions/<key>/…` | Phase 2 / R | services, endpoints, pages, views, index |
| `status.md` | Phase 2+ / R.Done / after merge | `status-template.md` |
| `changes/change-log.md` | First Phase 5 / P / 6 Path A / Build 3.0 / R.Done.2 | `change-log-template.md` |
| `changes/build-program.md` | Initial Build 3.0 / Phase R.Done.2 | `build-program-template.md` |
| `changes/change-<ID>-…/` | Phase 5 / P / 6 Path A / Build 3.0 / R.Done.2 | change-request, impact, change-status, blueprint index, merge-report |
| `bugs/…` | Phase 6 | `bug-report-template.md` |
| `verify/…` | Phase 4 / R.3 | `verification-template.md` |

## Actions layout rules

| App type | Folder | Spec structure |
|----------|--------|----------------|
| API | `actions/<api-key>/` | `services/_index.md` plus per-module, and `endpoints/_index.md` plus per-module |
| Web | `actions/<web-key>/` | `pages/_index.md` plus per-module |
| Mobile | `actions/<mobile-key>/` | `views/_index.md` plus per-module |

**Call chain:** `pages/*` or `views/*` → `endpoints/*` → `services/*` → repositories and providers

**IDs:** `SVC-<MODULE>-NN`, `EP-<MODULE>-NN`, `PG-<MODULE>-NN`, `VW-<MODULE>-NN`. See [Status and IDs](03-status-and-ids.md).

Folder names must match the app key exactly — lowercase, kebab-case. Shared libraries get no `actions/` folder; their exports are documented in the consuming app's files.

## Bugs

`project/bugs/` holds:

- `bug-log.md` — the live index: `PENDING`, `DONE`, `ESCALATED`, plus a link to the change folder when escalated
- `bug-<ID>-<slug>.md` — Path B direct fixes, with no main plan edits and the same datetime ID rules as packs

Path A escalates to a change work pack with `change-type: bug-fix`. Main stays untouched until that pack merges.

## Resume rule

1. If working on changes, polish, or bugs, read `project/changes/change-log.md` — and `project/bugs/bug-log.md` for bugs — **first**.
2. Then read `project/status.md` for merged build state.
3. If `project/` does not exist, start Phase 0 or Phase R. Do not invent product facts.

## Related

- [Concepts and glossary](01-concepts-and-glossary.md)
- [Status and IDs](03-status-and-ids.md)
- [Templates](05-templates.md)
- [Working as a team](../guides/05-working-as-a-team.md)
