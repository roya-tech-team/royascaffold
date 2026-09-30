---
schema: royascaff/skill/v1
name: elicit-requirements
description: Turn product intent into testable requirements and constraints.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Convert product intent into stable testable requirements, constraints, acceptance criteria, and exclusions.
required_inputs: [intent, relevant-product-context]
allowed_mutations: [active-change/change.md, active-change/delta/requirements]
forbidden_mutations: [canonical-knowledge, source-code]
outputs: [REQ-artifacts, NFR-or-SEC-deltas, acceptance-criteria, open-decisions]
validation: [unique-ids, testable-acceptance, no-unresolved-material-TBD]
failure_conditions: [unknown-primary-outcome, unresolved-owner-decision, contradictory-requirements]
---

# Elicit Requirements

Capture actor, trigger, outcome, preconditions, business rules, failure behavior, exclusions, compatibility, priority, and acceptance evidence. Separate functional, non-functional, and security constraints. Do not choose architecture while clarifying product intent.
