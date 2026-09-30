# Migration, Evaluation, Risks, and Acceptance

## Migration principles

- preview first;
- preserve IDs and provenance;
- never silently delete user knowledge/history;
- never upgrade inference to confirmed truth;
- validate staged output before apply;
- make rollback/recovery explicit;
- allow incremental module-by-module adoption.

## v1.2 to v1.3 migration flow

1. Detect v1.2 layout/version and repository state.
2. Inventory files, packs, statuses, code roots, and adapter candidates.
3. Produce a migration report with mappings, conflicts, unknowns, invalid legacy artifacts, and proposed target paths.
4. Build the v1.3 tree in a staging directory without changing the live blueprint.
5. Preserve legacy IDs; create new IDs only for newly modeled facts.
6. Mark inferred facts with confidence/evidence/review state; never `approved`/`verified` automatically.
7. Validate the staged tree and generate indexes.
8. Present create/move/retain/supersede/archive/unresolved actions.
9. Apply only after explicit approval and create a rollback manifest.
10. Revalidate the applied result; retain a migration record and legacy archive/pointers.

## Mapping guide

| v1.2 source | v1.3 result |
|-------------|-------------|
| `profile.md` | project profile, app/runtime types, selected compatibility adapters, paths/commands |
| `description.md` | seed business/requirements/domain facts; retained as legacy source/pointer after confirmed migration |
| `plan/modules.md` | capabilities, domain contexts, architecture module boundaries |
| `plan/data-model.md` | persistence design; missing conceptual/domain links become findings |
| `roles-and-authorization.md` | security design + requirements/invariants/contracts as appropriate |
| `rules.md` | classify into business constraints, requirements/NFRs, invariants, architecture/security/quality/operations, or adapter config |
| services | preserve `SVC-*`; map to component plus operation contract candidates |
| endpoints | preserve `EP-*`; map to action/transport contract |
| pages/views | preserve `PG-*`/`VW-*`; map to interface component/action + workflow/requirement candidates |
| `_index.md`, status dashboard, change log | import as evidence/history where needed; replace live copies with generated views |
| merged packs | archive provenance, decisions/evidence; canonical Main remains current truth |
| active packs | map status/baseline/dependencies; require review if pack blueprint incomplete or baseline stale |
| build program | execution-roadmap history or active task program after dependency validation |
| bugs | active/history defect records linked to requirements/tasks/evidence |

## Uncertainty handling

| Condition | Migration result |
|-----------|------------------|
| no canonical requirement for implemented behavior | `needs-review` requirement candidate |
| undefined DTO/interface/event | contract candidate; not approved |
| source file has no owner | unresolved code-map finding |
| component mixes responsibilities | architecture finding, preserve actual mapping |
| main and pack conflict | migration conflict requiring owner decision |
| historical pack lacks required blueprint/evidence | provenance warning; do not fabricate missing files |
| unknown generated/vendor path | unclassified until profile/adapter rule approved |
| inferred business term/workflow | evidence + confidence + review state |

## Example strategy

Keep `example-v1.2/` as the migration input. Create a separate migrated v1.3 result/fixture so tests can compare both.

Before treating v1.2 as valid:

- classify the packs whose `blueprint/` content is absent/incomplete;
- either repair a valid fixture according to the current contract or preserve that state as an explicit invalid/legacy-tolerant fixture;
- record expected migration findings.

The migrated example must demonstrate:

- system context and module map;
- business/requirements/domain reading path;
- at least one complex workflow with UML;
- project architecture/security/data/contracts;
- components/actions/code map for runtime files;
- requirement/invariant-to-test/evidence links;
- one complete change from request through reconciliation;
- deployment/operations knowledge appropriate to the example;
- generated views and a bounded Context Pack.

## Model-independence evaluation

The claim is not that every model produces identical code. The claim is that the engine packages enough approved knowledge and checks that different capable implementers can reach the same accepted behavior without loading the full project.

### Evaluation scenarios

| Scenario | Critical capability |
|----------|---------------------|
| Greenfield vertical slice | concept/requirements/design before implementation |
| Medium-risk feature | bounded context and plan conformance |
| High-risk authorization/contract change | gates, independent verification, compatibility/security coverage |
| Direct bug fix | expected-behavior link, root cause, regression proof |
| Refactor | behavior equivalence and code-map reconciliation |
| Legacy module onboarding | inventory-first extraction with evidence/confidence |
| Drift reconciliation | no automatic semantic winner |
| Release | deployment/rollback/operational evidence |

### Execution protocol

- Freeze the same canonical revision, task plan, Context Pack, tool access, and starting source for each run.
- Run across at least two materially different model/capability profiles supported by the product; do not tune project facts per model.
- The implementer may read only the Context Pack and declared on-demand paths. Any extra retrieval is recorded.
- Use deterministic acceptance tests and scope/traceability validators.
- Have the same independent reviewer policy evaluate semantic findings.
- Retain aggregate results/prompts/tool traces subject to evidence redaction policy.

### Metrics

| Metric | Target for release candidate |
|--------|------------------------------|
| Acceptance criteria passed | 100% on required scenario checks |
| Blocking plan deviations | 0 |
| Unexplained changed files | 0 |
| Undeclared public contract/architecture changes | 0 |
| Required context silently omitted | 0 |
| Stale evidence accepted | 0 |
| Task completed without full-blueprint load | yes for bounded implementation scenarios |
| Context size | within declared budget; required overflow causes split/fail |
| Handoff/resume | new session continues from artifacts without chat history |
| Semantic blocking findings | resolved or authorized risk acceptance; none hidden |

Model evaluation is a quality signal and release scenario. Deterministic tests remain the authoritative reproducible gate.

## Acceptance criteria for v1.3.0

### Understanding and SDLC

1. A new reader can explain purpose, actors, boundaries, modules, and key workflows from `system-map.md` and L1 artifacts without reading code or persistence schemas.
2. The blueprint has canonical homes for business requirements, NFRs, domain behavior, architecture, security, data, contracts, experience, components/actions/code, quality, and conditional operations.
3. Compact projects are not forced into one-file-per-record documentation.
4. UML/diagrams link to canonical IDs and deeper layers.

### Design and execution

5. Initial Build starts with business/requirements/domain and progressively elaborates vertical slices.
6. Every behavior change has acceptance criteria and affected-layer analysis.
7. Every implementation task has a validated executable plan and Context Pack.
8. Implementation cannot silently introduce public contract, architecture, migration, dependency, security, or user-behavior scope.

### Truth and verification

9. Main, Slice, and Change have enforced, non-overlapping source-of-truth rules.
10. Knowledge and implementation status are distinct.
11. Significant changed runtime files are mapped/classified; unexplained files fail.
12. Verification PASS requires fresh evidence and disposed semantic findings.
13. Reconciliation is previewed, baseline-checked, atomic, and followed by full validation/generated-view refresh.
14. Generated indexes replace hand-maintained duplicate state.

### Model and team independence

15. Bounded scenarios complete without loading the whole blueprint or archived changes.
16. Required context overflow fails/splits; it is never silently summarized away.
17. Skills obey a common contract and flows do not duplicate their procedures.
18. Two non-overlapping changes do not edit a central state source; overlapping claims are detected.
19. A new person/session can resume from the handoff artifacts alone.
20. High-risk work enforces independent review/verification roles.

### Genericity and migration

21. Web/API, CLI/library, and worker/event fixtures use the same core without fake artifacts.
22. Technology assumptions live in adapters/profile, not generic core.
23. v1.2 IDs/history migrate without silent deletion or invented verified knowledge.
24. The migrated example and greenfield fixture pass all validators and end-to-end flows.
25. Packed installation works on supported Windows/Linux Node environments and contains all v1.3 assets.

## Release candidate gates

- all P0 backlog items complete;
- unit/integration/E2E and invalid-fixture tests pass;
- greenfield and migration scenarios pass;
- model-independence report meets targets or documents an explicitly approved blocker before release;
- no unevidenced PASS in shipped examples/docs;
- no manual generated-view drift;
- security review complete;
- package dry-run/clean install verified;
- docs links, commands, schemas, versions, skills, and flows agree;
- rollback from a staged migration/reconciliation failure is demonstrated;
- release/publish receives a separate explicit approval.

## Risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Too many layers/files | developers ignore blueprint | compact/modular profiles, conditional triggers, generated indexes, no per-helper specs |
| Markdown metadata becomes unpleasant | teams bypass schemas | prototype before freeze, scaffold commands, actionable diagnostics, section records |
| Context resolver omits needed facts | incorrect low-model implementation | typed required relations, inclusion reasons, freshness, no silent truncation, task split |
| Knowledge compiler scope delays value | long rewrite | minimum reliable core and phased release; exact references before semantic inference |
| AI invents requirements during migration | false canonical truth | evidence/confidence/review states and explicit findings |
| Reconciliation damages Main | knowledge loss/drift | staging, baseline hashes, atomic apply, full validation, rollback manifest |
| Adapter logic leaks into core | reduced genericity | generic fixtures and strict adapter contract reviews |
| Status/schema churn | migration instability | version schemas, fixtures, freeze core before workflow migration |
| Teams treat documents as ceremony | stale/low-value content | ownership, risk-shaped artifacts/gates, generated views, traceability-to-evidence |
| Model evaluations are noisy | misleading quality claims | fixed fixtures/baselines/tools, deterministic gates, aggregate semantic review |
| Historical packs pollute context | old truth resurfaces | archive namespace and default exclusion |
| High-risk work uses self-review | unsafe approval | policy-enforced independent role records |

## Defaults selected by this plan

| Decision | Default |
|----------|---------|
| SDLC structure | logical/physical reading layers; vertical iterative delivery |
| Canonical format | Markdown with safe structured metadata and stable addressable records |
| Small-project split | one file per layer/area until token/ownership/boundary trigger |
| Main semantics | approved current knowledge including planned work; two status dimensions |
| Slice | reference manifest + generated Context Pack; never canonical |
| Change | temporary after-state delta against baseline; archive after reconciliation |
| Context overflow | remove optional, then split/fail; never silently truncate required facts |
| Service/action migration | preserve legacy IDs; map gradually to generic component/action/contract roles |
| Simple private DTO/helper | inline/support owner; first-class only when referenced/shared/public/risk-critical |
| Risk triggers | security/privacy, money, data/migration, public contract, operational/irreversible/cross-system |
| Index/status | generated from canonical metadata |
| Verification | deterministic results + fresh evidence + semantic finding disposition |
| v1.3.0 adapter scope | generic/manual + converted compatibility adapters + example-needed stack |
| Advanced semantic inference | later v1.3.x, reviewable suggestions only |

## Final recommendation

Approve the architectural direction and start with Phase 0. The first implementation change should protect current CLI/package behavior and prototype the metadata editing contract. It should not rewrite flows or project layout until those foundations and fixtures are accepted.

The highest-value user-visible sequence after that is:

```text
system map + requirements/domain
  → design/components/contracts/code map
    → task plan + evidence controls
      → exact Context Pack
        → revised flows/skills
          → migration/example/release
```

