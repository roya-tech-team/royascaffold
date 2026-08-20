---
schema: royascaff/skill/v1
name: implement-task
description: Implement one approved task without inventing architecture or mutating canonical knowledge.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Execute one approved task from its Context Pack without inventing architecture or mutating canonical knowledge.
required_inputs: [task, current-context-pack, source-working-tree]
allowed_mutations: [task-owned-source, task-owned-tests, task-result, execution-evidence, code-map-delta]
forbidden_mutations: [project/canonical, unrelated-source, approved-delta]
outputs: [code-changes, tests, task-result, command-evidence, deviations]
validation: [allowed-paths, required-commands, changed-files-classified]
failure_conditions: [stale-context, material-design-deviation, missing-dependency-code, task-scope-overflow]
---

# Implement Task

Load only the compiled pack and owned code. Follow exact requirements/contracts/architecture. Record every changed file and command. A new component, public contract, requirement, architecture boundary, or unrelated path stops implementation and returns to analysis/design. Small supporting files may be added only with owner classification.
