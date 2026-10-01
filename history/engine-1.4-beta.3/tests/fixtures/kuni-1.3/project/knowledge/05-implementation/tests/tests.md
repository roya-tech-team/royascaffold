---
document_id: DOC-KUNI-TESTS
title: Knowledge Universe test catalog
layer: implementation
schema_version: 1
document_status: approved
owners: [knowledge-universe-team]
---

# Tests

### TEST-KUNI-001 · Launch and chrome

- **Kind:** test
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Level:** system observation
- **Method:** start the dev server, open the app, inspect first paint and chrome
- **Command:** `npm run dev`
- **Expected:** full-screen graph, approved title, search placeholder, controls, legend
- **Covers:** `REQ-KUNI-001`, `REQ-KUNI-015`, `REQ-KUNI-016`, `REQ-KUNI-018`, `NFR-KUNI-001`, `NFR-KUNI-005`

### TEST-KUNI-002 · Dummy graph shape

- **Kind:** test
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Level:** component / observation
- **Method:** inspect generated graph counts, types, clusters, and generic rendering
- **Expected:** 100–300 nodes, 200–800 edges, five or more types, visible clusters, no renderer branches on dummy names
- **Covers:** `REQ-KUNI-002`, `REQ-KUNI-003`, `REQ-KUNI-004`, `REQ-KUNI-005`, `REQ-KUNI-017`, `INV-KUNI-001`, `NFR-KUNI-002`

### TEST-KUNI-003 · Hover and selection

- **Kind:** test
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Level:** system observation
- **Method:** hover a node, click it, click empty space, observe camera ease
- **Expected:** hover emphasis, selected neighborhood, dimmed others, details panel, clear on empty click
- **Covers:** `REQ-KUNI-006`, `REQ-KUNI-007`, `REQ-KUNI-008`, `REQ-KUNI-009`, `INV-KUNI-003`

### TEST-KUNI-004 · View controls

- **Kind:** test
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Level:** system observation
- **Method:** exercise Reset View, Toggle Labels, Randomize, and Toggle Auto Rotate
- **Expected:** each control matches its requirement; randomized graph remains valid
- **Covers:** `REQ-KUNI-010`, `REQ-KUNI-011`, `REQ-KUNI-012`, `REQ-KUNI-013`, `REQ-KUNI-014`, `INV-KUNI-002`

### TEST-KUNI-005 · Typecheck and local-only structure

- **Kind:** test
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Level:** static
- **Command:** `npm run typecheck`
- **Expected:** exit 0; no `any`; no backend or identity dependencies; visual constants centralized
- **Covers:** `NFR-KUNI-003`, `NFR-KUNI-004`, `NFR-KUNI-006`, `INV-KUNI-004`, `INV-KUNI-005`

### TEST-KUNI-006 · Path and influence

- **Kind:** test
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Level:** observation plus local computation
- **Expected:** Path mode traces a walk or reports none; Influence mode changes emphasis and shows a score
- **Covers:** `REQ-KUNI-019`, `REQ-KUNI-020`, `INV-KUNI-006`

### TEST-KUNI-007 · Semantic links

- **Kind:** test
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Level:** observation
- **Expected:** typed neighbors, path chain, relationship filter, and path-edge labels
- **Covers:** `REQ-KUNI-021`, `REQ-KUNI-022`

### TEST-KUNI-008 · Timeline

- **Kind:** test
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Level:** observation
- **Expected:** every node has a year; earlier playhead dims later nodes; play and reset work
- **Covers:** `REQ-KUNI-023`, `REQ-KUNI-024`, `INV-KUNI-007`
