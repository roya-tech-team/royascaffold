---
document_id: DOC-KUNI-NFR
title: Knowledge Universe non-functional requirements
layer: requirements
schema_version: 2
document_status: in-review
owners: [product-owner]
---

# Non-functional requirements

### NFR-KUNI-001 · Cinematic readable polish

- **Kind:** nfr
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Quality area:** usability / visual quality
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** a technically correct graph that looks like a demo fails the milestone.
- **Target:** dark futuristic presentation with depth, restrained glow, readable hierarchy, and no excessive neon, bloom, huge labels, or thick edges. The reference image is inspiration only; the result must look cleaner and more cinematic.
- **Scope:** canvas, nodes, edges, labels, HUD
- **Measurement:** visual review against `REQ-KUNI-001`, `REQ-KUNI-004`, `REQ-KUNI-016` and `docs/reference/3d-network-reference.png`
- **Threshold authority:** owner
- **Constrained by:** `CRIT-KUNI-016`

### NFR-KUNI-002 · Interactive performance on the first-milestone graph

- **Kind:** nfr
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Quality area:** performance
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** later graphs may grow; the first graph must already feel fluid.
- **Target:** 100–300 nodes and 200–800 edges remain interactive while orbiting on a typical desktop GPU. Numeric floor used for verification is 30 frames per second; see `ASM-KUNI-001`.
- **Scope:** graph rendering and camera motion
- **Measurement:** orbit the default graph for at least 10 seconds and observe sustained interactivity
- **Threshold authority:** approved-assumption
- **Constrained by:** `CRIT-KUNI-017`

### NFR-KUNI-003 · Rendering structure that can grow

- **Kind:** nfr
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** should
- **Quality area:** maintainability / capacity
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** thousands of nodes are a later concern, but first-slice structure must not paint every speck as an independent heavy object.
- **Target:** the first-milestone graph stays interactive, and later larger graphs are not blocked by unique heavy objects for every node or edge.
- **Scope:** rendering architecture
- **Measurement:** code review of rendering ownership after design
- **Threshold authority:** owner
- **Constrained by:** `CRIT-KUNI-025`

### NFR-KUNI-004 · Strict typed client

- **Kind:** nfr
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Quality area:** maintainability
- **Source:** stakeholder-brief-2026-08-20
- **Target:** TypeScript strict mode, no `any`, reusable graph types, configuration for visual constants.
- **Scope:** application source
- **Measurement:** `npm run typecheck` exits 0
- **Threshold authority:** owner
- **Constrained by:** `CRIT-KUNI-023`

### NFR-KUNI-005 · Desktop-first presentation

- **Kind:** nfr
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Quality area:** compatibility / usability
- **Source:** stakeholder-brief-2026-08-20
- **Target:** desktop is the design target; laptop and tablet remain usable; mobile is basic. See `DEC-KUNI-006` and `ASM-KUNI-003`.
- **Scope:** HUD and canvas
- **Measurement:** 1440×900 desktop and 1024×768 tablet viewport checks
- **Threshold authority:** approved-assumption
- **Constrained by:** `CRIT-KUNI-022`

### NFR-KUNI-006 · Local dummy data only

- **Kind:** nfr
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Quality area:** security / privacy / operations
- **Source:** stakeholder-brief-2026-08-20
- **Target:** no authentication, backend, database, API, or persistence in this slice.
- **Scope:** whole application
- **Measurement:** dependency and runtime review shows no server or identity integration
- **Threshold authority:** owner
- **Constrained by:** `CRIT-KUNI-020`
