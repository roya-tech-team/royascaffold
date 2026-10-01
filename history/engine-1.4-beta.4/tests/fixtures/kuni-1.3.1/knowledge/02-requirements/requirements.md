---
document_id: DOC-KUNI-REQUIREMENTS
title: Knowledge Universe functional requirements
layer: requirements
schema_version: 2
document_status: in-review
owners: [product-owner]
---

# Functional requirements

Requirements describe observable explorer behavior for the first visual milestone. They do not prescribe class names, file layout, or rendering mechanisms.

Actors: Explorer.

### UC-KUNI-001 · Explore the universe

- **Kind:** use-case
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Actor:** Explorer
- **Trigger:** the application opens
- **Preconditions:** a dummy graph is available locally
- **Outcome:** the explorer sees and orbits a full-screen clustered 3D network
- **Satisfies:** `CAP-KUNI-001`
- **Described by:** `WF-KUNI-EXPLORE`

### UC-KUNI-002 · Inspect a node

- **Kind:** use-case
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Actor:** Explorer
- **Trigger:** the explorer hovers or clicks a node
- **Outcome:** neighborhood emphasis and a details panel appear
- **Satisfies:** `CAP-KUNI-002`
- **Described by:** `WF-KUNI-INSPECT`

### UC-KUNI-003 · Adjust the view

- **Kind:** use-case
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Actor:** Explorer
- **Trigger:** the explorer uses chrome controls
- **Outcome:** reset, labels, auto-rotate, and randomize change the view as specified
- **Satisfies:** `CAP-KUNI-003`
- **Described by:** `WF-KUNI-CONTROL`

### REQ-KUNI-001 · Open into a full-screen 3D graph

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** the graph is the product; the explorer must not land on a marketing page or empty shell.
- **Actor:** Explorer
- **Trigger:** application launch
- **Statement:** the application opens directly into a full-screen 3D knowledge network with depth, perspective, and a dark immersive environment.
- **Acceptance:** `CRIT-KUNI-001`, `CRIT-KUNI-006`
- **Satisfies:** `CAP-KUNI-001`
- **Supports:** `UC-KUNI-001`
- **Constrained by:** `NFR-KUNI-001`

### REQ-KUNI-002 · Show a meaningful dummy network

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** visual evaluation needs realistic density, not a handful of sample nodes.
- **Statement:** the first view contains at least 100 meaningful dummy nodes and hundreds of relationships, with multiple categories and varying node sizes.
- **Acceptance:** `CRIT-KUNI-002`
- **Satisfies:** `CAP-KUNI-001`
- **Constrained by:** `DEC-KUNI-003`, `DEC-KUNI-005`, `INV-KUNI-006`

### REQ-KUNI-003 · Give node types distinct identities

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** categories must be readable without opening every node.
- **Statement:** person, organization, concept, technology, place, event, and document types have centralized, distinguishable visual identities. Important nodes are larger. Some important nodes may use a subtle outer ring.
- **Acceptance:** `CRIT-KUNI-004`
- **Satisfies:** `CAP-KUNI-004`
- **Constrained by:** `DEC-KUNI-005`, `INV-KUNI-005`

### REQ-KUNI-004 · Render subtle visible edges

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** relationships must be present without turning the scene into noise.
- **Statement:** edges connect source and target nodes, stay thin and slightly glowing, remain visible, and may vary by relationship type. Persistent edge labels are not required in this milestone.
- **Acceptance:** `CRIT-KUNI-005`
- **Satisfies:** `CAP-KUNI-001`
- **Constrained by:** `NFR-KUNI-001`, `DEC-KUNI-012`

### REQ-KUNI-005 · Distribute nodes as a clustered network

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** uniform random scatter does not resemble a knowledge network.
- **Statement:** nodes occupy 3D space with clusters, hubs, secondary nodes, and peripherals, plus realistic relationship patterns.
- **Acceptance:** `CRIT-KUNI-003`
- **Satisfies:** `CAP-KUNI-001`

### REQ-KUNI-006 · Provide smooth camera exploration

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** the explorer must move through the universe naturally.
- **Statement:** the explorer can rotate, zoom, and pan with damping, sensible distance limits, and a good initial camera. Selection may smoothly focus the camera on the chosen node. Idle auto-rotation, when enabled, stays subtle.
- **Acceptance:** `CRIT-KUNI-007`, `CRIT-KUNI-024`
- **Satisfies:** `CAP-KUNI-003`
- **Supports:** `UC-KUNI-001`
- **Constrained by:** `DEC-KUNI-015`, `DEC-KUNI-016`

### REQ-KUNI-007 · Emphasize a hovered node

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** hover is the first conversation with the graph.
- **Statement:** hovering a node increases its intensity, slightly scales it, highlights its edges and direct neighbors, shows its label, and uses an appropriate pointer.
- **Acceptance:** `CRIT-KUNI-008`
- **Satisfies:** `CAP-KUNI-002`
- **Constrained by:** `DEC-KUNI-011`, `INV-KUNI-003`, `INV-KUNI-007`

### REQ-KUNI-008 · Select a neighborhood

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** selection must isolate meaning without deleting the rest of the universe.
- **Statement:** clicking a node marks it selected, emphasizes first-degree neighbors and edges, and dims unrelated nodes and edges. Clicking empty space clears selection.
- **Acceptance:** `CRIT-KUNI-009`
- **Satisfies:** `CAP-KUNI-002`
- **Constrained by:** `DEC-KUNI-011`, `DEC-KUNI-014`, `INV-KUNI-003`, `INV-KUNI-007`, `INV-KUNI-009`

### REQ-KUNI-009 · Show a glass details panel

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** the explorer needs readable facts without leaving the canvas.
- **Statement:** a selected node opens a small glass panel showing name, type, description, and connection count.
- **Acceptance:** `CRIT-KUNI-010`
- **Satisfies:** `CAP-KUNI-002`
- **Constrained by:** `DEC-KUNI-009`

### REQ-KUNI-010 · Show labels by importance and proximity

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** labeling every node creates noise; hiding all labels hides meaning.
- **Statement:** labels appear for important nodes, the hovered node, the selected node, and nodes close to the camera. Labels stay readable and use a subtle glass background. A control can show or hide non-essential labels.
- **Acceptance:** `CRIT-KUNI-011`
- **Satisfies:** `CAP-KUNI-001`
- **Constrained by:** `DEC-KUNI-012`, `INV-KUNI-002`

### REQ-KUNI-011 · Reset the view

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** explorers must recover from deep orbits and selections.
- **Statement:** Reset View returns the camera to the initial framing and clears hover, selection, and focus.
- **Acceptance:** `CRIT-KUNI-012`
- **Satisfies:** `CAP-KUNI-003`
- **Supports:** `UC-KUNI-003`

### REQ-KUNI-012 · Toggle labels

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** Toggle Labels shows or hides default importance labels. Hovered and selected labels remain available.
- **Acceptance:** `CRIT-KUNI-013`
- **Satisfies:** `CAP-KUNI-003`

### REQ-KUNI-013 · Randomize the dummy graph

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** Randomize replaces the current dummy graph with a new valid generated instance. See `DEC-KUNI-013`.
- **Acceptance:** `CRIT-KUNI-014`
- **Satisfies:** `CAP-KUNI-003`
- **Constrained by:** `DEC-KUNI-008`, `INV-KUNI-006`

### REQ-KUNI-014 · Toggle auto-rotate

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** Toggle Auto Rotate enables or disables a subtle idle camera motion.
- **Acceptance:** `CRIT-KUNI-015`
- **Satisfies:** `CAP-KUNI-003`
- **Constrained by:** `DEC-KUNI-015`, `INV-KUNI-010`

### REQ-KUNI-015 · Offer a search placeholder

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** should
- **Source:** stakeholder-brief-2026-08-20
- **Rationale:** later search needs a visual home; this slice does not search.
- **Statement:** a polished search field is visible and architecture-ready. It does not perform real search.
- **Acceptance:** `CRIT-KUNI-021`
- **Satisfies:** `CAP-KUNI-003`
- **Constrained by:** `DEC-KUNI-007`, `NFR-KUNI-006`, `INV-KUNI-004`, `INV-KUNI-008`

### REQ-KUNI-016 · Keep chrome minimal

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** the HUD includes a top-left title “Knowledge Universe” with subtitle “Interactive 3D Network”, top-right view controls, a bottom-left type legend, a visible search field, and the details panel. It is not an admin dashboard. Search presence is required chrome. Non-functional polish and architecture-readiness are `REQ-KUNI-015`.
- **Acceptance:** `CRIT-KUNI-019`
- **Satisfies:** `CAP-KUNI-003`, `CAP-KUNI-004`
- **Constrained by:** `NFR-KUNI-001`, `DEC-KUNI-004`, `DEC-KUNI-009`

### REQ-KUNI-017 · Render arbitrary graph objects

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** the renderer works from generic node and edge objects. Dummy names are data, not rendering branches.
- **Acceptance:** `CRIT-KUNI-018`
- **Satisfies:** `CAP-KUNI-001`
- **Constrained by:** `DEC-KUNI-008`, `INV-KUNI-001`

### REQ-KUNI-018 · Remain usable on desktop, laptop, and tablet

- **Kind:** requirement
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** the visualization works on desktop, laptop, and tablet. Mobile may be basic. Desktop is the acceptance target. See `DEC-KUNI-014`.
- **Acceptance:** `CRIT-KUNI-022`
- **Satisfies:** `CAP-KUNI-001`
- **Constrained by:** `NFR-KUNI-005`
