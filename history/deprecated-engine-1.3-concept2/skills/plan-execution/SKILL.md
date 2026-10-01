---
schema: royascaff/skill/v1
name: plan-execution
description: Convert an approved design delta into executable bounded task contracts.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Convert an approved after-state delta into dependency-ordered bounded task contracts another agent can execute.
required_inputs: [approved-change, impact, delta, project-profile]
allowed_mutations: [active-change/execution/plan.md, active-change/execution/tasks]
forbidden_mutations: [canonical-knowledge, source-code]
outputs: [execution-plan, TASK-artifacts]
validation: [delta-covered, ownership-nonoverlapping, dependencies-valid, commands-and-evidence-declared]
failure_conditions: [unapproved-material-decision, task-too-large, circular-task-dependency]
---

# Plan Execution

Each task declares objective, artifact create/modify/deprecate scope, exact/bounded file ownership, acceptance subset, dependencies, commands, outputs, failure/escalation conditions, and context budget. Prefer vertical deliverable tasks; never group work only by “all backend then all frontend.”
