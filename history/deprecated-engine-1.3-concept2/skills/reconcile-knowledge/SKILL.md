---
schema: royascaff/skill/v1
name: reconcile-knowledge
description: Apply a verified after-state to canonical knowledge and archive the change.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Apply a verified after-state atomically to canonical knowledge, regenerate indexes, validate, and archive history.
required_inputs: [verified-change, target-baseline, reconciliation-preview]
allowed_mutations: [project/canonical, project/indexes, change/reconciliation.md, changes/archive]
forbidden_mutations: [application-source, unverified-change]
outputs: [canonical-after-state, generated-indexes, reconciliation-report, archived-change]
validation: [verified-state, baseline-compatible, canonical-valid-after-apply]
failure_conditions: [stale-baseline, delta-conflict, final-validation-failure, dependency-not-reconciled]
---

# Reconcile Knowledge

Preview full after-state file operations, preserve scoped backups, apply only verified deltas, update evidence-backed implementation status, regenerate indexes/system map, validate the whole repository, roll back on failure, write hashes/operations, then archive. Archived deltas are not current truth.
