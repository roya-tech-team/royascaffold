---
schema: royascaff/skill/v1
name: model-workflow
description: Define state and sequence workflows with complete behavior and failures.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Define actor-visible and system workflows with states, transitions, rules, failures, events, and ownership.
required_inputs: [requirements, domain-artifacts, existing-workflow]
allowed_mutations: [active-change/delta/workflows]
forbidden_mutations: [canonical-knowledge, source-code]
outputs: [WF-artifacts, state-or-sequence-diagrams, failure-behavior]
validation: [requirements-satisfied, transitions-guarded, terminal-and-failure-paths-covered]
failure_conditions: [undefined-authoritative-actor, contradictory-transition, missing-business-outcome]
---

# Model Workflow

Use a state diagram for lifecycle behavior and a sequence diagram for multi-component interaction only when it improves understanding. Define trigger, guards, actors, state changes, side effects, events, idempotency, retry/timeout/compensation, and observable failures.
