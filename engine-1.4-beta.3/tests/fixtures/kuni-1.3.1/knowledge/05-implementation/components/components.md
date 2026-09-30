---
document_id: DOC-KUNI-COMPONENTS
title: Knowledge Universe components
layer: implementation
schema_version: 2
document_status: in-review
owners: [knowledge-universe-team]
---

# Components

Private helpers attach using `supports`. This catalog is the implementation map. Source files do not exist yet.

### CMP-KUNI-APP · Application shell

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** mount the full-screen graph and overlay chrome.
- **Runtime:** web client
- **Depends on:** `CMP-KUNI-CANVAS`, `CMP-KUNI-HUD`, `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-001`, `REQ-KUNI-016`
- **Constrained by:** `PAT-KUNI-001`

### CMP-KUNI-CANVAS · Graph canvas

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** host the WebGL scene, camera, lights, fog, stars, and restrained post-process.
- **Runtime:** web client
- **Depends on:** `CMP-KUNI-NODES`, `CMP-KUNI-EDGES`, `CMP-KUNI-LABELS`
- **Implements:** `REQ-KUNI-001`, `REQ-KUNI-006`
- **Constrained by:** `NFR-KUNI-001`, `NFR-KUNI-002`, `PAT-KUNI-008`, `PAT-KUNI-010`

### CMP-KUNI-NODES · Node renderer

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** draw nodes from generic objects using centralized type configuration and shared or instanced geometry. Handle pointer hit testing.
- **Depends on:** `CMP-KUNI-CONFIG`, `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-003`, `REQ-KUNI-007`, `REQ-KUNI-008`, `REQ-KUNI-017`
- **Constrained by:** `INV-KUNI-001`, `INV-KUNI-005`, `PAT-KUNI-003`

### CMP-KUNI-EDGES · Edge renderer

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** draw thin glowing connections from generic edges using buffer-backed lines and type configuration.
- **Depends on:** `CMP-KUNI-CONFIG`, `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-004`
- **Constrained by:** `PAT-KUNI-003`, `RDR-KUNI-010`

### CMP-KUNI-LABELS · Node labels

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** show readable glass labels for important, nearby, hovered, and selected nodes.
- **Depends on:** `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-010`
- **Constrained by:** `INV-KUNI-002`, `PAT-KUNI-004`

### CMP-KUNI-HUD · Overlay chrome

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** title, search placeholder, view controls, and legend. Must stay visually quiet.
- **Depends on:** `CMP-KUNI-STORE`, `CMP-KUNI-DETAILS`
- **Implements:** `REQ-KUNI-011`, `REQ-KUNI-012`, `REQ-KUNI-013`, `REQ-KUNI-014`, `REQ-KUNI-015`, `REQ-KUNI-016`
- **Constrained by:** `PAT-KUNI-009`

### CMP-KUNI-DETAILS · Node details panel

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** show name, type, description, and connection count for the selected node in a glass panel.
- **Depends on:** `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-009`
- **Constrained by:** `PAT-KUNI-004`

### CMP-KUNI-STORE · Graph and attention store

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** hold the current graph value and hovered selected label auto-rotate and focus flags. Derive neighborhood. Clear attention on Randomize and Reset.
- **Depends on:** `CMP-KUNI-GENERATOR`
- **Implements:** `DEC-KUNI-011`, `DEC-KUNI-013`
- **Constrained by:** `PAT-KUNI-002`, `PAT-KUNI-007`

### CMP-KUNI-GENERATOR · Dummy graph generator

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** create a seeded clustered dummy graph that satisfies count and structure invariants.
- **Depends on:** `CMP-KUNI-CONFIG`
- **Implements:** `REQ-KUNI-002`, `REQ-KUNI-005`, `REQ-KUNI-013`
- **Constrained by:** `PAT-KUNI-005`, `INV-KUNI-006`

### CMP-KUNI-CONFIG · Visual and graph configuration

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** own node-type and edge-type visual tokens, camera constants, particle counts, and graph-size bounds.
- **Implements:** `REQ-KUNI-003`, `INV-KUNI-005`
- **Constrained by:** `PAT-KUNI-006`
