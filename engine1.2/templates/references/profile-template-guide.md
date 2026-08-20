# System Profile Template — Detailed Guide

> This is the verbose reference for `../profile-template.md`. Contains field meanings, the Applications table rules, and the completion checklist.

## How to Use

1. Create `project/profile.md` from the schema block.
2. Replace every placeholder with the system's real values.
3. **Existing codebase** → derive each value from actual repos (read `package.json`, config, env files, styles). Do not guess.
4. **Greenfield build** → fill in intended choices; mark anything undecided as `TBD` and resolve before Phase 1.

## Field Reference

### Product
- **Name** — product/system name
- **Summary** — 2-3 sentences: what it does and the core value
- **Type** — SaaS web app, mobile app, internal tool, API platform, etc.
- **Primary users** — roles/personas who use the system

### Applications Table
The most important section. Its **Key** column defines:
- `target-app` values used in change requests
- Per-app folder names under `project/actions/`

| Column | Meaning |
|--------|---------|
| Key | Short kebab-case id. Keep stable. |
| App | Human-readable name |
| Type | `api`, `web`, `mobile-ios`, `mobile-android`, `mobile-cross-platform` |
| Repo | Repository that holds this app |
| Framework | Primary framework + version |
| UI library | Component library (`—` for API) |
| Auth strategy | How this app authenticates |

### App Key → Spec Files

Per-module layout (see `royascaff/engine/project-layout.md`):

| Type | Folder | Spec structure |
|------|--------|----------------|
| `api` | `project/actions/<key>/` | `services/_index.md` + `services/<module>.md` · `endpoints/_index.md` + `endpoints/<module>.md` |
| `web` | `project/actions/<key>/` | `pages/_index.md` + `pages/<module>.md` |
| `mobile-*` | `project/actions/<key>/` | `views/_index.md` + `views/<module>.md` |

### Adding a Mobile App
Append a row with `mobile-*` Type, its own Key, repo, framework, and native UI library. Its screens are specified in `project/actions/<key>/views/<module>.md`. Mobile apps reuse the existing API — no duplicated business logic.

### Tech Stack & Brand (live here, not in engine)
`project/profile.md` is the **only** place for concrete stack (language, framework, DB, queues, storage), integration providers, brand tokens, and product name. `royascaff/engine/conventions.md` stays product-agnostic.

### Repositories
Include role and where each lives relative to workspace root, plus the active branch.

### Tech Stack
Concrete stack per layer: language/runtime, framework, database/ORM, async/jobs, key libraries, and source layout (folder structure).

### Brand Tokens
Design tokens: colors (CSS variable names + hex), typography, where defined in code. Mark `N/A` for API-only systems.

### Environments
Config/secrets location, API base URL mechanism, how backend reads secrets, named environments.

### Integrations
Every third-party provider with purpose and notes. Each is isolated behind an interface/adapter. Frontend never calls them directly. Note which are swappable and selection mechanism.

### System Conventions
Cross-cutting rules that are facts about *this* system: i18n/RTL, source-of-truth rules, app-reuse rules.

## Completion Checklist

- [ ] Product name, summary, type, and primary users filled in
- [ ] Every deployable app has a row in Applications with a stable Key
- [ ] Each app's Type is one of `api` / `web` / `mobile-*`
- [ ] Every app has a matching folder under `project/actions/<key>/`
- [ ] Repositories lists every repo with role and location
- [ ] Tech Stack documents each layer's stack and source layout
- [ ] Brand Tokens captured (or marked N/A)
- [ ] Environments describes config/secrets and API base URL mechanism
- [ ] Every provider appears in Integrations and is marked as isolated
- [ ] System Conventions captures cross-cutting facts
- [ ] No placeholder or TBD values remain
