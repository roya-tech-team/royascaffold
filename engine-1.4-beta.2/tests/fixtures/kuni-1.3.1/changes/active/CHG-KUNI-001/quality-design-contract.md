---
document_id: DOC-CHG-KUNI-001-QDC
title: Quality Design Contract — first visual universe
layer: change-quality
schema_version: 2
document_status: in-review
owners: [product-owner]
change_id: CHG-KUNI-001
qdc_id: QDC-KUNI-001
outcome: An explorer can immediately enter a cinematic dummy 3D knowledge network and judge whether it feels like the start of a commercial product.
audience: Product stakeholder deciding whether to fund a later real-data platform; explorer evaluating visual quality and interaction.
priorities: [visual-quality, interaction-feel, dummy-structure, first-graph-performance, minimal-chrome, later-extensibility]
criteria: [CRIT-KUNI-001, CRIT-KUNI-002, CRIT-KUNI-003, CRIT-KUNI-004, CRIT-KUNI-005, CRIT-KUNI-006, CRIT-KUNI-007, CRIT-KUNI-008, CRIT-KUNI-009, CRIT-KUNI-010, CRIT-KUNI-011, CRIT-KUNI-012, CRIT-KUNI-013, CRIT-KUNI-014, CRIT-KUNI-015, CRIT-KUNI-016, CRIT-KUNI-017, CRIT-KUNI-018, CRIT-KUNI-019, CRIT-KUNI-020, CRIT-KUNI-021, CRIT-KUNI-022, CRIT-KUNI-023, CRIT-KUNI-024, CRIT-KUNI-025]
foundation_criteria: [CRIT-KUNI-001, CRIT-KUNI-002, CRIT-KUNI-003, CRIT-KUNI-004, CRIT-KUNI-005, CRIT-KUNI-006, CRIT-KUNI-007, CRIT-KUNI-008, CRIT-KUNI-009, CRIT-KUNI-010, CRIT-KUNI-011, CRIT-KUNI-012, CRIT-KUNI-013, CRIT-KUNI-014, CRIT-KUNI-015, CRIT-KUNI-016, CRIT-KUNI-017, CRIT-KUNI-018, CRIT-KUNI-019, CRIT-KUNI-020, CRIT-KUNI-022, CRIT-KUNI-023]
unacceptable_outcomes: [engineering-demo-look, flat-black-void, excessive-neon-or-bloom, labels-on-every-node, thick-noisy-edges, random-scatter, admin-dashboard-chrome, future-platform-features, angular-or-vue, hardcoded-dummy-renderer, broken-placeholders]
first_pass_target: B+
final_target: A
---

# Quality Design Contract

## Outcome

An explorer launches Knowledge Universe and immediately explores a full-screen, clustered, dummy 3D knowledge network that reads as the start of a commercial product rather than a Three.js demo.

## Audience

- Product stakeholder judging whether to fund a later real-data platform
- Explorer using a desktop or laptop browser; tablet must remain usable

## Priority order

1. Cinematic readable graph
2. Alive interaction
3. Meaningful dummy structure
4. Interactive performance of the first graph
5. Minimal chrome
6. Extensible local structure without building the future product

## Foundation versus optional

**Foundation:** launch into the universe; 100–300 nodes and 200–800 edges; visible clusters; seven distinguishable types; subtle edges; depth; smooth camera; hover; select and dim; glass panel; selective labels; Reset View; Toggle Labels; Randomize; Auto Rotate; product-grade polish versus the reference; interactive performance; generic renderer; specified chrome; local dummy only; desktop-first layout; strict TypeScript.

**Optional / should:** search-field polish (the field itself is specified chrome); camera focus on select; growth-oriented rendering structure; basic mobile touch orbit.

## Unacceptable outcomes

- Flat-black engineering demo
- Excessive neon, bloom, huge labels, or thick edges
- Labels on every node
- Uniform random scatter
- Admin dashboard chrome
- Auth, backend, AI, persistence, or real search
- Angular or Vue
- Renderer hard-coded to dummy names
- Broken or unfinished placeholders
- Asking the stakeholder to finish missing pieces

## Content and data policy

Local generated dummy graph only. No personal data collection. No live knowledge APIs. Public-topic dummy names are illustrative fiction.

## References

- Stakeholder brief 20 August 2026
- `docs/reference/3d-network-reference.png` — inspiration, not a literal target. Decisions: [reference-decisions.md](reference-decisions.md)
- Material patterns: [pattern-decisions.md](pattern-decisions.md)
- `web-ui` adapter discovery: first-view focus, visual priority, responsive targets, input modes, content realism

## Constraints

- `DEC-KUNI-001` through `DEC-KUNI-017`
- Selected adapters `generic` and `web-ui`
- No `web-api`

## Assumptions

- `ASM-KUNI-001` through `ASM-KUNI-006`

## Threshold and review authority

| Class | Owns |
|-------|------|
| owner | counts, chrome copy, types, polish anti-patterns, local-only scope, TypeScript strict |
| approved-assumption | 30 fps floor, 1440×900 / 1024×768 viewports, B+/A contract targets |
| stakeholder-owner | material visual “product not demo” adjudication |
| fresh-context-reviewer | later SQR / IRR |
| implementer-self-check | launch, control presence, typecheck evidence — cannot close polish |
| deterministic-runner | `npm run typecheck` |

A model may recommend a threshold. It cannot silently approve its own taste bar. `FND-KUNI-005` stands.

## Criteria

### CRIT-KUNI-001 · First view is the universe

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** After launch, the first painted view is a full-screen 3D network. No marketing page, form, or empty shell appears first. The canvas occupies the viewport.
- **Threshold authority:** owner
- **Method:** launch the app in a desktop browser and photograph the first stable view at 1440×900
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-001`

### CRIT-KUNI-002 · Dummy network has required density

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** The visible graph contains 100–300 nodes and 200–800 edges, at least five of the seven node types, and visibly varying node sizes.
- **Threshold authority:** owner
- **Method:** count nodes, edges, and types in the generated dummy graph and confirm size variation in the first view
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-002`

### CRIT-KUNI-003 · Clusters and hierarchy are visible

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** Multiple clusters are separated in 3D. Central nodes have more connections than peripherals. Density varies rather than looking uniformly random.
- **Threshold authority:** owner
- **Method:** visual review of the default framing plus one orbit, compared with a uniform-scatter anti-pattern
- **Authority class:** fresh-context-reviewer
- **Supports:** `REQ-KUNI-005`

### CRIT-KUNI-004 · Node types are distinguishable

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** Person, organization, concept, technology, place, event, and document are visually distinguishable by color and or form. A legend lists the types. Important nodes read as larger than peripherals.
- **Threshold authority:** owner
- **Method:** compare one node of each type in the first view against the legend
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-003`

### CRIT-KUNI-005 · Edges are thin and readable

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** Edges are thin, slightly glowing, and readable against the dark scene. They do not appear as thick tubes or a solid scribble.
- **Threshold authority:** owner
- **Method:** visual review of the default graph at 1440×900
- **Authority class:** fresh-context-reviewer
- **Supports:** `REQ-KUNI-004`

### CRIT-KUNI-006 · The scene has depth

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** Distant nodes read smaller than near nodes. The background is deep navy or near-black with a subtle gradient or particles, not a flat unvaried black.
- **Threshold authority:** owner
- **Method:** compare the first view with `docs/reference/3d-network-reference.png`, noting background and perspective
- **Authority class:** fresh-context-reviewer
- **Supports:** `REQ-KUNI-001`, `DEC-KUNI-010`

### CRIT-KUNI-007 · Camera exploration is smooth

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** Mouse and touch can orbit, zoom, and pan with damping. Zoom cannot enter the graph or fly infinitely far. Motion is not snappy or slippery.
- **Threshold authority:** owner
- **Method:** perform rotate, zoom, and pan on desktop; perform a basic touch orbit on tablet
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-006`

### CRIT-KUNI-008 · Hover emphasizes a neighborhood

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** A hovered node becomes brighter and slightly larger. Direct edges and neighbors are emphasized. Its label is readable. The pointer indicates the node is interactive. The change is smooth.
- **Threshold authority:** owner
- **Method:** hover at least three nodes of different types and record before/after
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-007`

### CRIT-KUNI-009 · Selection isolates a neighborhood

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** A selected node is distinct from hover. First-degree neighbors and connecting edges stay emphasized. Unrelated elements dim and remain visible. Empty-canvas click returns to the default view state.
- **Threshold authority:** owner
- **Method:** select a hub, select a peripheral, then click empty canvas
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-008`

### CRIT-KUNI-010 · Details panel shows required facts

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** The panel appears only when a node is selected and shows name, type, description, and connection count. Styling is glass-like: translucent, blurred, restrained. It is not an admin form.
- **Threshold authority:** owner
- **Method:** select two nodes and confirm the four fields; confirm the panel closes when selection clears
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-009`

### CRIT-KUNI-011 · Labels stay selective and readable

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** The default view does not label every node. Important nodes can show labels. Hovered and selected nodes always show a readable upright glass label. Nearby nodes may reveal labels as the camera approaches.
- **Threshold authority:** owner
- **Method:** inspect default framing, then hover, select, and zoom toward a cluster
- **Authority class:** fresh-context-reviewer
- **Supports:** `REQ-KUNI-010`, `DEC-KUNI-012`

### CRIT-KUNI-012 · Reset View restores the start

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** Reset View is available in the top-right chrome. After use, the initial camera framing is restored and selection, focus, and the details panel are cleared.
- **Threshold authority:** owner
- **Method:** orbit and select a node, then activate Reset View
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-011`

### CRIT-KUNI-013 · Toggle Labels changes default labels

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** The control changes default importance-label visibility immediately. Hover and selection labels still appear when default labels are off.
- **Threshold authority:** owner
- **Method:** toggle the control on and off, then hover and select
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-012`

### CRIT-KUNI-014 · Randomize produces a new valid graph

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** Randomize produces a visibly different layout. The new graph still meets `CRIT-KUNI-002` and `CRIT-KUNI-003`. Rendering is not rewritten around the new names.
- **Threshold authority:** owner
- **Method:** activate Randomize at least twice and re-check density and clustering
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-013`, `DEC-KUNI-013`

### CRIT-KUNI-015 · Auto Rotate is subtle and opt-in

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** Auto-rotate is off until the explorer opts in. When on, rotation is slow and stops or yields when the explorer moves the camera.
- **Threshold authority:** owner
- **Method:** observe the first 5 seconds after launch, enable the toggle, then interrupt with pointer input
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-014`, `DEC-KUNI-015`

### CRIT-KUNI-016 · The result is more cinematic than the reference

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** On a 1440×900 desktop view, the first framing is darker and more spatially layered than the reference, with a non-flat background, restrained glow, no thick edges, and no all-node labeling. A reviewer would not classify it as a generic Three.js demo.
- **Threshold authority:** owner
- **Method:** side-by-side visual review with `docs/reference/3d-network-reference.png` against the unacceptable-outcome list
- **Authority class:** stakeholder-owner
- **Supports:** `NFR-KUNI-001`, `DEC-KUNI-010`, `FND-KUNI-005`

### CRIT-KUNI-017 · The first graph stays interactive

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** Orbiting the default 100–300 node graph for at least 10 seconds remains interactive on a typical desktop GPU, with a verification floor of 30 frames per second.
- **Threshold authority:** approved-assumption
- **Method:** orbit the default graph for at least 10 seconds and record whether motion stays interactive; measure frames per second when a runner exists
- **Authority class:** implementer-self-check
- **Supports:** `NFR-KUNI-002`, `ASM-KUNI-001`

### CRIT-KUNI-018 · The renderer accepts arbitrary graph objects

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** Replacing dummy entities does not require renderer edits. Graph generation lives in a dedicated module. Visual type rules are centralized rather than scattered as unrelated literals.
- **Threshold authority:** owner
- **Method:** review that dummy names are data and that Randomize does not require renderer changes
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-017`, `DEC-KUNI-008`

### CRIT-KUNI-019 · Chrome stays minimal and specified

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** Title and subtitle match the approved wording. Top-right controls include Reset View, Randomize, Toggle Labels, and Toggle Auto Rotate. A bottom-left legend shows node types with color marks. No management tables or settings modules ship.
- **Threshold authority:** owner
- **Method:** inspect the HUD at 1440×900 and confirm the specified regions
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-016`, `DEC-KUNI-004`, `DEC-KUNI-009`

### CRIT-KUNI-020 · No future-platform surfaces ship

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** The running application has no authentication, backend, database, API, persistence, or real search behavior.
- **Threshold authority:** owner
- **Method:** dependency and runtime review; confirm the search field does not query or filter
- **Authority class:** implementer-self-check
- **Supports:** `NFR-KUNI-006`, `DEC-KUNI-001`, `DEC-KUNI-003`

### CRIT-KUNI-021 · Search is a finished placeholder

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** should
- **Foundation:** no
- **Outcome:** A search control is visible with placeholder text such as “Search knowledge...”. Typing does not filter or query a backend. The control looks finished, not broken.
- **Threshold authority:** owner
- **Method:** inspect the control and type text; confirm the graph does not filter
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-015`, `DEC-KUNI-007`

### CRIT-KUNI-022 · Desktop and tablet remain usable

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** At 1440×900 the graph and chrome are reachable. At 1024×768 the graph remains full-bleed and controls remain usable. Touch orbit works at a basic level.
- **Threshold authority:** approved-assumption
- **Method:** viewport checks at 1440×900 and 1024×768
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-018`, `NFR-KUNI-005`, `ASM-KUNI-003`

### CRIT-KUNI-023 · The client typechecks strictly

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** must
- **Foundation:** yes
- **Outcome:** Application TypeScript is strict and `npm run typecheck` exits 0 with no `any`.
- **Threshold authority:** owner
- **Method:** run `npm run typecheck`
- **Authority class:** deterministic-runner
- **Supports:** `NFR-KUNI-004`

### CRIT-KUNI-024 · Selection can focus the camera

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** should
- **Foundation:** no
- **Outcome:** Selecting a node smoothly moves the camera toward that node without a snap.
- **Threshold authority:** owner
- **Method:** select a peripheral node and observe camera motion
- **Authority class:** implementer-self-check
- **Supports:** `REQ-KUNI-006`, `DEC-KUNI-016`

### CRIT-KUNI-025 · First-slice structure can grow

- **Kind:** quality-criterion
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Priority:** should
- **Foundation:** no
- **Outcome:** The first-milestone graph stays interactive, and later larger graphs are not blocked by a unique heavy object for every node or edge.
- **Threshold authority:** owner
- **Method:** review rendering ownership after design; this is not a first-pass visual gate
- **Authority class:** fresh-context-reviewer
- **Supports:** `NFR-KUNI-003`
