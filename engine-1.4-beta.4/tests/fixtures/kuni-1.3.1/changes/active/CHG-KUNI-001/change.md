---
change_id: CHG-KUNI-001
status: in-progress
intent: initial-build
risk: medium
uncertainty: medium
judgment: high
artifact_mode: standard
adoption_mode: strict
baseline_revision: empty-main
owners: [product-owner]
reviewers: [product-owner]
selected_adapters: [generic, web-ui]
rejected_adapters: [web-api]
required_gates: [solution-quality-review, implementation-readiness-review]
depends_on: []
claimed_ids: [OUT-KUNI-001, CAP-KUNI-001, CAP-KUNI-002, CAP-KUNI-003, CAP-KUNI-004, UC-KUNI-001, UC-KUNI-002, UC-KUNI-003, REQ-KUNI-001, REQ-KUNI-002, REQ-KUNI-003, REQ-KUNI-004, REQ-KUNI-005, REQ-KUNI-006, REQ-KUNI-007, REQ-KUNI-008, REQ-KUNI-009, REQ-KUNI-010, REQ-KUNI-011, REQ-KUNI-012, REQ-KUNI-013, REQ-KUNI-014, REQ-KUNI-015, REQ-KUNI-016, REQ-KUNI-017, REQ-KUNI-018, NFR-KUNI-001, NFR-KUNI-002, NFR-KUNI-003, NFR-KUNI-004, NFR-KUNI-005, NFR-KUNI-006, DEC-KUNI-001, DEC-KUNI-002, DEC-KUNI-003, DEC-KUNI-004, DEC-KUNI-005, DEC-KUNI-006, DEC-KUNI-007, DEC-KUNI-008, DEC-KUNI-009, DEC-KUNI-010, DEC-KUNI-011, DEC-KUNI-012, DEC-KUNI-013, DEC-KUNI-014, DEC-KUNI-015, DEC-KUNI-016, DEC-KUNI-017, FND-KUNI-001, FND-KUNI-002, FND-KUNI-003, FND-KUNI-004, FND-KUNI-005, FND-KUNI-006, FND-KUNI-007, FND-KUNI-008, FND-KUNI-009, FND-KUNI-010, FND-KUNI-011, FND-KUNI-012, FND-KUNI-013, FND-KUNI-014, FND-KUNI-015, FND-KUNI-016, ASM-KUNI-001, ASM-KUNI-002, ASM-KUNI-003, ASM-KUNI-004, ASM-KUNI-005, ASM-KUNI-006, CRIT-KUNI-001, CRIT-KUNI-002, CRIT-KUNI-003, CRIT-KUNI-004, CRIT-KUNI-005, CRIT-KUNI-006, CRIT-KUNI-007, CRIT-KUNI-008, CRIT-KUNI-009, CRIT-KUNI-010, CRIT-KUNI-011, CRIT-KUNI-012, CRIT-KUNI-013, CRIT-KUNI-014, CRIT-KUNI-015, CRIT-KUNI-016, CRIT-KUNI-017, CRIT-KUNI-018, CRIT-KUNI-019, CRIT-KUNI-020, CRIT-KUNI-021, CRIT-KUNI-022, CRIT-KUNI-023, CRIT-KUNI-024, CRIT-KUNI-025, RDR-KUNI-001, RDR-KUNI-002, RDR-KUNI-003, RDR-KUNI-004, RDR-KUNI-005, RDR-KUNI-006, RDR-KUNI-007, RDR-KUNI-008, RDR-KUNI-009, RDR-KUNI-010, RDR-KUNI-011, RDR-KUNI-012, RDR-KUNI-013, RDR-KUNI-014, RDR-KUNI-015, RDR-KUNI-016, RDR-KUNI-017, CON-KUNI-GRAPH, CON-KUNI-NODE, CON-KUNI-EDGE, CON-KUNI-TYPE, CON-KUNI-IMPORTANCE, CON-KUNI-CLUSTER, CON-KUNI-NEIGHBOR, CON-KUNI-VIEW, CON-KUNI-CAMERA, INV-KUNI-001, INV-KUNI-002, INV-KUNI-003, INV-KUNI-004, INV-KUNI-005, INV-KUNI-006, INV-KUNI-007, INV-KUNI-008, INV-KUNI-009, INV-KUNI-010, WF-KUNI-EXPLORE, WF-KUNI-INSPECT, WF-KUNI-CONTROL, PAT-KUNI-001, PAT-KUNI-002, PAT-KUNI-003, PAT-KUNI-004, PAT-KUNI-005, PAT-KUNI-006, PAT-KUNI-007, PAT-KUNI-008, PAT-KUNI-009, PAT-KUNI-010, CMP-KUNI-APP, CMP-KUNI-CANVAS, CMP-KUNI-NODES, CMP-KUNI-EDGES, CMP-KUNI-LABELS, CMP-KUNI-HUD, CMP-KUNI-DETAILS, CMP-KUNI-STORE, CMP-KUNI-GENERATOR, CMP-KUNI-CONFIG, ACT-KUNI-LAUNCH, ACT-KUNI-HOVER, ACT-KUNI-SELECT, ACT-KUNI-CLEAR, ACT-KUNI-ORBIT, ACT-KUNI-FOCUS, ACT-KUNI-RESET, ACT-KUNI-LABELS, ACT-KUNI-ROTATE, ACT-KUNI-RANDOMIZE, TEST-KUNI-001, TEST-KUNI-002, TEST-KUNI-003, TEST-KUNI-004, TEST-KUNI-005, TEST-KUNI-006, REV-KUNI-SQR-001, REV-KUNI-IRR-001, EVD-KUNI-001, EVD-KUNI-002, EVD-KUNI-003, EVD-KUNI-004, EVD-KUNI-005, EVD-KUNI-006, EVD-KUNI-007, EVD-KUNI-008, EVD-KUNI-009, EVD-KUNI-010, EVD-KUNI-011, EVD-KUNI-012, EVD-KUNI-013, EVD-KUNI-014, EVD-KUNI-015, EVD-KUNI-016, EVD-KUNI-017, EVD-KUNI-018, EVD-KUNI-019, EVD-KUNI-020, EVD-KUNI-021, EVD-KUNI-022, EVD-KUNI-023, EVD-KUNI-024, EVD-KUNI-025]
claimed_paths: [profile.md, system-map.md, knowledge/01-business/brd.md, knowledge/02-requirements/requirements.md, knowledge/02-requirements/nfr.md, knowledge/03-domain/domain.md, knowledge/03-domain/workflows/explorer.md, knowledge/04-design/architecture/overview.md, knowledge/04-design/experience/experience.md, knowledge/04-design/data/graph-model.md, knowledge/05-implementation/components/components.md, knowledge/05-implementation/actions/actions.md, knowledge/05-implementation/tests/tests.md, knowledge/06-quality/quality.md, changes/active/CHG-KUNI-001, contexts, docs/reference/3d-network-reference.png]
---

# Change · First visual universe

## Outcome

Capture the first Knowledge Universe milestone so another session can design and implement a beautiful generic 3D network visualization with dummy data. The stakeholder can then judge visual quality and interaction before any real knowledge platform is funded.

Source: stakeholder brief 20 August 2026, explicit stack choice, blanket recommendation authority, and `docs/reference/3d-network-reference.png`.

## Non-goals

Authentication, backend, database, API, AI, RAG, real knowledge ingestion, accounts, permissions, collaboration, persistence, search engines, graph databases, realtime sync, advanced search, analytics, Angular, Vue, and any later semantic/timeline/algorithm product layer.

## Routing

See [routing decision](routing.md).

## Known findings, decisions, and assumptions

### FND-KUNI-001 · Main is empty

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** project inspection 2026-08-20
- **Confidence:** high
- **Observation:** no `system-map.md`, `profile.md`, knowledge, inventory, or application source existed before this change.
- **Rationale:** this is a greenfield Initial Build, not a delta on reconciled Main.

### FND-KUNI-002 · Frame-rate target is unspecified

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** gap in stakeholder-brief-2026-08-20
- **Confidence:** high
- **Observation:** “good performance” and later thousands of nodes are required, but no numeric frame-rate or hardware class was given.
- **Rationale:** a measurable floor is needed for verification. Closed by `ASM-KUNI-001`.

### FND-KUNI-003 · Randomize semantics were unspecified

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** gap in stakeholder-brief-2026-08-20
- **Confidence:** high
- **Observation:** Randomize was requested without saying whether topology, positions, or both change.
- **Rationale:** closed by `DEC-KUNI-013`.

### FND-KUNI-004 · Mobile depth is unspecified

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Confidence:** high
- **Observation:** mobile “can be basic” is not a detailed experience.
- **Rationale:** closed by `DEC-KUNI-014`.

### FND-KUNI-005 · Visual quality bar is qualitative

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** critical
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Confidence:** high
- **Observation:** the brief asks for Apple-level polish, cinematic depth, and a result substantially better than the reference, without a numeric visual score.
- **Rationale:** a model cannot approve its own ungrounded taste bar. Observable anti-patterns and owner adjudication are recorded in the QDC. First-pass B+ / final A are contract targets accepted under recommendation authority (`ASM-KUNI-005`).

### FND-KUNI-006 · Reference is an engineering-demo screenshot

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Confidence:** high
- **Observation:** the attached Reddit `r/threejs` image shows a dense 3D node-link graph on flat black, neon category colors, thin gray edges, some `RELATED_TO` edge labels, icons in large nodes, and a selected red ring. Surrounding Reddit chrome is not product UI.
- **Rationale:** retain spatial density and dark immersion; do not reproduce flat black, noisy edge labels, or literal entities. Durable retain/adapt/reject records are in [reference decisions](reference-decisions.md).

### FND-KUNI-007 · Future platform is explicitly out of scope

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Confidence:** high
- **Observation:** the brief forbids auth, backend, AI, persistence, real ingestion, and advanced search in this milestone.
- **Rationale:** capture must not import later-phase capabilities from other projects.

### FND-KUNI-008 · Recommendation authority is granted

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder message 2026-08-20
- **Confidence:** high
- **Observation:** the stakeholder authorized proceeding in any flow step using all recommendations for any question.
- **Rationale:** material gaps are closed as `DEC-*` or `ASM-*` rather than blocking questions.

### DEC-KUNI-001 · First milestone is visual-only

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** critical
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** build only a generic 3D network visualization with local dummy data so visual quality and interaction can be judged.

### DEC-KUNI-002 · Client stack

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** use React, TypeScript, Vite, Three.js, React Three Fiber, Drei, Zustand, Tailwind CSS, and Framer Motion. Do not use Angular or Vue. Do not add unnecessary frameworks.

### DEC-KUNI-003 · Local dummy data only

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** critical
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** all graph content is generated locally. No backend, API, persistence, or live knowledge source.

### DEC-KUNI-004 · Product chrome copy

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** title is “Knowledge Universe”. Subtitle is “Interactive 3D Network”.

### DEC-KUNI-005 · Node and relationship type sets

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** node types are person, organization, concept, technology, place, event, and document. Relationship types are RELATED_TO, DEPENDS_ON, CREATED_BY, LOCATED_IN, PART_OF, INFLUENCES, WORKS_AT, and STUDIED_AT.

### DEC-KUNI-006 · Desktop-first surfaces

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** desktop is the acceptance target. Laptop and tablet must remain usable.

### DEC-KUNI-007 · Search is a visual placeholder

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** a polished search field is visible and architecture-ready. It does not search, filter, or query.

### DEC-KUNI-008 · Renderer is generic

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** the renderer works from arbitrary node and edge objects. Dummy names are data, not rendering branches.

### DEC-KUNI-009 · Chrome composition

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20 plus recommendation authority for placement
- **Statement:** top-left title and subtitle; top-right Reset View, Randomize, Toggle Labels, and Toggle Auto Rotate; bottom-left type legend; top-center search placeholder; bottom-right glass details panel on selection. The graph dominates. This is not an admin dashboard.

### DEC-KUNI-010 · Reference is inspiration

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** inspect `docs/reference/3d-network-reference.png` for density, dark environment, relationships, labels, and spatial feeling. Do not reproduce it literally. The result must look substantially more polished and cinematic.

### DEC-KUNI-011 · Visual interaction states

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** the graph has default, hover, selected, focus, and dimmed states. Unrelated elements dim and remain visible. Transitions are smooth.

### DEC-KUNI-012 · Label visibility policy

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** default labels appear for important nodes only. Hovered and selected nodes always show a readable glass label. Nearby nodes may reveal labels as the camera approaches. Toggle Labels hides or shows default importance labels without removing hover and selection labels. Persistent edge labels are not required in this milestone.

### DEC-KUNI-013 · Randomize creates a new dummy graph

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** recommendation authorized 2026-08-20
- **Statement:** Randomize replaces the current dummy graph with a new seeded instance, including new positions and a valid clustered relationship pattern. The new graph still meets density and cluster requirements.

### DEC-KUNI-014 · Basic mobile and empty-canvas clear

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** recommendation authorized 2026-08-20
- **Statement:** mobile keeps a usable touch-orbit canvas; chrome may stack. Clicking empty canvas clears selection, hover, focus, and the details panel. Reset View also restores the initial camera framing.

### DEC-KUNI-015 · Auto-rotate is opt-in

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** recommendation authorized 2026-08-20
- **Statement:** auto-rotate is off by default. When enabled it is slow, interruptible by pointer input, and must not feel aggressive.

### DEC-KUNI-016 · Selection may focus the camera

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** non-material
- **Authority:** product-owner
- **Source:** recommendation authorized 2026-08-20
- **Statement:** selecting a node smoothly approaches the camera toward that node. This is in-scope polish, not a later-phase feature.

### DEC-KUNI-017 · Adapters and quality authority

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** recommendation authorized 2026-08-20
- **Statement:** this change selects `generic` and `web-ui` and rejects `web-api`. Material visual criteria are owner-adjudicated. High-judgment reviews cannot use implementer-self-check as the sole closer.

### ASM-KUNI-001 · Thirty frame-per-second verification floor

- **Kind:** assumption
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** approved-assumption
- **Materiality:** material
- **Authority:** product-owner
- **Source:** recommendation authorized 2026-08-20
- **Consequence:** verification may fail a graph that looks correct but stutters below this floor while orbiting on a typical desktop GPU.
- **Review point:** first visual verification of `CHG-KUNI-001`, or earlier if hardware class is specified.
- **Statement:** the first-milestone graph stays interactive while orbiting, with a verification floor of 30 frames per second.

### ASM-KUNI-002 · Importance is a zero-to-one signal

- **Kind:** assumption
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** approved-assumption
- **Materiality:** non-material
- **Authority:** product-owner
- **Source:** recommendation authorized 2026-08-20
- **Consequence:** size, default labels, and emphasis use the same 0–1 importance scale.
- **Review point:** domain modeling
- **Statement:** node importance is a number in the inclusive range 0–1.

### ASM-KUNI-003 · Acceptance viewports

- **Kind:** assumption
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** approved-assumption
- **Materiality:** material
- **Authority:** product-owner
- **Source:** recommendation authorized 2026-08-20
- **Consequence:** desktop and tablet checks use fixed viewports instead of an unbounded device matrix.
- **Review point:** first visual verification
- **Statement:** desktop acceptance is 1440×900. Tablet acceptance is 1024×768.

### ASM-KUNI-004 · No WCAG AA claim this slice

- **Kind:** assumption
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** approved-assumption
- **Materiality:** material
- **Authority:** product-owner
- **Source:** recommendation authorized 2026-08-20
- **Consequence:** this milestone will not be verified against WCAG AA. HUD controls remain keyboard-reachable; the canvas is pointer-first.
- **Review point:** any later accessibility-funded change
- **Statement:** no formal accessibility conformance is claimed for the first visual milestone.

### ASM-KUNI-005 · Contract quality targets

- **Kind:** assumption
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** approved-assumption
- **Materiality:** material
- **Authority:** product-owner
- **Source:** recommendation authorized 2026-08-20
- **Consequence:** SQR and verification use first-pass B+ and final A as owner-accepted contract targets, not as a model-invented taste score.
- **Review point:** Solution Quality Review
- **Statement:** first-pass target is B+. Final target is A.

### ASM-KUNI-006 · Dummy names are illustrative fiction

- **Kind:** assumption
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Decision status:** approved-assumption
- **Materiality:** non-material
- **Authority:** product-owner
- **Source:** recommendation authorized 2026-08-20
- **Consequence:** well-known public topic names may appear as dummy seeds without implying live or authoritative knowledge.
- **Review point:** any real-data change
- **Statement:** dummy entities may use public knowledge-topic names as fictional seeds. No personal data is collected.

## Reference decisions

See [reference decisions](reference-decisions.md). Source fingerprint `sha256:3e9816da3280619d1cf21dec4e56c24645e7bee392a91cb4466a82489b77f679`.

## Pattern decisions

See [pattern decisions](pattern-decisions.md).

## Solution quality review

See [solution quality review](solution-quality-review.md). Disposition: pass-with-conditions. The bound fingerprint lives on `REV-KUNI-SQR-001`.

## Quality Design Contract

See [Quality Design Contract](quality-design-contract.md).

## Proposed after-state

Main will contain first-milestone business, requirements, domain, experience, architecture, in-memory data, components, actions, planned tests, and quality strategy. This change owns the QDC, reference decisions, and pattern decisions. Tasks, context packs, and code are not part of this step.

## Approvals

- Stakeholder authorized applying recommendations for every capture question on 20 August 2026.
- Visual quality remains owner-adjudicated. This capture does not mark the product approved for implementation.

## Blockers

None. Material gaps are closed by decided records or approved assumptions.

## History

- 2026-08-20: routed as Initial Build and captured business, requirements, and QDC
- 2026-08-20: interpreted `docs/reference/3d-network-reference.png` into `RDR-KUNI-001`–`017`
- 2026-08-20: modeled domain concepts, invariants, and explorer workflows
- 2026-08-20: designed experience, architecture, data, components, actions, and `PAT-KUNI-001`–`010`
- 2026-08-20: solution quality review `REV-KUNI-SQR-001` pass-with-conditions
