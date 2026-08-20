# Current engine review (v1.2.5)

This is a review of the shipped product: `engine/`, `skills/`, `bin/royascaff.js`, and the PollPulse example. It is not a review of the v1.3 proposal.

## What the engine is today

```text
npx royascaff init
    copies engine/ + skills/
        agent reads flow.md
            writes project/
                implements code from a change pack
                    verifies in Markdown
                        merges into main
```

There is no parser, schema, context compiler, or test harness. Correctness is “the agent followed the prose.” That is both the product’s simplicity and its ceiling.

## Advantages to keep

### 1. Isolation before reconciliation

Implementation never edits main. The pack holds the after-state. Main updates only after verify and an explicit merge. This is the strongest idea in the engine. It makes resume, parallel work, and “main equals reality” possible.

### 2. Vertical slices

Initial Build refuses a monolith “all backend then all frontend” pass. A pack is one module’s data → services → endpoints → pages. That matches how software should ship and how a small model should work.

### 3. Engine purity and the rebuild test

`royascaff/engine/` stays generic. `project/` is the system. After merge, `project/` alone should be enough to understand and rebuild what is implemented. That is the right acceptance test. Keep it. Widen what “enough” means so it includes meaning, architecture, and file ownership, not only services and routes.

### 4. Stable IDs and a real traceability chain

`SVC-*`, `EP-*`, `PG-*`, `VW-*` let a page cite an endpoint and a check confirm it exists. Deviation-only specs keep files short. Both are worth preserving.

### 5. Human gates with a hard rule

Silence is not confirmation. The developer reviews a request, an impact list, and a merge — not a 400-file surprise. That is how AI work stays controlled.

### 6. Resume artifacts

`change-log.md`, `build-program.md`, and `status.md` let a new chat start from state instead of from a transcript. Datetime IDs avoid the sequential-counter collision.

### 7. One implementation path

REQ-INIT and REQ-R packs reuse Change Mode 5.4–5.6. That prevents two different ways to write code. New flows should keep delegating here.

### 8. Reverse Engineer as a first-class entry

Most “AI SDLC” tools only know greenfield. Phase R can onboard a living codebase and queue gaps. The *idea* is correct even though the scan is too unbounded.

### 9. Portable Markdown, no lock-in

No service, no database, MIT license. A team can read the blueprint in a pull request. Do not replace this with a proprietary store.

## Disadvantages

### 1. The blueprint starts at storage

The official chain is:

```text
Data Model → Services → Endpoints → Pages/Views
```

That is an implementation chain, not an SDLC chain. Missing before it:

- business language and actors
- capabilities and use cases
- workflows and state machines
- invariants that are not columns
- project architecture and dependency rules
- interfaces, DTOs, events, and provider payloads as owned records

PollPulse’s `description.md` is a good short BRD, but it is not a model. There is no place to put “a user may vote at most once” as a durable invariant linked to the service that enforces it and the test that proves it.

### 2. “Service” is used as a synonym for “component”

The engine knows controllers, repositories, guards, jobs, mappers, stores, and adapters exist. They appear in rules and sometimes in a pack `impact.md`. After merge they have no main home. The next session cannot see why `jwt.guard.ts` exists unless it re-reads the code.

### 3. Context construction is “read the relevant files”

The implementer load set is the right instinct. Getting *to* that pack still depends on the model discovering the right main files. On a large system that becomes the exact failure the engine was built to prevent: the model re-derives the architecture from too much text and drifts.

### 4. Status is copied by hand

Pack status lives in `change-request.md`, pack `status.md`, `change-log.md`, sometimes `build-program.md`, and rollups in `_index.md` / `status.md`. Parallel branches collide on the central log. Dashboards can lie.

### 5. Verification is declarative

`verify-code.md` and the 15 system checks can be marked PASS with no command output, no test list, and no file inventory. A confident model will check the boxes.

### 6. Ceremony is not risk-shaped

A one-line copy change and a payment-provider change share the same isolation story. Fast-track and Path B exist, but they key off file count and “is it cosmetic,” not off security, data, or public-contract risk. Teams will either skip the process or hate it.

### 7. Main means two things

Phase 2 writes the whole planned product onto main as `planned`. The docs then say main is implemented reality. Readers must interpret status to answer “what exists now?” versus “what did we approve next?” Those should be two fields, not one overloaded word.

### 8. Completed packs compete with current truth

Merged packs keep full deltas forever. Agents load historical after-states that main already superseded. History should be archived and summarized, not treated as live knowledge.

### 9. Genericity is incomplete

Purity forbids product nouns in the engine. The methodology still assumes:

- an API app and a web/mobile app
- REST, JWT, envelopes, pagination
- `controller → service → repository`
- `pages/` or `views/`

A CLI, a library, a worker-only system, or a data pipeline has to fake this shape. `conventions.md` and `engine/rules/` are good defaults for a common web stack. They are not a generic SDLC core.

### 10. Flows and skills duplicate each other

Skills summarize numbered steps so they are useful before the flow loads. When a gate or step number changes, the skill can lie. There is no skill contract, no atomic procedure, and no test that they match.

## Missing pieces relative to the six purposes

| Missing piece | Why it matters |
|---------------|----------------|
| Conceptual / BRD layer | Purpose 1 and 6. Without it, AI designs from tables and invents business meaning each session |
| Workflow files with UML | Purpose 4 and 6. Developers cannot “edit the workflow” because it is not a file |
| Project architecture | Purpose 2. Generic rules cannot record *this* product’s boundaries |
| Contract catalog | Purpose 2 and 3. DTOs and ports are names inside other specs |
| Code map | Purpose 3 and 4. Files appear in impact and vanish from main |
| System map | Purpose 6. There is no 5-minute entry document |
| Compiled slice | Purpose 5. The slice today is a copied subset of action specs, not a selected view across layers |
| Evidence requirement | Purpose 3. PASS must be auditable |
| Generated indexes | Purpose 4 and team work. Manual sync will always lose |
| Technology adapters | Purpose 1 as a *generic* engine |
| Risk model | Purpose 1 without drowning small work |
| Independent verification role | Purpose 5. The same agent that wrote the code should not be the only judge on high-risk work |

## Honest score against your purposes

1 is poor, 10 is excellent.

| Purpose | Score | Note |
|---------|:-----:|------|
| Standard SDLC with documents | 5 | Strong construction loop; weak analysis and design documents |
| AI produces design and action plan | 6 | Pack request + impact + delta specs are a plan; they start too late and omit architecture/contracts |
| Stick to the action plan | 7 | Isolation is excellent; proof is weak |
| Features keep plan and workflows current | 5 | Plan stays current for services/pages; workflows are not modeled |
| Small context / model independence | 4 | Pack load set helps; discovery and Phase R do not |
| Understand via files and UMLs, then go deeper | 4 | Indexes exist; no map, no UML layer, no declared depth path |

The engine is already a good **change-control** system. It is not yet a good **SDLC knowledge** system. v1.3 should add the second without breaking the first.
