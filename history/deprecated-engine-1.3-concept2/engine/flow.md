# RoyaScaff v1.3 Flow Router

Read this file first for every task.

## 1. Establish repository state

1. If `project/profile.md` is missing, route to `initialize-project`.
2. If `project/indexes/artifacts.json` is missing or stale, run project validation and index generation.
3. If resuming work, resolve the change/task from generated indexes rather than scanning historical folders.
4. Never load `changes/archive/` as current truth unless the task is audit/history.

## 2. Classify intent

| Intent | Workflow |
|--------|----------|
| Initialize a new workspace | `initialize-project.md` |
| Design a greenfield product | `design-project.md` |
| Implement the approved initial system | `implement-initial.md` |
| Add or modify behavior | `change-feature.md` |
| Correct behavior against approved truth | `bug-fix.md` |
| Preserve behavior while improving structure | `refactor.md` |
| Change cross-system architecture | `architecture-change.md` |
| Onboard existing code | `reverse-engineer.md` |
| Verify implemented work | `verify-implementation.md` |
| Apply verified after-state to canonical knowledge | `reconcile.md` |

Polish is a low-risk feature change unless it is a visual defect, in which case it is a bug. Documentation-only work uses Change Feature with `type: documentation`.

## 3. Classify risk

Start at `low`; raise risk for each material concern:

- public contract compatibility;
- security, permissions, PII, money, tenancy, or compliance;
- persistence migration or irreversible data change;
- more than one application/module/team;
- architecture/ADR change;
- production rollout/rollback complexity;
- weak tests or uncertain legacy behavior.

`critical` includes active security incidents, corruption, or unsafe irreversible production behavior.

Risk determines review gates. Mechanical generation and validation never need separate approval.

## 4. Context rule

Do not say “read all relevant documentation.” Each workflow invokes a skill with a context policy. Build a Context Manifest and Context Pack for bounded design, implementation, and review tasks. If required context exceeds budget, split the task.

## 5. Mutation boundary

| Role/step | May mutate |
|-----------|------------|
| Design skills | active change request/impact/delta |
| Planner/context compiler | active change execution files |
| Implementer | task-owned source/tests and task result/evidence |
| Verifier | verification/evidence/findings |
| Reconciler | canonical knowledge, generated indexes, archive |

Any material implementation deviation returns to design/approval. Never revise the plan silently to excuse code.
