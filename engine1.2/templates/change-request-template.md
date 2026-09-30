# Change Request Template

Structured interview to capture a change request. The AI interviews the user, then drafts `change-request.md` for confirmation before proceeding.

> Full discovery questions & field reference → `references/change-request-template-guide.md`

## Change Request Block

```md
# Change Request

## Metadata
- **date**: [YYYY-MM-DD]
- **change-type**: [new-feature | new-module | new-app | modify-feature | modify-endpoint | modify-page | modify-service | modify-data-model | refactor | bug-fix | polish | general]
- **target-app**: [app-key from profile.md | new-[name] | backend-only | all-apps]
- **affected-repos**: [backend | frontend | admin | backend+frontend | new-repo:[name] | all]
- **priority**: [high | medium | low]
- **request-id**: [REQ-N | —]          # shared id when a feature is split across packs
- **part**: [N/M | —]                  # this pack's part within the request
- **depends-on**: [change-<ID> | —]     # must be verified/merged before implement
- **blocks**: [change-<ID> | —]         # optional reverse hint
- **pack-status**: [drafted | in-progress | verified | merged | cancelled | blocked]

## Scope
- Module(s): [from modules.md]
- Feature(s): [from features]
- Endpoint(s): [EP-IDs or routes]
- Page(s)/View(s): [app-key: name]
- Service(s): [SVC-IDs or names]

## Description
[Result of the discovery interview]

## Acceptance Criteria
1. [testable outcome]

## Notes (optional)
[constraints, context]
```

## Interview: Mandatory vs Conditional Sections

| # | Section | Mandatory? | Skip when |
|---|---------|:----------:|-----------|
| 1 | Core Change Definition | ALWAYS | — |
| 2 | Feature Behavior (type-specific) | ALWAYS | `polish` (use UI notes instead) |
| 3 | Data & Integrations | conditional | `modify-page`, `modify-endpoint` (I/O only), `refactor`, `polish` |
| 4 | Security & Permissions | conditional | auth unchanged AND no new endpoints; always skip for `polish` |
| 5 | Edge Cases & Errors | conditional | pure UI / `polish` |
| 6 | Summary & Confirmation | ALWAYS | — |

**S1 — Core Change Definition**: problem/motivation, who affected, desired outcome, out of scope, constraints, priority. Ask if this is part of a multi-pack `request-id`.

**S2 — Feature Behavior**: ask the type-specific block matching change-type (see guide). For `polish`: target pages, visual goals, screenshots/Figma.

**S3 — Data & Integrations**: new collections/fields? new providers? async jobs? AI usage?

**S4 — Security & Permissions**: who can trigger? ownership checks? auth level? sensitive data? audit?

**S5 — Edge Cases & Errors**: invalid input? not found? partial failures? concurrency? external failure? rollback?

**S6 — Summary**: draft `change-request.md`, present for confirmation. Never proceed without approval.

## Isolation reminder

Specs for this change go under `change-<ID>-<slug>/blueprint/` — **not** into main `project/plan` or `project/actions` until merge. Register the pack in `project/changes/change-log.md` immediately.

## Example

```md
# Change Request

## Metadata
- **date**: 2026-06-22
- **change-type**: new-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-3
- **part**: 2/2
- **depends-on**: change-20260622-143010
- **blocks**: —
- **pack-status**: drafted

## Scope
- Module(s): Data
- Endpoint(s): EP-DATA-12
- Page(s)/View(s): customer-portal: files-list
- Service(s): SVC-DATA-04

## Description
Users need bulk-delete for CSV files. Removes DB records and storage objects. Only owners or admins can delete.

## Acceptance Criteria
1. POST bulk-delete accepts array of file IDs
2. Non-owned files return 403; others still process
3. Files-list page shows multi-select and Delete Selected
4. Confirmation dialog before deletion; list refreshes after success
```
