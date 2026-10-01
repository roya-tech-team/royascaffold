# RoyaScaff Engine 1.3 — SDLC Concept 2

This directory is an executable, Markdown-first SDLC knowledge compiler. It implements the approved v1.3 concept without modifying the v1.2 engine.

The design closes three recurring gaps:

1. A conceptual model is a canonical blueprint layer, linked to requirements, workflows, contracts, data, and code.
2. Significant source files cannot remain invisible: configured source roots are compared with an explicit component/code ownership map.
3. Architecture patterns, security controls, interfaces, request/response DTOs, service contracts, repositories, data models, tests, and ADRs are typed artifacts with stable IDs and validated relations.

## Install and verify

```bash
npm install
npm test
node bin/royascaff13.js validate engine .
```

Run the included PollPulse demonstration from this directory:

```bash
npm run index:demo
npm run validate:demo
npm run context:demo
```

## CLI

```text
royascaff13 validate engine [engineRoot]
royascaff13 validate project [projectRoot]
royascaff13 validate change CHG-ID --project projectRoot
royascaff13 validate task TASK-ID --project projectRoot [--changed-files path,path]
royascaff13 validate reconcile CHG-ID --project projectRoot
royascaff13 index [projectRoot]
royascaff13 context build --task TASK-ID --project projectRoot
royascaff13 change create --title "..." --project projectRoot
royascaff13 change transition CHG-ID state --project projectRoot
royascaff13 reconcile CHG-ID --project projectRoot [--apply]
royascaff13 init-project [projectRoot]
royascaff13 scaffold [targetDir] [--cursor] [--claude]
```

Reconciliation previews by default. Applying requires a `verified` change with schema-valid passing evidence, copies full after-state Markdown deltas to their canonical paths with scoped backup/rollback, regenerates indexes, and archives the change.

## Package structure

| Path | Purpose |
|---|---|
| `engine/` | router, workflow definitions, conventions, rules, adapters, templates |
| `skills/` | atomic procedural skills for supported agent hosts |
| `schemas/` | JSON Schemas for artifacts and lifecycle records |
| `lib/` | validation, indexing, context, lifecycle, reconciliation, scaffolding |
| `bin/` | dependency-light CLI entry point |
| `tests/` | deterministic engine and demo integration tests |

Start agent reasoning with `engine/flow.md`. The generic methodology is in `engine/rules/core-methodology.md`; technology-specific discovery is selected through adapters.

## Truth and mutation boundaries

- `project/system-map.md` is the human entry point; canonical layered documents own current facts.
- Generated indexes and context packs are derived views, never competing truth.
- Active changes own proposed deltas. Implementation tasks may change task-owned code and execution evidence, not canonical knowledge.
- Verification records exact commands, revision, time, working directory, outcome, and evidence.
- Only reconciliation may apply a verified delta to canonical knowledge.

## Concept-2 scope

Markdown delta reconciliation uses complete after-state files rather than fragile section merging. The context estimator uses a deterministic character-based approximation, not a model-specific tokenizer. The engine provides adapter guidance for Node/Express/React and a generic adapter; production repositories should add adapters and policy checks for their own stack.
