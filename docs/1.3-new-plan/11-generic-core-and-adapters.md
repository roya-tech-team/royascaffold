# Generic Core and Technology Adapters

## Boundary

The generic engine defines software-development knowledge and control. It must not require HTTP, JWT, a database, a UI, or a particular folder/language.

### Core owns

- artifact kinds/relations/status/lifecycle;
- business, requirements, domain, design, implementation, quality, and operations layer contracts;
- Main/Slice/Change ownership;
- risk/gates/roles;
- context manifest/pack rules;
- evidence/verification/reconciliation;
- generic code-map classifications;
- skill/workflow contracts.

### Adapter owns

- framework/language discovery patterns;
- architecture vocabulary/defaults for that archetype;
- contract extractors (OpenAPI, protobuf, CLI flags, public functions, event schema, etc.);
- dependency/import/layer checks;
- source/test/generated/exclusion path patterns;
- build/test/lint/typecheck/security/deploy command definitions;
- code-map heuristics and symbol anchors;
- optional templates/reference guidance.

### Project profile owns

- selected adapters and versions;
- repositories/app/runtime types;
- actual commands and paths;
- architecture decisions/exceptions;
- environments/integrations/providers;
- artifact profile and context budgets;
- project-specific quality/security/operations requirements.

An adapter may suggest defaults. It cannot invent product requirements or silently override project decisions.

## Generic vocabulary

### Component kinds

The core accepts responsibility-oriented kinds such as:

- interface/entry point;
- application/domain processor or policy;
- storage/repository/query;
- integration/adapter/provider;
- event/queue/job/scheduler;
- UI/screen/view/store/hook;
- public library API;
- CLI command;
- pipeline stage/transform;
- model/inference/evaluation component;
- platform/configuration/observability;
- device/hardware interface.

Adapters can add names but must map them to core responsibilities/relations.

### Action kinds

- request/endpoint/RPC;
- command/public function;
- user interaction/navigation;
- event producer/consumer;
- scheduled/background job;
- pipeline execution;
- migration;
- deployment/operational action.

Projects do not create fake endpoints/pages/services when those concepts do not apply.

## Project archetype profiles

| Archetype | Typical conditional artifacts |
|-----------|-------------------------------|
| API/service | transport contracts, auth/security, data, deployment/observability |
| Web/mobile/desktop UI | user journeys, navigation/workflows, accessibility, interface components, visual evidence |
| CLI | commands/flags/exit codes, filesystem effects, compatibility, packaging |
| Library/SDK | public API contracts, versioning, examples, compatibility matrix, package tests |
| Worker/event system | event contracts, idempotency/retry/DLQ, scheduling, observability/runbooks |
| Data pipeline | schemas/lineage, quality rules, orchestration, backfill/replay, data SLAs |
| Embedded/device | hardware interfaces, timing/resource constraints, safety/recovery, firmware deployment |
| AI/ML system | data provenance, model/evaluation cards, prompts/policies, safety/quality metrics, fallback/monitoring |
| Infrastructure/config | desired state, environments, dependency graph, change/rollback/validation |
| Mixed system | combination selected per app/boundary; system map connects them |

## Adapter contract

Each adapter declares:

```yaml
id: adapter-web-api-example
version: 1
supports:
  project_kinds: [api]
  languages: [example]
discovery:
  entry_points: [...]
  contract_sources: [...]
  test_sources: [...]
  generated_paths: [...]
checks:
  build: <profile command key>
  test: <profile command key>
  architecture: <checker or not-supported>
context:
  symbol_locator: <strategy>
  default_exclusions: [...]
```

Adapter schemas must distinguish `not-supported` from PASS. An unavailable architecture checker does not prove conformance; the workflow selects compensating inspection/review.

## Core rule examples

Good technology-neutral core rules:

- business invariants are enforced in an owned component, not only at an interface;
- external side effects are isolated behind owned contracts/components;
- public/shared contracts have compatibility policy;
- sensitive data has classification/lifecycle rules;
- actions depend on declared components/contracts;
- significant runtime files have owners;
- tests/evidence trace to requirements/invariants/NFRs;
- deployable systems define validation and recovery appropriate to risk.

Rules such as `/api/v1`, JWT bearer, response envelopes, REST pagination, Angular page folders, or controller→service→repository belong in an adapter or project design.

## Adapter selection and fallback

1. Profile selects zero or more adapters per application/repository.
2. Conflicting defaults require an explicit project decision.
3. Generic adapter always supports manual paths/commands/evidence.
4. Missing adapter blocks automation only when a required check cannot be expressed; it does not block using the core method.
5. Reverse Engineer records unknown/unclassified constructs rather than forcing them into the nearest web concept.

## Initial adapter scope

For v1.3.0:

- ship the generic/manual adapter;
- convert the current API and web guidance into clearly named compatibility adapters;
- add only the concrete adapter(s) needed by the migrated example and release tests;
- document how contributors add adapters.

Do not attempt broad framework coverage before the core schemas and conformance tests stabilize.

## Genericity acceptance scenarios

The same core must successfully describe and validate at least:

1. the existing web/API example;
2. a small CLI or library fixture with no endpoints/pages/database;
3. a worker/data-flow fixture with events/jobs and no interactive UI.

If any fixture must invent irrelevant artifact types, the core is still too framework-specific.

