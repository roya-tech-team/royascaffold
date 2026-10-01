# Services Template

Per-module service specs for one API app. Lives at `project/actions/<api-app>/services/<module>.md` with a routing registry at `services/_index.md`. Created **before** endpoints — endpoints reference services.

Layout contract: `royascaff/engine/project-layout.md`. ID scheme: `royascaff/engine/conventions.md` → **Artifact ID Scheme**.

> Verbose guidance → `references/services-template-guide.md`

## Schema — `services/<module>.md`

```md
# Services — {App} · {Module}

### SVC-{MODULE}-01 · ClassName [category, type, Module]
- Status: planned | partial | done | deferred
- Methods:
  - `method(input): Return` — what it does
- Deps: `Repo`, `OtherService`, `Provider`
- Side effects: email | file | async | none
- Rules: business rule
```

Type: `internal` (business logic) or `external` (third-party adapter).
Status: `planned` · `partial` · `done` · `deferred` (see `royascaff/engine/conventions.md`). New services default to `planned`; `deferred` states its reason (e.g. `deferred: waiting on provider`).

## Registry — `services/_index.md`

Use `royascaff/engine/templates/index-template.md`. One row per module file.

## Example — `services/users.md`

```md
# Services — Backend API · Users

### SVC-USERS-01 · UsersService [domain, internal, Users]
- Status: done
- Methods:
  - `createUser(dto): User` — validate, hash password, persist
  - `listUsers(query): PaginatedResponse` — paginated admin list
  - `deleteUser(id): void` — soft-delete
- Deps: `UsersRepository`
- Side effects: none
- Rules: email unique; never return password hashes
```

## Example — `services/files.md`

```md
# Services — Backend API · Files

### SVC-FILES-01 · ObjectStorageProvider [integration, external, Files]
- Status: planned
- Methods:
  - `getPresignedUploadUrl(key, type): PresignedUrl` — PUT URL
  - `deleteObject(key): void` — remove from bucket
- Deps: storage SDK (from env config)
- Side effects: file upload/delete on remote storage
- Rules: config-driven credentials; never called from controllers
```
