# How to Read This Example

This document explains how to use PollPulse to learn the RoyaScaff engine.

## Start here

1. Read `README.md` in the example root for how to run the app
2. Read `project/description.md` — what the product is
3. Read `project/profile.md` — apps, repos, stack, brand tokens

## Follow the engine phases

### Phase 1 — Plan
- `project/plan/modules.md` — three modules: Foundation, Auth, Polls
- `project/plan/data-model.md` — four entities
- `project/rules.md` — project-specific business rules

### Phase 2 — Actions (spec backlog)
- `project/actions/api/services/` — backend services by module
- `project/actions/api/endpoints/` — REST endpoints
- `project/actions/web/pages/` — frontend pages
- Each artifact has an ID (`SVC-AUTH-01`, `EP-POLLS-04`, `PG-POLLS-03`) and status

### Phase 3 — Build (work packs)
- `project/changes/build-program.md` — ordered pack queue (REQ-INIT)
- `project/changes/change-log.md` — live index of all packs
- Open any pack folder, e.g. `change-20260805-120002-init-auth/`:
  - `change-request.md` — scope and acceptance criteria
  - `blueprint/` — sliced specs to implement from
  - `impact.md` — which code files to create/modify
  - `verify-code.md` — pack-level verification
  - `merge-report.md` — what was merged into main

### Phase 4 — Verify
- `project/status.md` — build dashboard
- `project/verify/verification-report.md` — 15 consistency checks

## Traceability exercise

Pick one feature — e.g. **Voting**:

1. `modules.md` → Polls module → Voting feature
2. `data-model.md` → `votes` entity
3. `services/polls.md` → `SVC-POLLS-01.castVote()`
4. `endpoints/polls.md` → `EP-POLLS-04 POST /polls/:id/vote`
5. `pages/polls.md` → `PG-POLLS-03` Poll Detail Page
6. Code → `apps/api/src/modules/polls/` + `apps/web/src/pages/PollDetailPage.jsx`

## Key engine rules demonstrated

- **Blueprint isolation**: specs on main; implementation happened in pack folders first
- **Vertical slices**: each pack delivers one module end-to-end
- **Datetime pack IDs**: `change-20260805-120001-init-foundation` (not sequential numbers)
- **Resume pattern**: always read `change-log.md` → `build-program.md` → pack folder

## Next steps for engine improvement

Use this example to test:
- Whether templates produce consistent output
- Whether verification checks catch drift
- Whether a new model can resume from `change-log.md` alone
- Whether `/change-mode` works for a 4th feature (e.g. poll editing)
