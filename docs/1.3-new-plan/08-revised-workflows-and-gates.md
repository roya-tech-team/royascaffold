# Revised Workflows and Adaptive Gates

## Routing model

v1.3 routes on four inputs:

1. **intent** — what kind of work is requested;
2. **risk** — what damage or review burden the change can create;
3. **project profile** — which artifact/adapters/checks apply;
4. **current state** — greenfield, canonical blueprint present, active change, drift, or incident.

## Intent registry

| Intent | Default workflow | Notes |
|--------|------------------|-------|
| New product | Initial Build | incremental layered design + vertical slices |
| New/changed behavior | Change | requirements/design/task/evidence/reconcile |
| Defect vs approved behavior | Bug Fix | direct correction only when intent remains unchanged |
| Presentation refinement | Polish | micro/interface/system profiles |
| Behavior-preserving structure change | Refactor | characterization + architecture/component/code-map plan |
| Architecture/data/platform migration | Change (migration profile) | mandatory compatibility, rollout, rollback, operational review |
| Existing system onboarding | Reverse Engineer | inventory-first, module checkpoints, evidence/confidence |
| Blueprint/code disagreement | Reconcile Drift | decide intended truth before modifying either side |
| Knowledge-only decision | Knowledge Change | review/reconcile without implementation tasks |
| Release/deploy | Release | readiness, deployment, smoke/operational evidence, rollback |
| Incident follow-up | Incident Improvement | incident learning → requirements/tasks/runbooks/ADRs |

Compatibility commands may map to these registry entries.

## Risk classifier

Evaluate these dimensions:

- user/business outcome;
- security, privacy, authorization, compliance;
- money or valuable external side effects;
- data integrity, retention, migration, deletion;
- public/shared contracts and compatibility;
- operational availability/performance/recovery;
- cross-app/module/team ownership;
- reversibility and rollout complexity;
- uncertainty/novelty.

### Risk levels

| Level | Typical condition |
|-------|-------------------|
| Low | local, reversible, no behavior/security/data/public-contract effect, established pattern |
| Medium | one capability/module behavior change, reversible, no mandatory high-risk trigger |
| High | authorization, PII, money, public contract, migration, external side effect, cross-system, high availability, difficult rollback |
| Critical | destructive/irreversible operation, safety/regulatory exposure, active production incident, broad data risk, catastrophic availability impact |

High-risk triggers override small file count. Critical work requires explicit developer/owner risk acceptance and a recovery plan.

## Gate matrix

| Gate | Low | Medium | High | Critical |
|------|-----|--------|------|----------|
| Request/scope confirmation | combined with ready gate | required | required | required |
| Requirements/workflow review | if behavior changes | required | required with domain/product owner | required |
| Architecture/security/data review | only if impacted | if impacted | mandatory relevant reviewers | mandatory independent reviewers |
| Execution-plan ready gate | required, may be combined | required | required | required |
| Implementation authorization | may be pre-authorized with ready gate | explicit | explicit | explicit |
| Verification independence | deterministic self-check acceptable | separate review recommended | independent verifier required | independent verifier + owner acceptance |
| Reconciliation preview/approval | may auto-apply if pre-authorized and clean | explicit or policy-controlled | explicit | explicit |
| Release/rollback gate | if deployed | if deployed | mandatory | mandatory with monitored rollout |

The engine records policy decisions. It never treats silence as approval.

## Common change lifecycle

| State | Required truth |
|-------|----------------|
| `draft` | request/outcome captured; no implementation authority |
| `analyzed` | impact, risk, dependencies, and affected knowledge layers identified |
| `approved` | proposed behavior/design and required reviews accepted |
| `ready` | execution tasks and Context Packs validate; dependencies available |
| `in-progress` | implementation is occurring inside task scope |
| `failed` | verification failed; evidence retained; remediation required |
| `verified` | all required deterministic checks/evidence pass; semantic findings disposed |
| `reconciled` | canonical after-state applied atomically and revalidated |
| `closed` | archive/release linkage complete; no active work remains |
| `blocked` | named external/dependency/decision condition prevents progress |
| `cancelled` | work intentionally abandoned; Main was not changed by this delta |

Only the workflow transition command/validator may change canonical state. Generated views consume it.

## Initial Build target flow

### A. Discover

- initialize project/profile and select adapters/artifact profile;
- identify stakeholders, constraints, repositories/environments if present;
- establish unknowns and decision owners.

### B. Understand

- create BRD/business brief;
- create functional requirements/use cases and NFRs;
- model domain concepts, invariants, and complex workflows;
- create L0 system map.

Gate: business language, scope, highest-value workflow, and acceptance intent are correct.

### C. Design the roadmap and next slice

- create architecture/quality/operations outline for the system;
- create a prioritized capability roadmap;
- choose the next dependency-ready vertical slice;
- fully design only that slice's contracts/data/components/actions/tests;
- create change, task plan, manifest, and Context Packs.

Gate: design and task plan are implementable and within risk policy.

### D. Deliver slices

- implement one task at a time;
- verify the full slice;
- reconcile canonical knowledge;
- optionally release;
- stop or select the next slice using updated knowledge.

This replaces “specify every endpoint/page for the whole product, then build” with progressive elaboration while retaining an approved roadmap.

## Change target flow

1. Capture outcome/non-goals and source.
2. Classify intent/risk/profile.
3. Resolve baseline and active conflicts.
4. Analyze impact across all knowledge layers and code ownership.
5. Draft requirements/workflow/design after-state deltas.
6. Review/approve material decisions.
7. Create tasks, test/rollout plan, Slice Manifest, Context Packs.
8. Validate readiness and authorize implementation.
9. Implement tasks; return to analysis on scope/design discovery.
10. Verify with fresh evidence and independent review as required.
11. Preview and atomically reconcile into Main.
12. Release/monitor if applicable; close/archive.

## Bug Fix target flow

### Direct correction profile

Allowed only when all are true:

- canonical intended behavior is explicit and unchanged;
- no public contract, architecture, data model/migration, security policy, or operational design changes;
- risk is low/medium and correction is locally reversible;
- affected code owner and tests are known.

Required: bug record, expected-behavior link, root cause, regression test (or justified compensating evidence), scoped task, verification evidence, code-map reconciliation if ownership changes.

### Change profile

Use normal Change when intended behavior/design must change, the blueprint is missing/incorrect, or any high-risk trigger applies.

## Polish target flow

- **Micro:** compact metadata + targeted task + visual/accessibility evidence; no duplicated pack blueprint.
- **Interface:** requirement/experience/workflow after-state, interface component/action impact, responsive/accessibility evidence.
- **System:** normal Change with design-system/architecture/component impact.

Any change to visibility, authorization cues, navigation semantics, form behavior, validation, or data presentation meaning is not automatically micro-polish.

## Refactor target flow

1. Link behavior/contract that must remain unchanged.
2. Capture characterization tests/evidence.
3. Design component/code-map/dependency after-state.
4. State forbidden behavior/contract changes.
5. Plan reversible tasks.
6. Implement and run equivalence/regression checks.
7. Reconcile implementation map/ADRs only; requirements remain unchanged.

If behavior must change, convert to Change without discarding evidence.

## Reverse Engineer target flow

1. Inventory repositories/apps/modules/configuration/source categories.
2. Create initial code map and select adapters.
3. Choose one module/context checkpoint.
4. Extract entry points, components, contracts, actions, data, tests, operations evidence.
5. Infer workflows/domain/requirements with confidence and source references.
6. Review developer corrections; mark confirmed knowledge approved.
7. Run traceability/orphan/drift validation for the module.
8. Reconcile confirmed current knowledge; create REQ-R tasks for gaps/violations.
9. Repeat modules; generate/update system map as confidence grows.

The flow is resumable after each checkpoint and never requires the whole codebase in one model context.

## Reconcile Drift target flow

1. Detect/report difference without immediately choosing a winner.
2. Classify as undocumented implementation, stale blueprint, incomplete change, defect, generated-view drift, or intentional exception.
3. Developer/owner selects intended truth for ambiguous semantic drift.
4. Use a knowledge-only reconciliation or a normal remediation change.
5. Re-run project validation and record provenance.

## Release target flow

1. Select verified/reconciled changes and target environment/version.
2. Validate requirement/test/security/migration/operations readiness.
3. Confirm deployment and rollback/runbook.
4. Execute approved release steps through project adapter/tooling.
5. Capture smoke/health/observability evidence.
6. Roll back or accept/close.
7. Write release record and update operational/current-version views.

## Declarative workflow contract

Each workflow definition should declare:

- entry predicates;
- state machine and legal transitions;
- ordered skill/deterministic-action references;
- required/conditional artifacts by profile;
- risk/gate mapping;
- context relation policies;
- evidence policy;
- stop/resume and rollback rules;
- terminal conditions.

The human Markdown guide should be generated from or validated against that contract so skills/docs do not drift.

