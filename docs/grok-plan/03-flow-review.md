# Flow review

Normative sources: `engine/flow.md` and `engine/flows/*.md`. Visual map: `docs/flows/06-flow-uml-diagrams.md`.

The five flows are coherent. They share one isolation model and one implementation path. The problems are incomplete intent coverage, weak context selection, and a design order that skips analysis.

## Router (`engine/flow.md`)

**What it does well**

- Forces a read of the router on every task.
- Blocks Change / Polish / Bug until a blueprint exists.
- Resume rule is explicit: change-log, then build-program, then the pack.
- Triage table is short enough to use.

**What is weak**

- Intent is only five buckets. Refactor, migration, architecture change, security incident, documentation-only, and “reconcile the blueprint with the code” all get forced through Change Mode.
- There is no risk axis. Risk should choose gates and evidence. Intent should choose artifacts.
- “Read all relevant files” is still the implied discovery method after routing.

**Target**

```text
intent  ×  risk  →  workflow  +  required layers  +  gate set
```

Examples:

| Intent | Risk | Workflow | Minimum layers |
|--------|------|----------|----------------|
| New capability | Medium | Change | Concept slice, contracts, actions, code-map |
| Copy / spacing | Low | Polish micro | Page notes + code-map if files change |
| Payment rule | High | Change + architecture review | Concept, workflow, security, contracts, tests |
| Behavior-preserving cleanup | Medium | Refactor | Characterization tests, code-map, no requirement change |
| Inherited repo | — | Reverse Engineer | Inventory → module checkpoints, not a whole-repo gulp |

## Initial Build (Phases 0–4)

**Strengths**

- Description interview is a real Phase 0.
- Profile keys become `actions/<app>/` folders — a clean identity model.
- Phase 2 writes `planned` specs; Phase 3 implements one pack; Phase 4 is system-level.
- Pre-build gate and hard stop after each pack are the right anti-monolith controls.
- Dependency gate on REQ-INIT packs is correct.

**Structural problem**

Phase 1 is modules + rules + **data model**. Phase 2 is services → endpoints → pages. That is construction design. It skips:

1. Conceptual model / BRD
2. Workflows and state machines
3. Architecture style and boundaries
4. Contracts
5. Component plan that is not “everything is a service”

The flow also materializes **every** init pack up front. On a large or uncertain product that freezes a backlog before the first slice teaches anything.

**Target order**

```text
0  Description + profile
1  Concept: actors, capabilities, use cases, invariants, key workflows
2  Design: modules, authorization, architecture overview, data, contracts
3  Implementation map: components, actions, code-map plan
4  Build program: next pack or small ready batch — not the entire future
5  Execute one vertical pack through Change Mode
6  System verify when the program is done or the user asks
```

Do not require every layer file for a three-entity tool. Progressive detail: one file per layer until size or ownership forces a split.

**Keep**

- No monolith Phase 3
- Same implementation path as Change Mode
- Phase 4 checks, but add concept/architecture/contract/code-map groups and require evidence

## Change Mode (Phase 5)

This is the heart of the engine. Treat it as the only place code is written.

**Strengths**

- Isolation invariant is unambiguous.
- Standard path: understand → recon/impact → draft delta → implement → verify → merge.
- Fast-track exists for small work.
- After-state + in-place merge (never append `change-ID` sections) keeps main readable.
- Multi-part `request-id` / `depends-on` is the right team primitive.
- Implementer load set is small and named.

**Weaknesses**

- Impact analysis asks about services/endpoints/pages. It does not ask: does meaning change? does a workflow change? does a contract break? which files are created, generated, or only supporting?
- Fast-track keys off “one module, no new entity, not both sides.” A one-file auth bypass can pass that and skip review.
- `verified` is allowed as a dependency for implementation. On separate branches, “verified” code may not exist in the other working tree.
- Pack blueprint only mirrors `plan/` + `actions/`. New layers have nowhere to go.
- Verification is five prose checks. No file-classification invariant.
- Every parallel pack edits `change-log.md`.

**Target**

1. Classify intent and risk first.
2. Impact must mark each layer `changed` or `unchanged`.
3. Pack `blueprint/` contains only affected slices of the new layers.
4. Separate gates:
   - **Design** may start when the dependency is `verified` or the after-state is published.
   - **Implement** only when dependency code is in this working tree.
   - **Merge** only onto a baseline that already contains those dependencies.
5. Low-risk fast-track may combine implement + merge if the user pre-authorized it.
6. High/critical work adds architecture or security review and an evidence review.

## Polish (Phase P)

**Strengths**

- Clear forbidden list: no data, endpoints, auth, or rules.
- Conversion path to Change Mode keeps the same folder.
- Still uses a pack, so the next session can see the work.

**Weaknesses**

- One size. Token tweak and design-system overhaul look the same.
- Visual evidence is optional. Polish without a screenshot or token check is easy to fake.
- Still pays full pack ceremony for a one-line copy fix.

**Target sizes**

| Size | Use | Record |
|------|-----|--------|
| Micro | Copy, spacing, token-consistent tweak | Compact pack; code-map only if files change |
| Page | Meaningful page/view redesign | Normal polish pack + screenshot / a11y notes |
| System | Tokens, nav, theme, cross-app | Change Mode with architecture impact |

## Bug Fix (Phase 6)

**Strengths**

- Decision tree is easy to apply.
- Path A reuses Change Mode instead of inventing a second code path.
- Path B keeps genuine one-file fixes cheap.
- Bug log is a simple team index.

**Weaknesses**

- Path choice is scope (blueprint / multi-module / migration), not severity. A security hole in one file can take Path B and skip a pack, regression test, and code-map.
- Path B does not require a regression test or a written reason it cannot be automated.
- Path B can leave the blueprint silently wrong if the investigator misses plan drift.

**Target**

Use **scope and risk**. Security, data corruption, public-contract breakage, migrations, and irreversible behavior always use a full pack. Path B must still record root cause, changed files, verification evidence, and a rollback note when production is involved.

## Reverse Engineer (Phase R)

**Strengths**

- Same artifact family as greenfield, so later flows work.
- Writes `done` / `partial` from code, never invents `planned` ghosts.
- Drift report categories are useful: undocumented, incomplete, violations, dead code, config.
- Handoff to REQ-R packs is the right way to fix without a rewrite.
- Appendices for framework detection are practical — but they belong in adapters, not in the core flow forever.

**Weaknesses**

- R.1 is “deep-scan every application.” That is how context dies and how a model overclaims.
- Extraction order is schema → services → endpoints → pages. Meaning is inferred last, in `description.md`, often marked `[INFERRED]` and then forgotten.
- Confidence is not a field. Inferred facts become `done`.
- Guards, jobs, middleware, and mappers are scanned as drift leftovers, then still have no main home.
- One confirmation gate after the entire blueprint is too late. Review must be per app or per module.

**Target**

```text
Inventory apps and files
    → classify components and contracts per module
        → attach evidence + confidence
            → infer concepts and workflows
                → review one boundary at a time
                    → orphan checks
                        → queue REQ-R
```

Only confirmed or high-confidence implemented artifacts become `done`.

## Shared model: isolation and merge

The shared state machine is sound:

```text
main read-only → pack draft → approved code → verify → approved merge → main updated
```

Keep it. Extend the pack so it can carry concept, architecture, contract, and code-map deltas. Stop treating merged packs as live reading material.

## Flow coverage gap

| Work type | v1.2 home | Verdict |
|-----------|-----------|---------|
| Greenfield | Initial Build | Keep; change design order |
| Feature / modify | Change Mode | Keep; add layers and risk |
| Cosmetic UI | Polish | Keep; add sizes |
| Bug | Bug Fix | Keep; add risk and evidence |
| Onboard code | Reverse Engineer | Keep; inventory-first |
| Refactor | Forced into Change | Add a thin workflow |
| Migration / cutover | Forced into Change | Add a thin workflow |
| Architecture RFC | Forced into Change | Add ADR path + staged packs |
| Reconcile docs to code | Implicit at merge | Make explicit |

Do not create five new giant flow files. Add thin orchestrations that still implement through Change Mode.
