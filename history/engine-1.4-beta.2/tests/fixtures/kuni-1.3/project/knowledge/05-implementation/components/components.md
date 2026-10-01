---
document_id: DOC-KUNI-COMPONENTS
title: Knowledge Universe components
layer: implementation
schema_version: 1
document_status: approved
owners: [knowledge-universe-team]
---

# Components

### CMP-KUNI-APP · Application shell

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Responsibility:** mount the full-screen graph and overlay chrome.
- **Runtime:** web client
- **Depends on:** `CMP-KUNI-CANVAS`, `CMP-KUNI-HUD`, `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-001`, `REQ-KUNI-016`

### CMP-KUNI-CANVAS · Graph canvas

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Responsibility:** host the WebGL scene, camera, lights, fog, and post-process at a restrained level.
- **Runtime:** web client
- **Depends on:** `CMP-KUNI-NODES`, `CMP-KUNI-EDGES`, `CMP-KUNI-LABELS`
- **Implements:** `REQ-KUNI-001`, `REQ-KUNI-006`
- **Constrained by:** `NFR-KUNI-001`, `NFR-KUNI-002`

### CMP-KUNI-NODES · Node renderer

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Responsibility:** draw nodes from generic objects using centralized type configuration and shared or instanced geometry. Handle pointer hit testing.
- **Depends on:** `CMP-KUNI-CONFIG`, `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-003`, `REQ-KUNI-007`, `REQ-KUNI-008`, `REQ-KUNI-017`
- **Constrained by:** `INV-KUNI-001`, `INV-KUNI-005`, `ADR-KUNI-003`

### CMP-KUNI-EDGES · Edge renderer

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Responsibility:** draw thin glowing connections from generic edges using buffer-backed lines and type configuration.
- **Depends on:** `CMP-KUNI-CONFIG`, `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-004`
- **Constrained by:** `ADR-KUNI-003`

### CMP-KUNI-LABELS · Node labels

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Responsibility:** show readable glass labels for important, nearby, hovered, and selected nodes.
- **Depends on:** `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-010`
- **Constrained by:** `INV-KUNI-002`

### CMP-KUNI-HUD · Overlay chrome

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Responsibility:** title, search placeholder, view controls, and legend. Must stay visually quiet.
- **Depends on:** `CMP-KUNI-STORE`, `CMP-KUNI-DETAILS`
- **Implements:** `REQ-KUNI-011`, `REQ-KUNI-012`, `REQ-KUNI-013`, `REQ-KUNI-014`, `REQ-KUNI-015`, `REQ-KUNI-016`

### CMP-KUNI-DETAILS · Node details panel

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Responsibility:** glass panel for the selected node: name, type, description, connection count.
- **Depends on:** `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-009`

### CMP-KUNI-STORE · Graph and view state

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Responsibility:** current graph instance plus hovered, selected, label visibility, auto-rotate, and focus intent. Must not store the rendering scene.
- **Implements:** `REQ-KUNI-008`, `REQ-KUNI-013`
- **Constrained by:** `ADR-KUNI-002`

### CMP-KUNI-GENERATOR · Dummy graph generator

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Responsibility:** create clustered dummy graphs that satisfy count, hierarchy, and relationship pattern rules.
- **Implements:** `REQ-KUNI-002`, `REQ-KUNI-005`, `REQ-KUNI-017`
- **Constrained by:** `INV-KUNI-001`, `INV-KUNI-004`

### CMP-KUNI-CONFIG · Visual configuration

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Responsibility:** centralized node type, edge type, camera, and atmosphere constants.
- **Implements:** `REQ-KUNI-003`
- **Constrained by:** `INV-KUNI-005`

### CMP-KUNI-ALGO · Graph analysis

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Responsibility:** compute shortest path and influence on the current graph instance.
- **Implements:** `REQ-KUNI-019`, `REQ-KUNI-020`
- **Constrained by:** `INV-KUNI-006`, `ADR-KUNI-005`

### CMP-KUNI-TIMELINE · Timeline chrome

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Responsibility:** year playhead, play, and pause. Does not own node years.
- **Depends on:** `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-024`
- **Constrained by:** `ADR-KUNI-006`

### CMP-KUNI-SEMANTIC · Semantic chrome

- **Kind:** component
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Responsibility:** path chain, typed neighbor list, relationship filters, and path-edge labels.
- **Depends on:** `CMP-KUNI-STORE`, `CMP-KUNI-CONFIG`
- **Implements:** `REQ-KUNI-021`, `REQ-KUNI-022`
