# v1.3 Flow Router

Read this file first for every task.

## Entry checks

1. Locate the project root (`system-map.md` and `profile.md`).
2. If no v1.3 blueprint exists: use Initial Build for greenfield or Reverse Engineer for existing code.
3. If an active change exists, read its canonical metadata before creating another change.
4. Classify intent and risk using [risk-and-gates.md](risk-and-gates.md).
5. Select only the required workflow and skills; do not load all engine files.

## Routing

| Intent | Workflow |
|--------|----------|
| New product/system | [Initial Build](workflows/01-initial-build.md) |
| New or changed behavior, architecture, data, contract, migration | [Change](workflows/02-change.md) |
| Defect against approved behavior | [Bug Fix](workflows/03-bug-fix.md) |
| Presentation-only refinement | [Polish](workflows/04-polish.md) |
| Behavior-preserving restructuring | [Refactor](workflows/05-refactor.md) |
| Existing code without trusted v1.3 knowledge | [Reverse Engineer](workflows/06-reverse-engineer.md) |
| Code/blueprint disagreement | [Reconcile Drift](workflows/07-reconcile.md) |
| Release/deployment | [Release](workflows/08-release.md) |

Knowledge-only changes use the Change workflow without implementation tasks or fabricated code evidence.

## Common lifecycle

```text
draft → analyzed → approved → ready → in-progress → verified → reconciled → closed
```

Side states: `blocked`, `failed`, `cancelled`.

`implemented` is not `verified`; `verified` is not `reconciled`; `reconciled` is not necessarily `released`.

## Invariants

- Main owns reconciled durable facts.
- Slice Manifests and generated Context Packs are views.
- Change Blueprints own in-flight deltas.
- Implementation may not invent public behavior, contracts, architecture, migrations, dependencies, or security rules outside the approved task.
- Required context is never silently truncated.
- PASS requires fresh evidence; a checklist assertion alone is not evidence.

