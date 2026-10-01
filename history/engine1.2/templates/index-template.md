# Registry (`_index.md`) Template

Every spec subdirectory (`services/`, `endpoints/`, `pages/`, `views/`) has an `_index.md` at its top. It is the **routing registry** a reader loads *first* to find which module file to open — and it doubles as the **build-status map** for that directory.

> Read this before scanning a directory. Load only the module files you need. Status values and ID scheme: `royascaff/engine/conventions.md`. Layout: `royascaff/engine/project-layout.md`.

## Schema

```md
# {Services|Endpoints|Pages|Views} Registry — {App Name}

> Status: `planned` · `partial` · `done` · `deferred` — see `royascaff/engine/conventions.md`. `Done/Total` counts built vs specced artifacts.

| Module | File | IDs / Route prefix | Status | Done/Total | Purpose |
|--------|------|--------------------|--------|-----------|---------|
| {ModuleName} | `{module}.md` | `EP-AUTH-01..08` | partial | 6/8 | short purpose |
```

- **Module** — module name (must match `project/plan/modules.md`).
- **File** — the per-module spec file in this directory.
- **IDs / Route prefix** — ID range (`EP-<MODULE>-NN`, `SVC-<MODULE>-NN`) for backend, or route prefix for pages/views.
- **Status** — the **rolled-up** module status (see rollup rule in `royascaff/engine/conventions.md`).
- **Done/Total** — count of `done` artifacts vs total specced (deferred count as not-done). Omit for page/view registries if IDs aren't used — keep the Status column.
- **Purpose** — one line.

## Example — `project/actions/<api-app>/endpoints/_index.md`

```md
# Endpoints Registry — Backend API

> Status: `planned` · `partial` · `done` · `deferred` — see `royascaff/engine/conventions.md`. `Done/Total` counts built vs specced endpoints.

| Module | File | Route prefix | Status | Done/Total | Purpose |
|--------|------|--------------|--------|-----------|---------|
| Auth | `auth.md` | `/auth` · `EP-AUTH-01..08` | done | 8/8 | login, refresh, password reset |
| Users | `users.md` | `/users` · `EP-USERS-01..06` | partial | 5/6 | admin user management (export deferred) |
| Billing | `billing.md` | `/billing` · `EP-BILLING-01..04` | planned | 0/4 | subscription + invoices |
```

## Maintenance

- Update the row's **Status** and **Done/Total** whenever an artifact in that module file changes status.
- Keep the registry consistent with the per-artifact status in the module files — the module file is the source of truth; the registry is the summary.
- After updating any `_index.md`, refresh `project/status.md` so the system dashboard matches.
