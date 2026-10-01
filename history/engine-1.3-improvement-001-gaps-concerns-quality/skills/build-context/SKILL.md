---
name: build-context
description: Compile a fresh, exact-reference Context Pack containing every task-relevant approved decision and no unrelated knowledge.
---

# Build Context

- Inputs: implementation-ready task, affected IDs, QDC/RDR/pattern trace, selected
  adapter contributions, relation policy, code map, and profile budget/tier.
- Include every task-relevant `must` criterion and material decision with provenance;
  include required artifacts/paths with reasons; optional material stays on-demand.
- Exclude archived, superseded, unrelated, and prohibited scope.
- Record baseline/hash and reviewed input revisions; fail on unresolved/stale required
  ID, contradiction, missing adapter prerequisite, or overflow.
- Use `bin/sdlc.js context`; never silently truncate required facts.
- Context is generated and cannot approve, override, or own a decision.
