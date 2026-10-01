---
change_id: CHG-KUNI-001
status: reconciled
intent: feature
risk: medium
baseline_revision: initial
owners: [knowledge-universe-team]
reviewers: [product-owner]
depends_on: []
claimed_ids: [TASK-KUNI-001, TASK-KUNI-002, TASK-KUNI-003, TASK-KUNI-004]
claimed_paths: [src, index.html, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json, tsconfig.node.json, tailwind.config.js, postcss.config.js]
---

# Change · First visual universe

## Outcome

Deliver the first Knowledge Universe milestone: a beautiful generic 3D network visualization with dummy data so the stakeholder can judge visual quality and interaction.

Source: stakeholder brief 20 August 2026 and `docs/reference/3d-network-reference.png`.

## Non-goals

Authentication, backend, database, API, AI, real knowledge ingestion, persistence, advanced search, analytics, Angular, Vue.

## Acceptance

All acceptance criteria on `REQ-KUNI-001` through `REQ-KUNI-018` and the NFR catalog.

## Risk

Medium because this is new user-visible behavior and a new rendering architecture. It is local, reversible, and has no money, identity, or data-retention impact.

## Affected layers

| Layer | State | Reason |
|-------|-------|--------|
| Business/requirements | referenced | first encoding of the approved brief |
| Domain/workflows | referenced | explore and inspect |
| Architecture/experience/data | changed | new client after-state |
| Components/actions/code/tests | changed | first implementation |
| Quality | referenced | observation plus typecheck |
| Security/operations/release | N/A | local prototype |

## Proposed after-state

A Vite React client that opens into a clustered 3D graph, with centralized visual language, dummy generation, hover and selection, glass chrome, and no server.

Decisions: `ADR-KUNI-001`, `ADR-KUNI-002`, `ADR-KUNI-003`, `ADR-KUNI-004`.

## Approvals

- Stakeholder authorized applying the full Initial Build flow through working application code for this first slice.
- Reviewed revision: this change at baseline `initial`.

## Execution

See [execution plan](execution-plan.md).

## History

- draft: routing and knowledge capture
- approved: stakeholder go-ahead for the first milestone
