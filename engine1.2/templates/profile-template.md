# System Profile Template

Single source of truth for apps, repos, stack, brand, environments, integrations. Lives at `project/profile.md`.

**This file holds all system-specific facts.** Tech stack, brand tokens, product name, and providers never go in `royascaff/engine/` — only here.

> Verbose guidance → `references/profile-template-guide.md`

## Schema

```md
# System Profile

## Product
- **Name**: [name]  **Type**: [SaaS|mobile|tool]  **Users**: [roles]

## Applications
| Key | App | Type | Repo | Framework | UI lib | Auth |
|-----|-----|------|------|-----------|--------|------|
| `key` | Name | api/web/mobile-* | `repo` | fw | lib/— | strategy |

## Repositories
| Repo | Role | Location | Branch |
|------|------|----------|--------|

## Tech Stack
**Backend**: [lang, fw, DB, async] — **Frontend**: [fw, UI, i18n]

## Brand Tokens
| Token | Value | Role |
|-------|-------|------|

## Environments
[config location, API URL, secrets, env list]

## Integrations
| Provider | Purpose | Notes |
|----------|---------|-------|

## System Conventions
[i18n, source-of-truth, app-reuse rules]
```

Key = `target-app` in changes = folder under `project/actions/`.
Type → specs (per-module): api → `services/` + `endpoints/`; web → `pages/`; mobile-* → `views/`. See `royascaff/engine/project-layout.md`.

## Example

```md
## Product
- **Name**: ProposalFlow  **Type**: SaaS  **Users**: admin, sales_manager, sales_rep

## Applications
| Key | App | Type | Repo | Framework | UI lib | Auth |
|-----|-----|------|------|-----------|--------|------|
| `backend` | API | api | `pf-api` | NestJS 11 | — | JWT |
| `portal` | Portal | web | `pf-portal` | Angular 21 | PrimeNG | same-backend JWT |

## Tech Stack
**Backend**: TS+NestJS, MongoDB, BullMQ — **Frontend**: Angular+PrimeNG, ngx-translate

## Integrations
| Provider | Purpose | Notes |
|----------|---------|-------|
| Claude | Proposal gen | swappable |
```
