---
schema: royascaff/skill/v1
name: plan-refactor
description: Plan behavior-preserving structural improvement or staged migration.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Define preserved behavior, characterization evidence, target structure, and safe reversible refactor or migration stages.
required_inputs: [technical-problem, canonical-contracts, components, code-map, tests]
allowed_mutations: [active-change/impact.md, active-change/delta/architecture, active-change/execution]
forbidden_mutations: [canonical-knowledge, source-code]
outputs: [preserved-invariants, characterization-plan, target-design, staged-tasks, rollback]
validation: [behavior-preservation-explicit, contracts-covered, stages-leave-valid-system]
failure_conditions: [undefined-current-behavior, missing-characterization-path, hidden-product-change]
---

# Plan Refactor

Establish externally observable behavior and tests first. Define target components/dependencies/code map, identify ADR need, stage work so every step builds and can roll back, and route hidden behavior changes through normal requirement approval.
