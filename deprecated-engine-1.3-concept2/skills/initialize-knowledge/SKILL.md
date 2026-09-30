---
schema: royascaff/skill/v1
name: initialize-knowledge
description: Initialize the canonical project knowledge root and confirmed profile.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Establish project knowledge directories, repositories, applications, commands, adapters, owners, and exclusions.
required_inputs: [workspace]
allowed_mutations: [project/profile.md, project/system-map.md, project/directories]
forbidden_mutations: [application-source]
outputs: [project-profile, canonical-skeleton, initialization-report]
validation: [profile-schema, source-roots-resolve, owner-list-present]
failure_conditions: [unsafe-project-root, conflicting-existing-knowledge, unconfirmed-repository-boundaries]
---

# Initialize Knowledge

Discover without inventing. Create directories mechanically, draft profile/system map, confirm application/repository boundaries and technology adapters once, validate, then route greenfield to design or existing code to reverse engineering.
