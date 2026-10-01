# Change Pack Status Template

Per-pack dashboard. Lives at `project/changes/change-<ID>-<slug>/status.md`.

Artifact statuses: `planned` · `partial` · `done` · `deferred` (see `royascaff/engine/conventions.md`).
Pack-level status also lives in `change-request.md` metadata and **must** match `project/changes/change-log.md`.

## Schema

```md
# Pack Status — change-<ID>-<slug>

- **pack-status**: drafted | in-progress | verified | merged | cancelled | blocked
- **request-id**: REQ-N | —
- **depends-on**: change-MMM | —
- **Artifacts done**: {done}/{total}

## Artifacts

| ID / Name | Layer | Status | Notes |
|-----------|-------|--------|-------|
| EP-USERS-07 | endpoint | planned | |
| SVC-USERS-02 | service | partial | method started |
| Users List Page | page | planned | |

## Blockers

- [dependency or reason, if pack-status is blocked]

## Next action

- [what the next implementer should do]
```

## Sync

- Update this file whenever an artifact status changes.
- Refresh `blueprint/_index.md` Done/Total.
- Mirror pack-status + Artifacts done into `change-log.md`.
