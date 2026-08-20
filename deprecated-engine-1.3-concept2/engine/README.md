# RoyaScaff v1.3 Concept 2 Engine

This engine is a Markdown-first SDLC knowledge compiler. Start with [`flow.md`](flow.md), then load one workflow and only the skills/context it declares.

## Invariants

1. Canonical project knowledge lives under `project/` and has one home per fact.
2. Main Blueprint means `project/system-map.md` plus canonical layered knowledge.
3. Slice Manifests and Context Packs select/reference canonical knowledge; they do not own it.
4. Active changes own proposed after-state deltas and execution records.
5. Implementation tasks do not edit canonical project knowledge.
6. Verification requires deterministic evidence and resolved semantic findings.
7. Only reconciliation applies a verified delta to canonical knowledge.
8. Reusable skills contain procedure; project knowledge stays in `project/`.
9. Generated indexes are derived views and must not be edited by hand.
10. Significant source files have a component/contract owner, support relationship, generator, or exclusion.

## Engine contents

- `flow.md` — intent/risk router.
- `project-layout.md` — canonical/change/execution directory contract.
- `conventions.md` — IDs, metadata, relations, states, and evidence rules.
- `workflows/` — declarative workflow orchestration.
- `templates/` — concise artifact templates.
- `rules/` — technology-independent methodology rules.
- `adapters/` — technology discovery and validation guidance.

Deterministic tooling and schemas live beside this directory in `lib/` and `schemas/`.
