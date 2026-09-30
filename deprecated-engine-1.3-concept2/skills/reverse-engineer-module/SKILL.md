---
schema: royascaff/skill/v1
name: reverse-engineer-module
description: Extract one bounded existing-code module into evidence-backed canonical knowledge.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Extract one bounded module into evidence-backed canonical requirements, domain, workflows, contracts, data, components, and code map.
required_inputs: [inventory, module-scope, project-profile, selected-adapter]
allowed_mutations: [reverse-engineer-workspace, reviewed-canonical-module-draft]
forbidden_mutations: [application-source, unrelated-module-knowledge]
outputs: [module-artifacts, code-map, evidence, confidence, drift-findings]
validation: [every-runtime-file-classified, evidence-present, review-state-present]
failure_conditions: [unbounded-module, missing-source-root, ambiguous-owner, context-budget-overflow]
---

# Reverse Engineer Module

Inventory first. Extract actual source boundaries and machine contracts, then infer domain/requirements. Every artifact records path/line/test/config evidence, confidence, and confirmed/inferred/disputed review state. Merge only reviewed knowledge; queue violations/gaps as changes rather than fixing them inside extraction.
