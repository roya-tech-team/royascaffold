---
schema: royascaff/skill/v1
name: analyze-change-impact
description: Resolve knowledge, code, test, compatibility, migration, and risk impact.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Resolve affected canonical artifacts, dependencies, code, tests, risks, compatibility, migration, rollout, and rollback.
required_inputs: [change, artifact-index, project-profile]
allowed_mutations: [active-change/impact.md]
forbidden_mutations: [canonical-knowledge, source-code]
outputs: [impact-analysis, affected-artifact-list, affected-code-list, risk-classification]
validation: [all-ids-resolve-or-are-new, every-layer-assessed, risk-reasons-recorded]
failure_conditions: [stale-index, unresolved-required-artifact, dependency-conflict, context-budget-overflow]
---

# Analyze Change Impact

Seed from intent/module/artifact IDs, traverse typed relations, inspect bounded code locations, classify create/modify/deprecate, identify consumers and tests, and state `unchanged` explicitly for requirements, architecture, domain, workflows, contracts, data, components, code map, security, migration, rollout, and rollback.
