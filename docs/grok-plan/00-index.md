# RoyaScaff Improvement Plan — Grok Review

> **Status:** Independent review and recommended plan.  
> **Current engine:** v1.2.5.  
> **This folder does not change** `engine/`, `skills/`, or `bin/`.  
> **Date:** 2026-08-20.

This suite is a Grok review of the shipped engine, the five flows, the six skills, and the v1.3 blueprint proposal. It then recommends a simpler improvement path than a full “knowledge compiler,” organized around the six purposes you named.

## The one-sentence recommendation

Keep the isolation model (main / slice / change). Rebuild the **knowledge** so it follows standard SDLC layers, can be read from the top down, and can be loaded by a small model one task at a time.

```text
Understand the product
    → design the system
        → write an action plan
            → implement only that plan
                → prove it
                    → merge and keep the plan true
```

That is already the engine’s loop. v1.2 starts the loop too late (at persistence and services) and loads too much context. The fix is layers and compiled slices, not more ceremony.

## Reading order

| File | Purpose |
|------|---------|
| [01 — Purpose and success](01-purpose-and-success.md) | Your six purposes turned into success criteria |
| [02 — Current engine review](02-current-engine-review.md) | Advantages, disadvantages, and missing SDLC pieces |
| [03 — Flow review](03-flow-review.md) | Router and the five flows, one by one |
| [04 — Skills review](04-skills-review.md) | Why skills help and why they cannot carry v1.3 |
| [05 — Layered blueprint target](05-layered-blueprint.md) | Concept files, SDLC layers, UMLs, main / slice / change |
| [06 — Improvement plan](06-improvement-plan.md) | Phased work, what to keep, what to change, acceptance |

Design input this review used:

- [v1.3 blueprint model and flow revision](../proposals/v1.3-blueprint-model-and-flow-revision.md)
- [v1.3 plan index](../proposals/00-v1.3-plan-index.md) and [target architecture](../proposals/01-v1.3-target-architecture.md)

Those documents are directionally right. This plan disagrees with them on **order, vocabulary size, and how much compiler machinery v1.3 should ship**.

## Decisions this plan makes

1. **Organize knowledge by SDLC layer, not by “actions.”** A new reader starts at a system map with UMLs, then requirements/concept, then design, then implementation. Persistence is not the first model.
2. **Keep three blueprint kinds.** Main is current truth. A slice is a generated view for one task. A change pack is a temporary delta. Do not let slices become a second source of truth.
3. **Be generic first.** The core engine must describe products, libraries, CLIs, workers, and data systems. NestJS/React/REST defaults move into adapters.
4. **Optimize for a small model.** The engine wins when the next session loads a bounded pack, not when it writes more Markdown.
5. **Prefer fewer artifact types.** Concept, requirement, workflow, contract, component, action, decision, and file-map are enough. Do not ship twelve ID prefixes on day one.
6. **Greenfield starts with concept.** Reverse-engineer starts with inventory and code-map. Those are different entry orders.
7. **Add validators only after the files have a schema.** Prose-only v1.3 would recreate today’s drift.

## What v1.2 already got right

Do not throw these away:

- Engine purity and the rebuild test
- Isolated change packs and datetime IDs
- Vertical slices instead of “all backend, then all frontend”
- Human gates before material decisions
- Resume from indexes instead of chat history
- One implementation path (Change Mode 5.4–5.6)

## What v1.3 must add

- A conceptual / BRD layer before storage
- Project-specific architecture and contracts
- A durable home for every significant file
- Progressive disclosure with UMLs at the top
- Risk-based ceremony instead of the same gates for every change
- Generated indexes and evidence-backed verification
- Technology adapters so the methodology is not an API+SPA kit

## Relationship to the existing v1.3 suite

| Existing document | This plan’s stance |
|-------------------|--------------------|
| Blueprint revision | Adopt concept, components, contracts, code-map, evidence, risk gates. Reject “code-map first” for greenfield. Reduce ID explosion. |
| Target architecture (knowledge compiler) | Correct long-term shape. Too large as a single v1.3 product story. Ship a layered Markdown repository first; add a compiler when the schema is stable. |

The detailed delivery sequence is in [06 — Improvement plan](06-improvement-plan.md).
