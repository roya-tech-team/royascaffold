---
document_id: DOC-KUNI-NFR
title: Knowledge Universe non-functional requirements
layer: requirements
schema_version: 1
document_status: approved
owners: [product-owner]
---

# Non-functional requirements

### NFR-KUNI-001 · Cinematic readable polish

- **Kind:** nfr
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Quality area:** usability / visual quality
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** a technically correct graph that looks like a demo fails the milestone.
- **Target:** dark futuristic presentation with depth, restrained glow, readable hierarchy, and no excessive neon, bloom, huge labels, or thick edges. The reference image is inspiration only; the result must look cleaner and more cinematic.
- **Scope:** canvas, nodes, edges, labels, HUD
- **Measurement:** visual review against `REQ-KUNI-001`, `REQ-KUNI-004`, `REQ-KUNI-016` and the reference file `docs/reference/3d-network-reference.png`
- **Verified by:** `TEST-KUNI-001`

### NFR-KUNI-002 · Interactive performance on the first-milestone graph

- **Kind:** nfr
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Quality area:** performance
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** later graphs may grow; the first graph must already feel fluid.
- **Target:** 100–300 nodes and 200–800 edges remain interactive while orbiting on a typical desktop GPU. Numeric floor used for verification is 30 frames per second; see `FND-KUNI-001`.
- **Scope:** graph rendering and camera motion
- **Measurement:** orbit the default graph for at least 10 seconds and observe sustained interactivity
- **Verified by:** `TEST-KUNI-002`

### NFR-KUNI-003 · Rendering structure that can grow

- **Kind:** nfr
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** should
- **Quality area:** maintainability / capacity
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** thousands of nodes are a later concern, but first-slice structure must not paint every speck as an independent heavy component.
- **Target:** shared geometries or instancing for repeated node forms; shared edge buffers; graph data separated from transient UI state; no scene graph stored as application state.
- **Scope:** rendering architecture
- **Measurement:** code review of rendering ownership
- **Verified by:** `TEST-KUNI-005`

### NFR-KUNI-004 · Strict typed client

- **Kind:** nfr
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Quality area:** maintainability
- **Source:** stakeholder-brief-2026-08-20
- **Target:** TypeScript strict mode, no `any`, reusable graph types, configuration for visual constants.
- **Scope:** application source
- **Measurement:** `npm run typecheck` exits 0
- **Verified by:** `TEST-KUNI-005`

### NFR-KUNI-005 · Desktop-first presentation

- **Kind:** nfr
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Quality area:** compatibility / usability
- **Source:** stakeholder-brief-2026-08-20
- **Target:** desktop is the design target; laptop and tablet remain usable; mobile is basic.
- **Scope:** HUD and canvas
- **Measurement:** desktop and tablet viewport checks
- **Verified by:** `TEST-KUNI-001`

### NFR-KUNI-006 · Local dummy data only

- **Kind:** nfr
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** product-owner
- **Priority:** must
- **Quality area:** security / privacy / operations
- **Source:** stakeholder-brief-2026-08-20
- **Target:** no authentication, backend, database, API, or persistence in this slice.
- **Scope:** whole application
- **Measurement:** dependency and runtime review shows no server or identity integration
- **Constrained by:** `INV-KUNI-004`
- **Verified by:** `TEST-KUNI-005`
