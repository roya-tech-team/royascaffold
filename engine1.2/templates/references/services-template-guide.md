# Services Template — Detailed Guide

> This is the verbose reference for `../services-template.md`. Consult when you need field meanings, rules, or extended entry formats.

## File-Level Rules

- One file per module: `project/actions/<api-app>/services/<module>.md`.
- Registry: `project/actions/<api-app>/services/_index.md` (see `../index-template.md`).
- Create **services** for a module **before** its endpoints. Endpoints call services; client pages call endpoints.
- Every service must have a unique `SVC-<MODULE>-NN` ID (see `royascaff/engine/conventions.md` → Artifact ID Scheme).
- Group services by module using the same module names from `project/plan/modules.md`.
- If a service is async, say so explicitly.
- If a service triggers side effects (email, webhooks, file upload), say so explicitly.
- Do not duplicate endpoint transport details (HTTP method, route) here.

## Service Types

| Type | Meaning | Examples |
|------|---------|----------|
| `internal` | Domain or application service. Owns business logic. | `UsersService`, `OrdersService` |
| `external` | Integration provider. Wraps a third-party SDK/API. | `ObjectStorageProvider`, `EmailProvider` |

## Layering Rules

- Controllers/endpoints must **not** call repositories or external APIs directly — they call **internal** services.
- **Internal** services may call repositories, other internal services, and **external** providers.
- **External** services must stay isolated per `backend-rule.md` (config-driven credentials, no vendor SDK in controllers).

## SVC- ID Header Format

```
### SVC-{MODULE}-{NN} · {ClassName} [{category}, {type}, {ModuleName}]
```

- **MODULE**: Uppercase module token (`USERS`, `AUTH`)
- **NN**: Two-digit sequence within the module file
- **ClassName**: PascalCase service or provider class name
- **category**: `domain` (core business logic), `application` (orchestration), or `integration` (third-party)
- **type**: `internal` or `external`
- **ModuleName**: Owning backend module from `modules.md`

## Extended Entry Format

```md
### SVC-USERS-01 · UsersService [domain, internal, Users]
- Status: done
- Methods:
  - `createUser(dto: CreateUserDto): User` — validate uniqueness, hash password, persist
  - `listUsers(query: ListUsersQuery): PaginatedResponse<User>` — admin list with filters
  - `deleteUser(id: string): void` — soft-delete; reject if last admin
- Deps: `UsersRepository`, `PasswordHasher`
- Side effects: none
- Rules:
  - email unique system-wide
  - never return password hashes
  - last-admin cannot be deleted
```

## Status

Use `planned` · `partial` · `done` · `deferred` from `royascaff/engine/conventions.md`. New services default to `planned`. When `deferred`, state the reason on the Status line.
