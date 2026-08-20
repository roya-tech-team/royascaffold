---
change_id: CHG-MIGRATION-001
status: reconciled
intent: migration
risk: medium
baseline_revision: example-v1.2-workspace-2026-08-20
owners: [pollpulse-demo]
reviewers: [developer-owner]
depends_on: []
claimed_ids: [DOC-POLLPULSE-SYSTEM-MAP, DOC-POLLPULSE-PROFILE]
claimed_paths: [engine-1.3-sdlc-demo]
---

# Change — Migrate PollPulse Blueprint to v1.3

## Outcome

Create a layered v1.3 project blueprint from the actual v1.2 PollPulse blueprint and source without modifying legacy application code or inventing test evidence.

## Acceptance

1. Product behavior and preserved legacy IDs remain traceable.
2. All declared legacy demo files receive code-map ownership/classification.
3. Application status is `implemented`, not `verified`, where executable evidence is absent.
4. Requirements, domain/workflows/UML, design, contracts, implementation, quality, and operations layers exist.
5. v1.3 validation/index/context commands succeed.

## Decisions

- Use existing source in place rather than copy code.
- Preserve historical v1.2 pack claims but exclude them from canonical truth.
- Record missing tests/security/operations as debt.
- Use exact-reference Context Pack for the voting slice.

## Links

- [Impact](impact.md)
- [Execution plan](execution-plan.md)
- [Verification](verification.md)
- [Reconciliation](reconciliation.md)

