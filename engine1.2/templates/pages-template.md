# Pages Template (Web Apps)

Per-module page specs for one web app. Lives at `project/actions/<app-key>/pages/<module>.md` with a routing registry at `pages/_index.md`. For mobile apps, use `views-template.md` instead.

Layout contract: `royascaff/engine/project-layout.md`. Each page has a `PG-<MODULE>-NN` ID. Reference endpoints by `EP-<MODULE>-NN` IDs.

> Verbose guidance → `references/pages-template-guide.md`

## Schema — `pages/<module>.md`

```md
# Pages — {App Name} · {ModuleName}

### PageName `PG-MODULE-NN`

- Route: `/app/resource`
- Status: planned | partial | done | deferred
- Components: `FilterBar`, `DataTable`, `CreateDialog`
- Service: `ResourceService` → EP-RESOURCE-01 (GET /resource), EP-RESOURCE-02 (POST /resource)
- Guard: `authGuard` | `adminGuard` | `none`
- Notes: paginated list, create via modal dialog
```

Status: `planned` · `partial` · `done` · `deferred` (see `royascaff/engine/conventions.md`). New pages default to `planned`; `deferred` states its reason in Notes.

## Registry — `pages/_index.md`

Use `royascaff/engine/templates/index-template.md`. One row per module file.

## Example — `pages/users.md`

```md
# Pages — Customer Portal · Users

### Users List Page

- Route: `/app/users`
- Status: done
- Components: `UsersFilterBar`, `UsersTable`, `CreateUserDialog`
- Service: `UsersService` → EP-USERS-01 (GET /users), EP-USERS-05 (DELETE /users/:id)
- Guard: `adminGuard`
- Notes: paginated table with search/role filters; delete via confirmation dialog

### User Edit Page

- Route: `/app/users/:id/edit`
- Status: partial
- Components: `UserForm`, `RoleSelector`
- Service: `UsersService` → EP-USERS-03 (GET /users/:id), EP-USERS-04 (PATCH /users/:id)
- Guard: `adminGuard`
- Notes: combined create/edit form; role changes require admin — role selector not yet wired
```
