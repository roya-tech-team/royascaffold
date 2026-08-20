---
schema: royascaff/skill/v1
name: verify-change
description: Verify plan-to-code conformance with deterministic evidence and semantic review.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Verify plan-to-code conformance with deterministic evidence and structured semantic findings.
required_inputs: [change-or-task, approved-delta, execution-results, source-working-tree]
allowed_mutations: [active-change/verification.md, active-change/execution/evidence]
forbidden_mutations: [canonical-knowledge, source-code, approved-delta]
outputs: [deterministic-results, semantic-review, finding-dispositions, overall-result]
validation: [all-blocking-checks-pass, evidence-current, findings-dispositioned]
failure_conditions: [deterministic-failure, stale-source, unexplained-file, unresolved-blocking-finding]
---

# Verify Change

Validate schema/baseline/context/task scope/code map/contracts/architecture, run project commands, collect evidence, then review business/domain/workflow/security/UX/testing semantics with bounded context. Never edit the plan to excuse implementation. PASS without evidence is invalid.
