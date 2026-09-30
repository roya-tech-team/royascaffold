---
schema: royascaff/skill/v1
name: investigate-bug
description: Reproduce a defect, establish expected behavior, and document root cause before code.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Reproduce a defect, resolve expected canonical behavior, find root cause, and classify scope and risk before code.
required_inputs: [bug-report, canonical-index, source-working-tree]
allowed_mutations: [bug/investigation.md, active-change/impact.md]
forbidden_mutations: [canonical-knowledge, source-code]
outputs: [reproduction, expected-behavior, root-cause, risk, proposed-fix, regression-test-plan]
validation: [expected-behavior-linked, root-cause-evidenced, risk-assessed]
failure_conditions: [cannot-reproduce-without-required-input, expected-behavior-undefined, security-incident-needs-escalation]
---

# Investigate Bug

Separate observation, expected truth, and root cause. Use scope plus risk—not file count alone—to choose direct fix or full change. Require regression evidence, production validation/rollback where relevant, and escalate when canonical behavior/contracts/architecture must change.
