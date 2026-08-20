---
schema: royascaff/skill/v1
name: design-contracts
description: Define APIs, DTOs, interfaces, events, provider payloads, and model mappings.
version: 1
context_policy:
  seeds: [task.required, task.optional]
  required_relations: [constrained_by, satisfies, implements, implemented_by, maps_to, verified_by]
  optional_relations: [depends_on, uses]
  exclude: [changes/archive/**]
purpose: Define APIs, interfaces, DTOs, commands, events, provider payloads, versions, and cross-model mappings.
required_inputs: [requirements, workflows, domain, architecture, data-context]
allowed_mutations: [active-change/delta/contracts, active-change/delta/data]
forbidden_mutations: [canonical-knowledge, source-code]
outputs: [CTR-artifacts, DATA-artifacts, compatibility-plan, migration-plan]
validation: [consumers-and-implementations-linked, model-kinds-separated, breaking-changes-declared]
failure_conditions: [undefined-public-shape, missing-consumer-impact, unsafe-data-migration]
---

# Design Contracts

Distinguish domain, persistence, transport, integration, and view models. Define fields/operations/validation/errors/sensitivity/version, consumers, implementations, mappings, compatibility, and migration. Endpoint and component specs must reference contract IDs rather than undefined type names.
