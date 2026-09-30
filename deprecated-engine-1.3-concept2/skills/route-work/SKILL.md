---
schema: royascaff/skill/v1
name: route-work
description: Route a request to the correct v1.3 workflow and risk policy.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Classify work intent and risk, select a workflow, and identify required human decisions.
required_inputs: [user-intent, project-profile, artifact-index]
allowed_mutations: [project/changes/active/new-change/change.md]
forbidden_mutations: [project/canonical, source-code]
outputs: [workflow, risk-level, risk-reasons, initial-scope]
validation: [workflow-exists, risk-reasons-recorded]
failure_conditions: [missing-profile, ambiguous-intent-with-materially-different-workflows]
---

# Route Work

Resolve build, feature/change, bug, refactor, architecture, reverse-engineer, verification, or reconciliation intent. Score public contracts, security/PII/money/tenancy, migrations, cross-app scope, irreversibility, production impact, and test confidence. Ask only when ambiguity changes authority or risk materially.
