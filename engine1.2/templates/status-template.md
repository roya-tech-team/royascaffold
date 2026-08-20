# Status Dashboard Template

The single **bird's-eye view** of the whole system's build state. Lives at `project/status.md`. Any human or AI reads this first to answer **"where are we, and what is left to build?"** without scanning every spec file.

> This file is a **summary**, rolled up from the per-artifact status in `project/actions/**` and the `_index.md` registries. It must always agree with them. History of *what changed* stays in `project/changes/change-log.md`; this file is the *current state + roadmap*, not the history. Status values: `planned` · `partial` · `done` · `deferred` (see `royascaff/engine/conventions.md`).

## Schema

```md
# Project Status

_Last updated: {YYYY-MM-DD} — after {change/build reference}_

## Snapshot

| App | Services | Endpoints | Pages/Views | Overall |
|-----|----------|-----------|-------------|---------|
| {api-app} | {done}/{total} | {done}/{total} | — | {planned/partial/done} |
| {web-app} | — | — | {done}/{total} | {planned/partial/done} |

## By Module

| Module | Services | Endpoints | Pages/Views | Status |
|--------|----------|-----------|-------------|--------|
| {Module} | {done}/{total} | {done}/{total} | {done}/{total} | {status} |

## In Progress (`partial`)

- {App · Module · artifact ID} — what remains to finish

## Next Up (roadmap, ordered)

1. {Module / feature} — what and why, in build order (services → endpoints → pages)
2. ...

## Deferred (`deferred`)

| Artifact | App · Module | Reason | Revisit when |
|----------|--------------|--------|--------------|
| {ID / name} | | why postponed | trigger/date |
```

## Example

```md
# Project Status

_Last updated: 2026-07-02 — after change-20260702-141530 (billing endpoints)_

## Snapshot

| App | Services | Endpoints | Pages/Views | Overall |
|-----|----------|-----------|-------------|---------|
| backend | 12/15 | 22/28 | — | partial |
| web | — | — | 9/14 | partial |

## By Module

| Module | Services | Endpoints | Pages/Views | Status |
|--------|----------|-----------|-------------|--------|
| Auth | 3/3 | 8/8 | 3/3 | done |
| Users | 2/2 | 5/6 | 3/4 | partial |
| Billing | 1/4 | 0/4 | 0/3 | planned |

## In Progress (`partial`)

- backend · Users · EP-USR-06 (GET /users/export) — CSV streaming not wired
- web · Users · User Edit Page — role selector missing

## Next Up (roadmap, ordered)

1. Billing services (SVC-BIL-01..04) — needed before billing endpoints
2. Billing endpoints (EP-BIL-01..04)
3. Billing pages (plans, invoices)

## Deferred (`deferred`)

| Artifact | App · Module | Reason | Revisit when |
|----------|--------------|--------|--------------|
| EP-USR-07 (bulk import) | backend · Users | post-MVP | after launch |
```

## Maintenance

- Refresh this file at the end of every flow that changes status: initial build (Phase 3/4), change mode (Step 5.6 / FT-5.3), reverse-engineer (R.Done), and bug fixes that complete deferred work.
- **In Progress**, **Next Up**, and **Deferred** are the sections a resuming model relies on — keep them accurate.
- Counts and per-module status are rolled up from the `_index.md` registries.
