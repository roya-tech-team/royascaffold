# Skills Review and v1.3 Skill Architecture

## Current skill model

The shipped skills are entry wrappers:

| Skill | Current value | Main limitation |
|-------|---------------|-----------------|
| `flow` | Lists commands and quick routing | Repeats the router and does not classify risk or required context |
| `initial-build` | Gives phase summary, order, and mandatory rules | Repeats flow step structure; does not perform reusable requirements/design/planning capabilities |
| `change-mode` | Emphasizes isolation and pack lifecycle | Duplicates numbered flow steps and broad context instructions |
| `polish` | Protects the UI-only boundary | Treats all polish similarly; visual evidence contract is weak |
| `bug-fix` | Routes direct fix vs change pack | Scope/module heuristics dominate risk; regression evidence is not mandatory |
| `reverse-engineer` | Establishes the onboarding route | Delegates to an unbounded, framework-heavy flow rather than an inventory procedure |

They are useful as commands, but they are not composable development abilities. They answer “which long file should I read?” rather than “how do I produce one valid output from bounded inputs?”

## Problems to solve

### Procedure duplication

Step numbers, gates, pack statuses, and resume rules appear in both skills and flow files. A change in one can make the other wrong.

### No common contract

Skills do not consistently declare:

- preconditions;
- exact inputs and allowed context;
- canonical writes and prohibited writes;
- output schema;
- deterministic checks;
- approval boundary;
- failure/recovery behavior;
- context budget.

### Flow-sized rather than task-sized

Requirements analysis, workflow modeling, architecture design, impact analysis, task planning, verification, and reconciliation cannot be invoked/tested independently.

### Technology and project facts leak into procedure

Reverse-engineering and design procedures assume framework patterns that should be adapter/profile inputs.

### No role boundary

The same entry skill can analyze, design, implement, verify, and merge. High-risk work needs explicit reviewer independence even if one agent may combine roles for low-risk work.

## Target separation

```text
Flow = orchestration and state transitions
Skill = one bounded reasoning/procedure capability
Template/schema = output contract
Validator = deterministic enforcement
Adapter = technology-specific discovery/checks
Project blueprint = system-specific facts
```

A flow may call a skill. A skill must not copy the flow state machine into its own instructions.

## Standard v1.3 skill contract

Every shipped skill should contain these sections:

| Section | Required content |
|---------|------------------|
| Identity | stable name, version, purpose, supported artifact/schema versions |
| Use/avoid | positive triggers and explicit non-goals |
| Role | analyst, designer, planner, implementer, verifier, reconciler, inventory |
| Preconditions | project/change state, required approvals, required tools/adapters |
| Inputs | exact artifacts, manifest relation policy, optional inputs |
| Context budget | maximum input target and overflow/split policy |
| Reads/writes | canonical paths/views it may read; exact paths it may mutate |
| Procedure | bounded ordered actions without duplicating another workflow |
| Output contract | template/schema and required IDs/links/evidence |
| Checks | deterministic commands and semantic self-review checklist |
| Gates | decisions requiring developer/reviewer approval |
| Failure/recovery | blocked states, missing facts, stale context, scope expansion |
| Handoff | next state, produced artifacts, next eligible skill |

## Recommended atomic skill catalog

The first catalog should be small enough to maintain:

| Skill | Role | Primary output |
|-------|------|----------------|
| `route-work` | router | intent, risk, workflow, required layer profile |
| `capture-requirements` | analyst | BRD/SRS/NFR deltas with acceptance criteria |
| `model-domain-workflow` | analyst/designer | concepts, invariants, states, workflow UML |
| `design-solution` | designer | architecture/data/security/contract/component after-state |
| `analyze-impact` | analyst | affected IDs/layers/files, compatibility and risk |
| `plan-execution` | planner | ordered executable tasks and verification plan |
| `build-context` | context builder | validated manifest and bounded Context Pack |
| `implement-task` | implementer | code/config/tests inside one task contract |
| `verify-change` | verifier | deterministic results, evidence, semantic findings |
| `reconcile-knowledge` | reconciler | validated canonical after-state and archive summary |
| `inventory-code` | inventory | app/module/file map with evidence/confidence |
| `migrate-blueprint` | migration | previewed v1.2→v1.3 mapping and findings |

Conditional later skills can cover threat modeling, data migration, release readiness, incident analysis, and adapter authoring. Do not create a new skill for every artifact type if `design-solution` can use a selected template profile.

## Thin compatibility entry skills

Keep `/initial-build`, `/change-mode`, `/polish`, `/bug-fix`, and `/reverse-engineer` as user-facing aliases. They should:

1. resolve the current project/change state;
2. route to the named workflow;
3. identify the next skill/action;
4. load only the workflow contract and manifest;
5. avoid repeating step-by-step procedure.

`/flow` becomes the human-friendly view of the workflow registry rather than a second hand-maintained routing table.

## Role policy

Roles are responsibilities, not mandatory separate models:

| Risk | Allowed combination |
|------|---------------------|
| Low | one person/agent may analyze, plan, implement, verify, and reconcile if deterministic checks pass |
| Medium | implementation may be combined; design or verification should receive a separate review when practical |
| High/Critical | design/security review and verification must be independent from the implementing agent/person; developer owns final risk acceptance |

The engine should record role/actor IDs in change metadata without requiring a multi-agent runtime.

## Skill quality tests

Each skill must pass fixture tests that prove:

- missing required inputs produce a blocked/error result, not invented facts;
- prohibited writes are not made;
- output satisfies its schema;
- stale Context Packs are rejected;
- scope expansion returns to analysis;
- the skill terminates at the declared handoff;
- the skill does not require unlisted chat history;
- the same fixture can be executed by supported agent targets from the same project artifacts.

## Migration order for skills

1. Define the contract and validator.
2. Implement `route-work`, `analyze-impact`, `plan-execution`, `implement-task`, `verify-change`, and `reconcile-knowledge`.
3. Add requirements/domain/design and inventory skills.
4. Convert existing commands to thin aliases.
5. Remove duplicated numbered summaries only after parity tests pass.

