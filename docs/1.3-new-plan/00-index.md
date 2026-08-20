# RoyaScaff v1.3 — New Engine Improvement Plan

> **Status:** Recommended plan for owner review.  
> **Reviewed baseline:** v1.2.5.  
> **Date:** 2026-08-20.  
> **Scope:** Planning only. This folder does not change `engine/`, `skills/`, `bin/`, or the package version.

## Executive conclusion

RoyaScaff already has a valuable **AI change-control loop**: isolated packs, vertical delivery, explicit gates, stable IDs, resumable state, and reconciliation into a main blueprint. It does not yet have a complete **SDLC knowledge model**. Business requirements, domain behavior, project-specific architecture, contracts, quality strategy, release/operations knowledge, and physical code ownership are incomplete or implicit.

v1.3 should therefore become a **Markdown-first, layered SDLC control engine**:

```text
Business intent
  → requirements and domain behavior
    → solution design
      → approved execution plan
        → bounded task context
          → implementation
            → evidence and independent checks
              → canonical knowledge reconciliation
                → release and operational learning
```

The engine should not reproduce heavyweight waterfall project management. **Waterfall is the reading and reasoning order; vertical change slices remain the delivery order.**

## The core design

The plan separates three axes that must not be mixed:

| Axis | Question | Examples |
|------|----------|----------|
| SDLC knowledge layer | What do we know about the system? | business, requirements, domain, design, implementation, quality, operations |
| Scope view | Which part matters now? | main blueprint, slice manifest, context pack, change delta |
| Lifecycle state | What has happened to it? | draft, approved, implemented, verified, superseded |

A feature slice is therefore a **reference-based view across layers**, not another copy of the system documentation. A change blueprint is a **temporary delta**, not a permanent competing truth. An execution plan is a **bounded implementation contract**, not a loose checklist.

## Decisions made by this plan

1. Preserve engine purity, Markdown portability, change isolation, stable IDs, vertical packs, the rebuild test, and explicit approval for material decisions.
2. Add a progressive SDLC reading path: system map → business/requirements → domain/workflows → design → implementation map → quality/operations.
3. Keep **Main, Slice, and Change Blueprint** as user concepts, but give each one precise ownership rules.
4. Use one canonical home for every durable fact; generate indexes, dashboards, and context packs.
5. Use separate `knowledge_status` and `implementation_status` fields.
6. Make requirements, workflows, components, contracts, decisions, tests/evidence, and significant source files traceable by stable IDs or typed links.
7. Make the core technology-neutral. Web/API/REST/JWT conventions become selectable adapters, not universal engine law.
8. Replace broad “read the relevant files” instructions with manifests and bounded, reproducible Context Packs.
9. Require an executable task plan with inputs, allowed scope, outputs, checks, and recovery notes before implementation.
10. Separate deterministic validation from AI semantic review. Neither may hide failures from the other.
11. Make ceremony depend on intent and risk, not mainly on file count.
12. Make skills atomic and testable; make flows thin orchestration over skills and deterministic actions.
13. Add release and operations artifacts when the product is deployable or operationally significant.
14. Deliver a **minimum reliable core** before advanced inference, adapters, or multi-agent automation.

## Reading order

| File | Purpose |
|------|---------|
| [01 — Goals and principles](01-goals-and-design-principles.md) | Converts the six product purposes into engineering success criteria and guardrails |
| [02 — Current engine review](02-current-engine-review.md) | Advantages, disadvantages, missing SDLC coverage, and review of the existing v1.3 proposal |
| [03 — Flow review](03-flow-review.md) | Reviews the router and all five active flows and defines the target flow model |
| [04 — Skills review](04-skills-review.md) | Reviews all six skills and proposes the v1.3 skill contract/catalog |
| [05 — Layered SDLC blueprint](05-layered-sdlc-blueprint.md) | Defines the knowledge layers, progressive disclosure, UML policy, and target project tree |
| [06 — Blueprint types and traceability](06-blueprint-types-and-traceability.md) | Defines Main/Slice/Change, statuses, IDs, ownership, and the traceability graph |
| [07 — Smart context and action plan](07-smart-context-and-action-plan.md) | Defines the small-model strategy, Context Pack, and executable task contract |
| [08 — Revised workflows and gates](08-revised-workflows-and-gates.md) | Defines intent × risk routing, lifecycle states, and each target workflow |
| [09 — Validation, evidence, and reconciliation](09-validation-reconciliation-and-evidence.md) | Defines deterministic checks, semantic review, evidence rules, and atomic reconciliation |
| [10 — Team collaboration and governance](10-team-collaboration-and-governance.md) | Defines ownership, parallel work, reviews, developer decisions, and handoff |
| [11 — Generic core and adapters](11-generic-core-and-adapters.md) | Keeps the method useful for any technology or product type |
| [12 — Delivery roadmap](12-delivery-roadmap.md) | Prioritized implementation phases, backlog, release slicing, and repository impact |
| [13 — Migration, evaluation, and acceptance](13-migration-evaluation-and-acceptance.md) | v1.2 migration, examples, model-independence evaluation, risks, and final acceptance |

## How this plan relates to the existing proposals

This plan uses the strongest ideas from:

- [Blueprint model and flow revision](../proposals/v1.3-blueprint-model-and-flow-revision.md): concept model, components, contracts, code map, evidence, risk gates, and single-source state.
- [Existing detailed v1.3 suite](../proposals/00-v1.3-plan-index.md): artifact graph, context manifest/compiler, deterministic validation, reconciliation, and adapters.
- [Independent Grok review](../grok-plan/00-index.md): progressive SDLC reading, smaller v1.3 scope, concept-first greenfield work, and delayed complexity.

It adds or strengthens:

- explicit BRD/SRS/NFR separation;
- quality, release, deployment, and operations layers;
- an exact execution-plan contract for weak-model implementation;
- document profiles that prevent small projects from drowning in files;
- objective model-independence evaluations;
- a release boundary between the minimum reliable core and advanced compiler behavior.

## Release recommendation

Do not release v1.3 as documentation-only, and do not make it wait for a sophisticated knowledge platform.

The minimum reliable v1.3.0 must include:

- the layered templates and revised flows;
- structured metadata and two-dimensional status;
- a code-map/significant-file rule;
- evidence-backed verification;
- generated indexes;
- deterministic project/change validation;
- a simple exact-reference Context Pack builder;
- migration support for the shipped example.

Advanced semantic impact inference, many stack adapters, UI visualization, or mandatory specialized agents belong in later v1.3.x releases.

## Approval boundary

Approval of this folder authorizes implementation planning and phased engine work. It does not authorize package publishing, destructive migration of user projects, or removal of v1.2 compatibility paths.

