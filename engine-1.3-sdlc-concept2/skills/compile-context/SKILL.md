---
schema: royascaff/skill/v1
name: compile-context
description: Compile bounded reproducible task context from the artifact graph.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Produce a reproducible bounded Context Manifest and Pack for one task from typed artifact relations.
required_inputs: [task, artifact-index, canonical-knowledge]
allowed_mutations: [active-change/execution/context]
forbidden_mutations: [canonical-knowledge, source-code]
outputs: [context-manifest, context-pack]
validation: [required-context-complete, source-hashes-current, budget-satisfied]
failure_conditions: [missing-required-artifact, stale-index, required-context-over-budget]
---

# Compile Context

Resolve task seeds and skill policy, include exact required artifact sections, rank optional context, add code/test paths and commands, exclude archives, record hashes, and fail with a task-splitting request rather than silently dropping required context.
