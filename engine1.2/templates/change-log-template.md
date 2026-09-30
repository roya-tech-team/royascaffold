# Change Log Template

Live registry of every change / polish / escalated bug-fix pack. Lives at `project/changes/change-log.md`.

**Not** an append-only archive of finished work — keep rows updated on every pack-status transition. See `royascaff/engine/project-layout.md` → Change log index contract · Pack and bug IDs · `royascaff/engine/conventions.md` → Main vs pack vs index.

## Schema

```md
# Change Log

_Last updated: {YYYY-MM-DD}_

## Summary

| pack-status | Count |
|-------------|------:|
| drafted | 0 |
| in-progress | 0 |
| verified | 0 |
| merged | 0 |
| cancelled | 0 |
| blocked | 0 |

## In flight (not merged)

| ID | Date | Type | Request | Depends on | Pack status | Artifacts done | Scope | Folder |
|----|------|------|---------|------------|-------------|----------------|-------|--------|
| 20260729-125201 | 2026-07-29 | new-feature | REQ-1 | — | in-progress | 2/5 | billing API | `change-20260729-125201-billing-api/` |

## Completed

| ID | Date | Type | Request | Pack status | Scope | Folder | Merged |
|----|------|------|---------|-------------|-------|--------|--------|
| 20260720-091500 | 2026-07-20 | new-feature | REQ-1 | merged | billing schema | `change-20260720-091500-billing-schema/` | 2026-07-21 |

## Cancelled / blocked

| ID | Pack status | Reason | Folder |
|----|-------------|--------|--------|
| — | — | — | — |
```

## Maintenance

1. On pack create → mint a datetime `<ID>` (`YYYYMMDD-HHMMSS`, see `project-layout.md`); add row under **In flight** with `pack-status: drafted`; bump Summary counts. **Do not** maintain a next-number counter.
2. On every status transition → move/update the **same** `ID` row; refresh Summary.
3. When `merged` → move row to **Completed**; set Merged date.
4. When `cancelled` or stuck `blocked` with a reason → **Cancelled / blocked** (or keep blocked in In flight with reason in Scope).
5. Artifacts done = `Done/Total` from the pack's `blueprint/_index.md` (via pack `status.md`).
