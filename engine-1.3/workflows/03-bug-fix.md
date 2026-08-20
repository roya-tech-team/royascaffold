# Bug Fix Workflow

## Direct correction path

Allowed only when intended behavior is already approved and unchanged; no public contract, architecture, security policy, migration, or operational design changes; risk is low/medium and reversible.

Required:

- defect and expected requirement/workflow link;
- root cause before modification;
- scoped task and affected file owners;
- regression test or reason plus compensating evidence;
- fresh verification and code-map reconciliation.

## Change path

Use the normal Change workflow if intended knowledge is missing/wrong, or for security/privacy, money, data corruption, public contract, migration, irreversible side effect, or cross-system risk.

Production fixes include validation, rollout, and rollback notes proportional to risk.

