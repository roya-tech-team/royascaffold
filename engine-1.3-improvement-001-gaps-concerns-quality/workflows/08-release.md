# Release Workflow

1. Select verified/reconciled changes and target environment/version.
2. Validate QDC/requirement/test/security/migration/operations readiness, evidence
   freshness, and routed adjudicator authority.
3. Confirm deployment sequence, smoke checks, monitoring, and rollback/runbook.
4. Execute only approved project-profile commands/procedures.
5. Capture source-bound, replayable, environment-safe evidence and observe health/signals.
6. Accept or roll back.
7. Create release record, link deployed artifacts/evidence, and close changes.

Reconciliation does not imply release; release does not upgrade missing verification evidence.
Unavailable runners, stale evidence, and `manual-required` or `inconclusive` checks do
not become PASS during release pressure.
