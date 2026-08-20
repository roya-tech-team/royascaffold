# Change Blueprint Index Template

Registry of everything this work pack owns. Lives at `project/changes/change-<ID>-<slug>/blueprint/_index.md`.

Load this first inside the pack; then open only the listed blueprint files. Do not edit main `project/plan` or `project/actions` until merge.

## Schema

```md
# Blueprint Index — change-<ID>-<slug>

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| data-model | `plan/data-model.md` | User.phone | planned | 0/1 | add phone field |
| service | `actions/backend/services/users.md` | SVC-USERS-02 | planned | 0/1 | updateUser phone |
| endpoint | `actions/backend/endpoints/users.md` | EP-USERS-04 | planned | 0/1 | PATCH includes phone |
| page | `actions/portal/pages/users.md` | User Edit Page | planned | 0/1 | phone input |

**Pack Done/Total**: 0/4
```

## Rules

- One row per owned artifact (or per file if the file is a single coherent slice).
- `Done/Total` at pack level feeds `status.md` and `change-log.md`.
- Delta notes (`## Delta`) live inside each blueprint file; after-state entries are what implementers code against.
