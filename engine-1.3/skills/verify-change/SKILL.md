---
name: verify-change
description: Independently assess scope, acceptance, invariants, contracts, files, tests, evidence, and semantic findings.
---

# Verify Change

- Inputs: approved deltas/tasks, changed-file inventory, current source, test policy, evidence.
- Run deterministic validation first; semantic review cannot override failures.
- Map each requirement/invariant/NFR to fresh evidence.
- Results: PASS, FAIL, INCOMPLETE. Skipped requires reason/acceptance.
- High/critical risk verifier must be independent from implementer.

