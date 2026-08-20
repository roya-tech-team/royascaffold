# Goals and Design Principles

## Product definition

RoyaScaff is not primarily a code generator. It is a repository-native control system that helps developers and AI design, implement, verify, understand, and evolve software through explicit SDLC knowledge.

The quality target is not “a model produced code.” It is:

> An approved requirement becomes an explicit design and executable plan; implementation stays inside that plan; evidence proves the result; and the canonical blueprint remains accurate afterward.

## The six purposes as acceptance goals

| # | Purpose | v1.3 observable result |
|---|---------|------------------------|
| 1 | Build software with AI through a standard SDLC and its documents | A reader can follow business need → requirement → domain/workflow → design → code owner → test/evidence → release/operation |
| 2 | Let AI build the design and action plan that apply the concepts | Design decisions and task plans are reviewable before code and contain no hidden architectural invention |
| 3 | Implement code while sticking to the action plan | Changed files, contracts, tasks, and verification evidence map to the approved plan; unexplained scope fails |
| 4 | Add many features while keeping plans/workflows current with developer knowledge | Reconciliation updates canonical workflows and design after each verified change; developer overrides become durable decisions |
| 5 | Avoid dependence on a large context window or particular model | An implementation task runs from a bounded, reproducible Context Pack and fails safely when required context does not fit |
| 6 | Make the application and workflows easy to understand, with deeper layers available | `system-map.md` plus selected UMLs explains the system in minutes; every diagram links to the next detail layer |

## Success measures

### Developer comprehension

- A new teammate can explain system purpose, actors, boundaries, modules, and the three most important workflows from the L0/L1 material.
- Every top-level diagram links to the canonical records it summarizes.
- A developer can answer “where is this behavior defined and implemented?” without repository-wide search.

### Design and plan quality

- Every behavior-changing pack links to requirements and acceptance criteria.
- High-risk packs record architecture, security, data, compatibility, rollout, and rollback decisions before implementation.
- Every execution task has explicit inputs, allowed paths, expected outputs, tests, and done conditions.

### Implementation control

- Every changed runtime file is planned, mapped to an owner, or explicitly classified.
- Public contract changes cannot be introduced only in code.
- Implementation cannot be marked verified while deterministic checks fail or required evidence is missing/stale.

### Maintenance and team cooperation

- There is one canonical state owner; indexes and dashboards are derived.
- Two independent packs do not need to edit a central hand-maintained change table.
- Conflicting artifact/path claims are visible before implementation.
- Merged historical packs are not loaded as current truth.

### Model independence

- Context selection is based on typed relations and task policy, not model memory.
- Required context is never silently truncated.
- The same Context Pack and task contract can be given to different agents/models without changing the source blueprint.
- Evaluation measures task success and plan conformance, not brand/model preference.

## Design principles

### 1. One durable fact, one canonical home

Requirements do not get copied into architecture, tasks, and history. Those artifacts reference the canonical requirement and add only their own facts.

Generated indexes, status dashboards, system-map counts, traceability views, and Context Packs are disposable projections.

### 2. Meaning before mechanism

Greenfield reasoning order is:

```text
business outcome → requirement → domain rule/workflow → design → component/contract → task → code
```

Persistence, frameworks, and file paths cannot define business meaning.

### 3. Progressive disclosure

The engine has a deliberate reading path:

- L0: system in one sitting;
- L1: business and behavior;
- L2: solution design;
- L3: implementation ownership;
- L4: verification and operations.

A reader opens the next layer only when needed. A small project uses compact files; a large project splits the same model by context/module/owner.

### 4. Layered knowledge, iterative delivery

SDLC layers provide thinking order and document ownership. Work still ships as vertical slices. A team does not need to finish the entire product BRD and design before delivering the first approved capability.

### 5. Approved plans constrain code

The action plan states what may change. Discovering a new requirement, contract, dependency, or architecture decision pauses implementation and returns to impact/design. The model must not silently widen scope.

### 6. Evidence over confidence

PASS is a conclusion produced from fresh evidence. A statement such as “tests should pass” is not evidence.

### 7. Determinism around model judgment

Use code for IDs, links, lifecycle transitions, file coverage, hashes, generated views, command results, and traceability completeness. Use AI/human review for ambiguity, design quality, requirement completeness, and tradeoffs.

### 8. Risk-shaped control

Approval and review intensity follow data, security, money, public contracts, migrations, reversibility, operational impact, and system boundaries. File count is only one weak signal.

### 9. Generic core, explicit adapters

The core knows requirements, workflows, components, contracts, actions, evidence, ownership, and lifecycle. Adapters know NestJS decorators, React routes, Go packages, database migration folders, test commands, and generated-file patterns.

### 10. Durable developer knowledge

Corrections, exceptions, rationale, and workflow edits supplied by a developer must land in the owning canonical artifact or decision record. Chat history is never the durable source.

### 11. Safe incompleteness

Unknown facts are explicit: `unknown`, `inferred`, `needs-review`, or `not-applicable`. The engine must prefer a visible gap over invented certainty.

### 12. Compatibility before cleanup

Existing IDs and v1.2 projects migrate incrementally. Old action records can remain compatibility views until components/contracts/code maps and validators are proven.

## Required, conditional, and generated documents

“Standard SDLC” must not mean “every project receives every document.” Each artifact has a profile:

| Class | Rule | Examples |
|-------|------|----------|
| Required | Every project needs the fact | system map, business brief/BRD-lite, requirements, domain model, solution design, implementation map, quality strategy |
| Conditional | Created when a trigger applies | security model, API contract, data design, UX flows, migration plan, deployment/runbook, model card, safety analysis |
| Generated | Never hand-maintained as canonical | indexes, status dashboards, traceability matrix, active change list, context packs, coverage summaries |
| Historical | Retained for audit, excluded from normal context | reconciled changes, superseded ADRs, releases, incidents |

## Anti-goals

v1.3 must not become:

- a graph database or hosted knowledge service;
- a new workflow programming language;
- one Markdown file per class or helper;
- a forced API + SPA architecture;
- a heavyweight waterfall approval system;
- a platform that requires multiple agents or one vendor/model;
- an engine that lets generated summaries become source of truth;
- an automatic migration that deletes or rewrites existing project knowledge;
- a semantic-review system that can overrule failed deterministic checks.

