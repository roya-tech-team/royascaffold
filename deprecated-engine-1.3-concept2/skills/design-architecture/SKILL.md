---
schema: royascaff/skill/v1
name: design-architecture
description: Design project-specific boundaries, components, dependencies, patterns, and decisions.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Define project-specific boundaries, component responsibilities, dependencies, patterns, security, and durable decisions.
required_inputs: [requirements, domain, profile, relevant-ADRs]
allowed_mutations: [active-change/delta/architecture, active-change/delta/implementation/components, active-change/delta/decisions]
forbidden_mutations: [canonical-knowledge, source-code]
outputs: [ARCH-artifacts, CMP-artifacts, ADR-proposals, architecture-risks]
validation: [dependency-direction, component-ownership, ADR-required-for-lasting-decision]
failure_conditions: [unresolved-boundary, forbidden-dependency, unreviewed-high-risk-decision]
---

# Design Architecture

Describe actual project architecture, not generic fashion. Choose boundaries and patterns from the problem, define component kinds by responsibility, identify security and operational consequences, compare alternatives for durable decisions, and avoid framework assumptions outside selected adapters.
