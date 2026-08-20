# Change Request Template — Detailed Guide

> This is the verbose reference for `../change-request-template.md`. Contains the full discovery interview questions, field reference, and change-type definitions.

## How to Use

**Path 1 — User fills it.** Create `project/changes/change-<ID>-<slug>/change-request.md` from the template block, replace placeholders, tell AI "Start Phase 5".

**Path 2 — AI interviews you (default).** Describe the change in one sentence. AI runs the structured Discovery Interview, drafts `change-request.md`, and asks for confirmation before proceeding.

The interview → draft → confirm gate is **mandatory**: the AI never proceeds past the change request until you explicitly confirm it.

## Field Reference

### `change-type`

| Type | When to use |
|------|-------------|
| `new-feature` | Adding a feature to an existing module |
| `new-module` | Adding an entirely new domain |
| `new-app` | Creating an entirely new application |
| `modify-feature` | Changing how an existing feature behaves |
| `modify-endpoint` | Adding, removing, or changing an API endpoint |
| `modify-page` | Adding, removing, or changing a frontend page |
| `modify-service` | Changing internal or external service logic |
| `modify-data-model` | Adding/removing fields, collections, indexes, or enums |
| `refactor` | Restructuring code without changing external behavior |
| `bug-fix` | Fixing incorrect behavior with minimal scope |
| `general` | Mixed or cross-cutting change |

### `target-app`

| Value | Means |
|-------|-------|
| `customer-portal` | Existing user-facing web app |
| `admin-panel` | Existing admin web app |
| `new-[name]` | A new application being created |
| `backend-only` | No frontend impact |
| `all-apps` | Affects all existing applications |

### `affected-repos`

| Value | Means |
|-------|-------|
| `backend` | Only the backend API repo |
| `frontend` | Only the customer-portal frontend repo |
| `admin` | Only the admin frontend repo |
| `frontend+admin` | Both Angular apps |
| `backend+frontend` | API + customer portal |
| `backend+admin` | API + admin panel |
| `new-repo:[name]` | A new repository for a new app |
| `all` | All existing repos |

## Full Discovery Interview Questions

### Section 1 — Business Context (always)

1. **Problem / motivation** — what business or user problem does this solve?
2. **Who is affected** — which users, roles, or apps?
3. **Desired outcome** — describe the end state in 1-2 sentences
4. **Out of scope** — what is explicitly not part of this change?
5. **Constraints & dependencies** — anything that must not break?
6. **Priority** — high / medium / low, and why?

### Section 2 — Type-Specific Technical Details (always)

#### `new-feature`
1. Which existing module?
2. Happy path step by step
3. Trigger (button, schedule, event, service call)
4. Backend requirement (new endpoint, service, or both)
5. Frontend requirement (new page, component, or none)
6. New data (fields, collections, enums)
7. Third-party / AI usage

#### `new-module`
1. Business capability (one sentence)
2. Features list
3. Module dependencies
4. New entities and relationships
5. Surface (backend-only or has frontend)
6. External integrations
7. Phase 1 scope (minimal features)

#### `new-app`
1. Why a separate app?
2. Platform (web, iOS, Android, cross-platform)
3. Tech stack
4. Auth strategy
5. Reuse vs new (existing modules/features)
6. First screens list
7. Backend (shared or separate)

#### `modify-feature`
1. Which feature (exact name from features)
2. Current behavior
3. Desired behavior
4. Must-not-break dependencies
5. Ripple risk
6. Data compatibility / migration

#### `modify-endpoint`
1. Which endpoint (METHOD + route, or "new")
2. What changes (input, output, auth, validation, logic)
3. Callers (pages, services, external clients)
4. Versioning (new route version or in-place)
5. Service linkage

#### `modify-page`
1. Which page (route and name, or "new")
2. UI change description
3. State changes (loading/empty/error/success)
4. Backend dependency
5. Style (answer Section 6 — Frontend Style)

#### `modify-service`
1. Which service (name, internal or external)
2. Method changes
3. Callers and impact
4. Provider change (for external services)
5. Side effects

#### `modify-data-model`
1. Which entity
2. Field changes (name, type, required, default, constraints)
3. Existing data migration
4. Index and enum changes
5. Consumers (services, endpoints, pages affected)

#### `refactor`
1. What and why
2. Behavior guarantee (100% identical externally)
3. Boundaries (out of scope)
4. Verification plan

#### `bug-fix`
1. Symptom (incorrect behavior, repro steps)
2. Expected vs actual
3. Root cause (known or suspected)
4. Smallest safe fix
5. Regression risk

#### `general`
Ask Section 1 first, then identify every distinct area and ask the matching type-specific block for each.

### Section 3 — Data & Integrations (conditional)

1. New collections, fields, enums, or indexes?
2. New third-party API, SDK, or service?
3. Changes to existing integrations?
4. Async / background jobs?
5. AI usage (LLM, embedding, classification)?

### Section 4 — Security & Permissions (conditional)

1. Who can trigger it (roles/actors)?
2. Ownership checks (own data only, or admin on any)?
3. Auth level (public, authenticated, role-restricted)?
4. Sensitive data (PII, financial, passwords, tokens)?
5. Audit trail needed?
6. Rate limiting / abuse risk?

### Section 5 — Edge Cases & Errors (conditional)

1. Invalid input handling?
2. Empty / not found behavior?
3. Partial failures (batch/bulk)?
4. Concurrent action risks?
5. External failure handling (retry, fail silently, surface error)?
6. Rollback / undo path?

### Section 6 — Frontend Style (only when frontend is touched)

1. Which app and pages change visually?
2. Design system (match existing or new direction)?
3. Reference (screenshot, mockup, Figma link)?
4. Layout & components preferences?
5. UI states appearance?
6. RTL / localization requirements?
