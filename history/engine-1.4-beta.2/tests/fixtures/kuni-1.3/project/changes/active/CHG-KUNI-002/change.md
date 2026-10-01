---
change_id: CHG-KUNI-002
status: reconciled
intent: feature
risk: medium
baseline_revision: CHG-KUNI-001-reconciled
owners: [knowledge-universe-team]
reviewers: [product-owner]
depends_on: [CHG-KUNI-001]
claimed_ids: [TASK-KUNI-005, TASK-KUNI-006]
claimed_paths: [src/features/graph]
---

# Change · Algorithms, semantic links, timeline

## Outcome

Let the explorer ask how two nodes meet, what the link means, who is influential, and when knowledge appears. Still dummy data. Still no server.

Source: stakeholder request 20 August 2026.

## Non-goals

Real knowledge ingestion, AI, search execution, persistence, graph databases, month-level calendars, analytics dashboards.

## Acceptance

`REQ-KUNI-019` through `REQ-KUNI-024`.

## Risk

Medium: new behavior, known local pattern, reversible.

## Affected layers

| Layer | State | Reason |
|-------|-------|--------|
| Business/requirements | changed | new outcome and requirements |
| Domain/workflows | changed | path and timeline |
| Architecture/experience/data | changed | year field, analysis module, chrome |
| Components/actions/tests | changed | new analysis and HUD |
| Security/operations/release | N/A | local prototype |

## Approvals

Stakeholder asked for the feature. Working interpretations `FND-KUNI-004` and `FND-KUNI-005` are recorded.

## Execution

See [execution plan](execution-plan.md).
