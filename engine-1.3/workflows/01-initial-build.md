# Initial Build Workflow

## Goal

Build a new system through layered knowledge and dependency-ready vertical slices.

## Sequence

1. **Discover:** create profile, select adapters/document profile, capture unknowns and owners.
2. **Business:** write BRD/outcomes/capabilities/scope/glossary.
3. **Requirements:** write functional requirements, acceptance criteria, NFRs, and priorities.
4. **Domain:** model concepts, invariants, and complex workflows with UML.
5. **System design:** create system map, architecture/quality/operations outline, and capability roadmap.
6. **Select next slice:** fully design contracts/data/components/actions/tests only for the next dependency-ready capability.
7. **Prepare:** create Change Blueprint, execution tasks, Slice Manifest, and Context Packs.
8. **Deliver:** implement one task, verify the slice, reconcile Main, optionally release.
9. **Repeat or stop:** Main and generated Next Up remain sufficient to resume.

## Gates

- business language/scope/workflow approval;
- system design/roadmap approval;
- per-slice design and execution-ready approval based on risk;
- verification and reconciliation gates.

## Stop rule

Never materialize or implement the whole system in one context. Stop after each reconciled slice or explicit pause.

