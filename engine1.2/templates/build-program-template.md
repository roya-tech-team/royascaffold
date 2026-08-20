# Build Program Template

Ordered, resumable implementation units for Initial Build (`REQ-INIT`) or Phase R handoff (`REQ-R`).
Lives at `project/changes/build-program.md`.

Each row becomes (or links to) a change work pack under `project/changes/`. Pack lifecycle = Change Mode (implement → verify → merge). Index: `change-log.md`.

> Layout: `royascaff/engine/project-layout.md`. Isolation: implement from pack `blueprint/` only; update main at merge.

## Schema

```md
# Build Program

- **request-id**: REQ-INIT | REQ-R
- **Source**: Initial Build Phase 2 | Phase R.Done
- **Created**: YYYY-MM-DD
- **Last updated**: YYYY-MM-DD

## Slice rules

- Vertical slice per module: data-model slice → services → endpoints → pages/views
- Order: foundation (app shell / shared infra) → Auth → modules by dependency (`modules.md`) → cross-cutting (jobs, integrations) last
- Shared `request-id` across all packs in this program

## Packs (ordered)

| Part | Pack folder | Module / scope | Depends on | Target apps | Pack status | Notes |
|------|-------------|----------------|------------|-------------|-------------|-------|
| 1/N | `change-20260729-100001-init-foundation/` | foundation | — | backend, portal | drafted | app shell, shared config |
| 2/N | `change-20260729-100002-init-auth/` | Auth | change-20260729-100001 | backend, portal | blocked | |
| 3/N | `change-20260729-100003-init-users/` | Users | change-20260729-100002 | backend, portal | blocked | |

## Progress

| Metric | Value |
|--------|-------|
| Packs total | N |
| Merged | 0 |
| In flight | 0 |
| Blocked / drafted | N |
| Deferred | 0 |

## Next pack

- **Default**: first pack whose `depends-on` is `verified` or `merged` (or empty) and status is not `merged`/`cancelled`
- **Resume**: read `change-log.md`, then this file, then open that pack folder
```

## Materializing packs

For each row, create `project/changes/change-<ID>-init-<slug>/` (or `…-r-<slug>/` for REQ-R):

1. `change-request.md` — `request-id` from this program; `part: N/M`; `depends-on`; `pack-status: drafted` or `blocked`
2. `blueprint/` — slice from **main** specs for that module only (plan + actions)
3. `status.md` + `blueprint/_index.md`
4. Register row in `change-log.md`

Do **not** start code until the user picks a pack (default: first unblocked).
