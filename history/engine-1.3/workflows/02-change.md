# Change Workflow

Use for new/changed behavior, contracts, data, architecture, dependencies, migrations, or knowledge-only decisions.

1. Capture outcome, source, acceptance, non-goals, and baseline in `changes/active/<id>/change.md`.
2. Route intent/risk; check dependencies and active ownership conflicts.
3. Analyze every layer as changed/referenced/unchanged/not-applicable.
4. Draft after-state deltas for requirements/workflows/design/implementation/quality/operations.
5. Obtain required reviews and set `approved`.
6. Write executable tasks, evidence plan, rollout/rollback where applicable.
7. Build/validate Context Packs; set `ready`.
8. Implement only approved tasks. New public/design scope returns to analysis.
9. Verify deterministic checks, evidence coverage, and semantic findings.
10. Preview reconciliation, resolve conflicts, apply canonical after-state, regenerate, validate.
11. Release/monitor if applicable; archive and close.

Knowledge-only changes omit code tasks/evidence and use semantic/traceability review appropriate to the changed facts.

