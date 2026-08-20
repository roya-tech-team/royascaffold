# v1.3 Delivery Roadmap

## Delivery strategy

Build v1.3 as a sequence of usable control improvements, not as one knowledge-platform rewrite.

Rules:

1. Protect v1.2 install behavior before refactoring the CLI.
2. Prototype the Markdown/metadata editing experience before freezing schemas.
3. Add validators alongside each new canonical contract.
4. Keep compatibility aliases and IDs until migration fixtures pass.
5. Ship only when both greenfield and migration journeys work.
6. Treat advanced inference as an enhancement, not a prerequisite for reliable exact-reference behavior.

## Phase 0 — Baseline and decision freeze

### Goal

Create a safe foundation and close format decisions before modifying the active methodology.

### Work

- Add automated tests for current `init`, target flags, `--force`, `--git`, help/errors, and package contents.
- Separate CLI parsing/filesystem operations into testable modules without behavior changes.
- Create valid and intentionally invalid v1.2 fixtures; classify/repair the incomplete example packs before using them as a valid fixture.
- Prototype record serialization in human-edited Markdown: file front matter plus addressable section records.
- Freeze v1.3 core metadata, relation, status, generated-file, diagnostic, and versioning conventions.
- Approve the physical tree or a compatibility-equivalent implementation of the layer contract.
- Define safe path, staging, backup/rollback, YAML parsing, and command execution rules.

### Exit

- v1.2 behavior is regression-tested.
- schema examples are easy to edit and parse.
- active design decisions are approved and recorded.
- invalid fixture expectations are explicit.

## Phase 1 — Layered knowledge core

### Goal

A project can express the complete SDLC reading path in canonical Markdown.

### Work

- Implement parser and schemas for common metadata/records.
- Add system map, business, requirements/NFR, domain/workflow, design, component/action/code-map, quality, and conditional operations templates.
- Add compact/modular/federated artifact profiles.
- Add two-dimensional artifact status and typed relations.
- Add Main/Slice/Change contracts and canonical/generated/historical path rules.
- Convert generic rules from current web assumptions; move current API/UI defaults into compatibility adapters.
- Create one small framework-neutral canonical fixture.

### Exit

- A human can navigate system map → requirement/workflow → design → component/code map → test/operations.
- A non-web fixture uses no fake endpoint/page/service concepts.
- schemas reject invalid IDs/status/kinds/owners/relations.

## Phase 2 — Deterministic control and evidence

### Goal

Stop drift and unaudited PASS before adding richer workflow automation.

### Work

- Build artifact discovery and a lightweight generated graph/index.
- Generate status, traceability, artifact, and active-change views.
- Implement project/change validation for metadata, references, state, traceability, code-map coverage, and generated-view freshness.
- Implement risk classification metadata and gate validation.
- Add execution-plan/task and evidence schemas.
- Implement changed-file scope and significant-file classification checks.
- Add evidence freshness, requirement-to-check coverage, and verification result validation.
- Implement reconciliation preview, staged atomic apply, regeneration, final validation, and rollback-on-failure.

### Exit

- hand-edited duplicated status/index files are no longer canonical;
- an unexplained changed runtime file fails;
- PASS without fresh evidence fails;
- reconciliation either leaves a fully valid canonical tree or applies nothing.

## Phase 3 — Workflows, skills, and bounded context

### Goal

A change can be handed to another session/model as a validated bounded task.

### Work

- Define declarative workflow contracts and the common state machine.
- Implement intent × risk routing and adaptive gates.
- Implement the initial atomic skill catalog and standard skill contract.
- Convert compatibility commands to thin entry skills.
- Update Initial Build, Change, Bug, Polish, Reverse Engineer; add Refactor, Drift Reconcile, Knowledge Change, and Release routes.
- Implement exact-reference Slice Manifest resolution and Context Pack generation.
- Add role-specific relation policies, source hashes, inclusion reasons, budget validation, and fail/split overflow.
- Make Initial Build progressively elaborate the next slice rather than materialize all detailed packs.
- Make Reverse Engineer inventory-first and module-resumable.

### Exit

- every workflow step names a skill or deterministic action;
- every implementer task has a valid plan and Context Pack;
- archived/superseded knowledge is excluded by default;
- skills no longer duplicate numbered flow procedures;
- low and high risk produce different gate/evidence policies.

## Phase 4 — Migration, examples, docs, and release candidate

### Goal

Prove that v1.3 is adoptable, portable, and understandable.

### Work

- Implement preview-first v1.2→v1.3 migration with findings and rollback manifest.
- Migrate a repaired copy of `example-v1.2` while preserving legacy IDs/history.
- Add CLI/library and worker/event framework-neutral fixtures.
- Add greenfield, change, bug, refactor, reverse-engineer, context, verify, reconcile, release, and migration end-to-end tests.
- Add Windows/Linux supported-Node clean package/install tests.
- Rewrite user/contributor/reference docs from final contracts and validate links/version strings.
- Run the model-independence evaluations in the acceptance plan.
- Complete security review for filesystem, YAML, command execution, evidence, and migration behavior.

### Exit

- release-candidate gates in [migration/evaluation](13-migration-evaluation-and-acceptance.md) pass;
- package contains every parser/schema/template/adapter/runtime asset;
- a stranger can understand the migrated example from L0/L1 without reading code;
- v1.2 migration is recoverable and produces no invented `verified` facts.

## Phase 5 — v1.3.x enhancements

Add only after v1.3.0 behavior and schemas stabilize:

- semantic impact suggestions and manifest review UI;
- more framework/archetype adapters;
- richer static architecture/contract checkers;
- visualization UI beyond Markdown/Mermaid;
- advanced active-change conflict tooling;
- connector/Git-host integrations;
- model-assisted reconciliation suggestions;
- specialized agent orchestration;
- performance optimization for very large federated blueprints.

None may weaken exact-reference validation or become mandatory for the generic/manual path.

## Prioritized backlog

Complexity: S/M/L/XL. Priority P0 is required for v1.3.0; P1 is required unless explicitly moved with acceptance impact; P2 is later v1.3.x.

| ID | Pri | Outcome | Depends on | Size |
|----|-----|---------|------------|------|
| V13N-001 | P0 | v1.2 CLI/package regression tests | — | M |
| V13N-002 | P0 | testable safe CLI/filesystem modules | 001 | M |
| V13N-003 | P0 | fixture classification/repair | 001 | M |
| V13N-004 | P0 | metadata/record/schema/version decision | 002 | M |
| V13N-005 | P0 | Markdown/front-matter parser + diagnostics | 004 | M |
| V13N-006 | P0 | common artifact/status/relation schemas | 005 | L |
| V13N-007 | P0 | layered tree and required/conditional templates | 006 | L |
| V13N-008 | P0 | system map + compact/modular/federated profiles | 007 | M |
| V13N-009 | P0 | generic core rules + compatibility adapter split | 007 | L |
| V13N-010 | P0 | artifact discovery/graph and generated indexes | 006–008 | L |
| V13N-011 | P0 | `validate project/change` structural/reference/state checks | 010 | L |
| V13N-012 | P0 | component/action/code-map rules and coverage checks | 007, 011 | L |
| V13N-013 | P0 | task/action-plan and changed-file scope validation | 011, 012 | L |
| V13N-014 | P0 | evidence schema/freshness/coverage verification | 011, 013 | L |
| V13N-015 | P0 | reconciliation preview/stage/apply/rollback | 010–014 | XL |
| V13N-016 | P0 | workflow/skill contracts and lifecycle validator | 006, 011 | L |
| V13N-017 | P0 | intent/risk router and adaptive gates | 016 | M |
| V13N-018 | P0 | core atomic skills + thin compatibility entries | 016, 017 | XL |
| V13N-019 | P0 | Slice Manifest + exact-reference Context Pack builder | 010, 013 | XL |
| V13N-020 | P0 | revised Initial/Change/Bug/Polish/RE + new routes | 017–019 | XL |
| V13N-021 | P0 | preview-first v1.2 migration | 007–015 | XL |
| V13N-022 | P0 | migrated example + generic CLI/library and worker fixtures | 009, 020, 021 | L |
| V13N-023 | P0 | E2E/cross-platform/package/security tests | all P0 | L |
| V13N-024 | P0 | v1.3 user/contributor/migration/reference docs | all P0 | L |
| V13N-025 | P0 | model-independence evaluation and release report | 019, 020, 022 | L |
| V13N-026 | P1 | release/incident/runbook adapter automation | 014, 020 | M |
| V13N-027 | P1 | example-stack static architecture/contract checks | 009, 012 | M |
| V13N-028 | P1 | advanced active ownership/conflict commands | 010, 016 | M |
| V13N-029 | P2 | semantic impact suggestions | stable 010/019 | XL |
| V13N-030 | P2 | additional technology/archetype adapters | stable 009 | ongoing |

## Recommended implementation slices

Do not implement the backlog as one branch. Suggested slices:

1. Baseline tests and CLI extraction (`001–004`).
2. Parser, core schemas, and invalid fixtures (`005–006`).
3. Layered templates/system map/profile rules (`007–009`).
4. Artifact graph, indexes, project validation (`010–011`).
5. Code map, action plan, evidence (`012–014`).
6. Reconciliation (`015`).
7. Workflow/skill contracts and routing (`016–018`).
8. Exact Context Pack builder (`019`).
9. Flow migrations (`020`).
10. Migration/example/evaluations/release hardening (`021–025`).

Each slice uses the engine's own isolated change lifecycle once that part is available.

## Planned repository impact

Likely new areas:

```text
lib/
  knowledge/
  graph/
  context/
  workflow/
  validate/
  reconcile/
  migrate/
  adapters/
schemas/
engine/
  workflows/
  adapters/
  templates/v1.3/
tests/
  fixtures/
  unit/
  integration/
  e2e/
```

Likely revised areas:

- `bin/royascaff.js` becomes a thin entry point;
- `package.json` includes tests/runtime dependencies/assets;
- `engine/flow.md`, layout, conventions, rules, flows, and templates adopt v1.3 contracts;
- `skills/` becomes atomic procedures plus compatibility aliases;
- README/docs/examples describe one consistent v1.3 model.

Exact names may change in Phase 0, but these responsibility boundaries should remain.

## Release slicing

| Milestone | Demonstrates |
|-----------|--------------|
| alpha 1 | layered fixture parses/validates; system map and graph navigate |
| alpha 2 | code-map/task/evidence/reconciliation controls work |
| beta | revised workflows/skills and exact Context Packs run end-to-end |
| RC | migration/examples/docs/security/cross-platform/model evaluations pass |
| v1.3.0 | minimum reliable core is packaged and compatibility path documented |
| v1.3.x | advanced inference, adapters, and collaboration enhancements |

Publishing remains a separate explicit owner decision after RC acceptance.

