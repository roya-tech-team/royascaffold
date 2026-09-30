# Endpoints Template — Detailed Guide

> This is the verbose reference for `../endpoints-template.md`. Consult when you need field meanings, rules, or extended entry formats.

## File-Level Rules

- One file per module: `project/actions/<api-app>/endpoints/<module>.md`.
- Registry: `project/actions/<api-app>/endpoints/_index.md` (see `../index-template.md`).
- `<api-app>` is the API app's key from the Applications table in `project/profile.md`.
- Every endpoint must have a unique `EP-<MODULE>-NN` ID (see `royascaff/engine/conventions.md` → Artifact ID Scheme).
- Keep descriptions implementation-oriented and clear.
- Use backend meaning, not only frontend button behavior.
- If an endpoint is async, say so explicitly in the Notes column.
- If an endpoint is paginated, say so explicitly in the Notes column.
- If an endpoint is a lite endpoint (for dropdowns), say so explicitly.
- Endpoints call services — not repositories or external providers directly.
- Service methods referenced must exist in `services/<module>.md` (or another module's services file if shared).

## Column Reference

| Column | Meaning |
|--------|---------|
| `ID` | Unique endpoint identifier `EP-<MODULE>-NN` |
| `Method` | HTTP verb: GET, POST, PUT, PATCH, DELETE |
| `Route` | Exact API route path (relative to route prefix in conventions) |
| `Auth` | Access level: `public`, `authenticated`, `role:{role}`, `owner` |
| `Input` | Params, query, and body fields (compact) |
| `Return` | HTTP status + DTO/shape name |
| `Service` | `ServiceName.methodName()` — must exist in the app's `services/` specs |
| `Status` | Build state: `planned`, `partial`, `done`, `deferred` (see `royascaff/engine/conventions.md`). Defaults to `planned` when the endpoint is specced before code. |
| `Notes` | Pagination, async, soft-delete, snapshot; **for `deferred`, the reason** (e.g. `deferred: post-MVP`) |

## Auth Values

| Value | Meaning |
|-------|---------|
| `public` | No authentication required |
| `authenticated` | Any logged-in user |
| `role:{role}` | Requires specific role (e.g., `role:admin`) |
| `owner` | Only the resource owner (+ admin override) |

## Envelope & Pagination

Inherit from `royascaff/engine/conventions.md`:
- Success: `{ success: true, data: <payload> }`
- Error: `{ success: false, message, statusCode, error?, errors? }`
- Paginated lists: `{ data: T[], total, page, limit }`
