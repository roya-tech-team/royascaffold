# Endpoints Template

Per-module endpoint tables for one API app. Lives at `project/actions/<api-app>/endpoints/<module>.md` with a routing registry at `endpoints/_index.md`. Each endpoint has an `EP-<MODULE>-NN` ID for cross-referencing.

Layout contract: `royascaff/engine/project-layout.md`. ID scheme: `royascaff/engine/conventions.md` → **Artifact ID Scheme**.

> Verbose guidance → `references/endpoints-template-guide.md`

## Schema — `endpoints/<module>.md`

```md
# Endpoints — {API App Name} · {ModuleName}

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-{MODULE}-01 | GET | /resource | role:admin | `?page,limit,search` | `200 PaginatedDto` | `SvcName.list()` | done | paginated |
| EP-{MODULE}-02 | POST | /resource | authenticated | `body: CreateDto` | `201 ResourceDto` | `SvcName.create()` | done | — |
| EP-{MODULE}-03 | GET | /resource/:id | authenticated | `param: id` | `200 ResourceDto` | `SvcName.findOne()` | partial | shape TBD |
| EP-{MODULE}-04 | PATCH | /resource/:id | role:admin | `param: id, body: UpdateDto` | `200 ResourceDto` | `SvcName.update()` | planned | — |
| EP-{MODULE}-05 | DELETE | /resource/:id | role:admin | `param: id` | `204` | `SvcName.delete()` | deferred | soft-delete · deferred: post-MVP |
```

Auth values: `public`, `authenticated`, `role:{role}`, `owner`.
Status values: `planned` · `partial` · `done` · `deferred` (see `royascaff/engine/conventions.md`). New endpoints default to `planned`; `deferred` states its reason in Notes.

## Registry — `endpoints/_index.md`

Use `royascaff/engine/templates/index-template.md`. One row per module file; record ID ranges (e.g. `EP-USERS-01..06`).

## Example — `endpoints/users.md`

```md
# Endpoints — Backend API · Users

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-USERS-01 | GET | /users | role:admin | `?page,limit,search,role,isActive` | `200 PaginatedUsersResponse` | `UsersService.listUsers()` | done | paginated |
| EP-USERS-02 | POST | /users | role:admin | `body: CreateUserDto` | `201 UserDto` | `UsersService.createUser()` | done | — |
| EP-USERS-03 | GET | /users/:id | role:admin | `param: id` | `200 UserDto` | `UsersService.findOne()` | done | — |
| EP-USERS-04 | PATCH | /users/:id | role:admin | `param: id, body: UpdateUserDto` | `200 UserDto` | `UsersService.updateUser()` | done | — |
| EP-USERS-05 | DELETE | /users/:id | role:admin | `param: id` | `204` | `UsersService.deleteUser()` | done | soft-delete |
| EP-USERS-06 | GET | /users/lite | authenticated | `?search` | `200 UserLiteDto[]` | `UsersService.listLite()` | planned | for dropdowns |
```
