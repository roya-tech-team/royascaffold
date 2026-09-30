# Migration Execution Plan

### TASK-MIGRATION-001 · Build and validate the v1.3 PollPulse blueprint

- **Kind:** execution-task
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** pollpulse-demo
- **Satisfies:** `CHG-MIGRATION-001`
- **Verified by:** `EVD-MIGRATION-001`, `EVD-BLUEPRINT-001`, `EVD-WEB-BUILD-001`, `EVD-API-SYNTAX-001`

- Goal: produce an accurate layered blueprint and generated views without changing the legacy demo.
- Inputs: v1.2 blueprint, all API/web source/config files, v1.3 engine contract.
- Allowed paths: `engine-1.3-sdlc-demo/` only; read `example-v1.2/`.
- Forbidden: editing legacy source, inventing passing tests, declaring production readiness.
- Steps: inventory → model L0/L1 → design L2 → implementation/code-map L3 → quality/operations L4 → migration/change/evidence → validate/index/context.
- Checks: deterministic blueprint validation, local-link integrity, 40-file map, generated Context Pack budget, web build evidence.
- Done when: all checks pass and reconciliation record matches the canonical tree.
- Recovery: discard the new demo folder; legacy folder remains unchanged.
