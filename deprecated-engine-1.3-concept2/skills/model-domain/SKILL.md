---
schema: royascaff/skill/v1
name: model-domain
description: Model domain language, concepts, policies, invariants, and events.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Define ubiquitous language, concepts, invariants, events, policies, and context ownership before persistence details.
required_inputs: [approved-requirements, domain-context]
allowed_mutations: [active-change/delta/domain]
forbidden_mutations: [canonical-knowledge, source-code]
outputs: [DOM-artifacts, glossary-delta, context-relations]
validation: [requirements-linked, invariants-explicit, terms-have-owner]
failure_conditions: [ambiguous-core-term, unresolved-context-owner, persistence-shape-used-as-domain-definition]
---

# Model Domain

Model business meaning independently from frameworks and tables. Record concepts, relationships, policies, invariants, meaningful events, and translations across contexts. Link every material rule to its requirements and later enforcing components/tests.
