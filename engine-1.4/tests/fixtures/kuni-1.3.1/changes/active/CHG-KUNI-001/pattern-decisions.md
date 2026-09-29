---
document_id: DOC-CHG-KUNI-001-PAT
title: Pattern decisions — first visual universe
layer: change-quality
schema_version: 2
document_status: in-review
owners: [knowledge-universe-team]
change_id: CHG-KUNI-001
---

# Pattern decisions

Material solution choices for `CHG-KUNI-001`. Adapter defaults are not architecture facts. A pattern cannot replace a `CRIT-*`.

Stakeholder stack `DEC-KUNI-002` is an input. These records say how that stack is composed.

### PAT-KUNI-001 · React Three Fiber scene with HTML chrome

- **Kind:** pattern-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Adapter provenance:** web-ui
- **Problem:** Own a full-screen WebGL universe and readable product chrome without two competing application frameworks.
- **Forces:** scene organization, readable HUD, stakeholder stack, later extensibility
- **Choice:** One Vite React client. React Three Fiber owns the Three.js scene. HTML/CSS owns chrome and glass overlays.
- **Rationale:** The stakeholder forbade Angular and Vue and asked for R3F so the scene can be composed without putting the scene graph into application state.
- **Alternatives:** raw Three.js in a canvas manager, Vue Three wrapper, Angular
- **Constraints:** DEC-KUNI-002, no scene objects in Zustand, local dummy only
- **Failure modes:** remounting the canvas on every hover, mixing HUD into the WebGL scene, adding a second framework
- **Validation:** architecture review plus launch showing one full-bleed canvas and HTML chrome
- **Supports:** `CRIT-KUNI-001`, `CRIT-KUNI-019`, `DEC-KUNI-002`
- **Realized by:** `CMP-KUNI-APP`, `CMP-KUNI-CANVAS`, `CMP-KUNI-HUD`

### PAT-KUNI-002 · Transient IDs separate from graph data

- **Kind:** pattern-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Adapter provenance:** generic
- **Problem:** Hover selection labels and camera flags change often. The dummy graph is a replaceable value.
- **Forces:** predictable state, avoid rerender storms, Randomize replaceability
- **Choice:** Zustand holds hoveredNodeId selectedNodeId showLabels autoRotate focusedNodeId and the current graph value. It does not hold camera objects or Three.js nodes.
- **Rationale:** The brief already separates graph data from transient UI and forbids putting the scene into Zustand.
- **Alternatives:** React context for all graph state, scene-graph as store, per-node component state as source of truth
- **Constraints:** INV-KUNI-001, DEC-KUNI-013
- **Failure modes:** storing meshes in the store, duplicating neighbor lists as writeable state, losing selection after Randomize without clearing
- **Validation:** store review plus Randomize clearing attention flags
- **Supports:** `CRIT-KUNI-009`, `CRIT-KUNI-014`, `WF-KUNI-INSPECT`
- **Realized by:** `CMP-KUNI-STORE`

### PAT-KUNI-003 · Shared geometry for repeated nodes and edges

- **Kind:** pattern-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Adapter provenance:** generic
- **Problem:** Hundreds of nodes and edges must stay interactive and later grow.
- **Forces:** first-graph performance, later capacity, interaction updates
- **Choice:** Repeated node forms use InstancedMesh or shared geometries. Edges use a small number of buffer-backed line objects. Hover and selection update attributes or instance state rather than remounting the scene.
- **Rationale:** NFR-KUNI-002 and NFR-KUNI-003 require a first graph that feels fluid and a structure that can grow.
- **Alternatives:** one React mesh component per node and edge, thick tube meshes per edge, unique materials per dummy name
- **Constraints:** 100-300 nodes, 200-800 edges, 30 fps floor
- **Failure modes:** remount on hover, unique heavy object per edge, GPU overdraw from thick tubes
- **Validation:** orbit the default graph for 10 seconds; review that node forms are instanced or shared
- **Supports:** `CRIT-KUNI-017`, `CRIT-KUNI-025`, `NFR-KUNI-003`
- **Realized by:** `CMP-KUNI-NODES`, `CMP-KUNI-EDGES`

### PAT-KUNI-004 · HTML overlays for labels and chrome

- **Kind:** pattern-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Adapter provenance:** web-ui
- **Problem:** Labels and the details panel must stay readable and glass-like.
- **Forces:** legibility, glass styling, world-anchored labels
- **Choice:** Product chrome and the details panel are HTML. Node labels are HTML with Drei Html anchors so they track nodes and stay upright.
- **Rationale:** RDR-KUNI-012 adapts raw colored text into glass labels. HTML is sharper than glyph textures for this milestone.
- **Alternatives:** 3D text meshes, canvas texture labels, no labels
- **Constraints:** INV-KUNI-002, DEC-KUNI-012, do not label every node
- **Failure modes:** label forest, huge captions, labels that do not face the camera
- **Validation:** default view has selective labels; hover and select labels remain readable
- **Supports:** `CRIT-KUNI-011`, `CRIT-KUNI-010`, `RDR-KUNI-012`
- **Realized by:** `CMP-KUNI-LABELS`, `CMP-KUNI-HUD`, `CMP-KUNI-DETAILS`

### PAT-KUNI-005 · Seeded clustered dummy generation

- **Kind:** pattern-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Adapter provenance:** generic
- **Problem:** The universe must look like a knowledge network not a random spray and must be replaceable.
- **Forces:** visible clusters, hub-and-spoke realism, generic renderer, Randomize
- **Choice:** A dedicated generator builds a seeded graph: several topical clusters in separated 3D regions, hubs with more edges, peripherals with fewer, and a minority of bridge edges. Randomize is a new seed.
- **Rationale:** REQ-KUNI-005 and DEC-KUNI-013. Dummy names are data.
- **Alternatives:** hand-authored fixed graph, uniform random positions, renderer-specific entity layout
- **Constraints:** INV-KUNI-006, INV-KUNI-001, DEC-KUNI-008
- **Failure modes:** one blob, uniform scatter, hardcoded celebrity layout from the reference
- **Validation:** first view and post-Randomize views still show clusters and legal counts
- **Supports:** `CRIT-KUNI-002`, `CRIT-KUNI-003`, `CRIT-KUNI-014`, `RDR-KUNI-004`
- **Realized by:** `CMP-KUNI-GENERATOR`

### PAT-KUNI-006 · Centralized visual language

- **Kind:** pattern-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Adapter provenance:** web-ui
- **Problem:** Seven types must be distinguishable without scattering taste through the renderer.
- **Forces:** type identity, restrained color, later customization
- **Choice:** One configuration module owns type form color size ring and edge appearance. Experience.md owns the token values. Renderers only read the config.
- **Rationale:** INV-KUNI-005 and RDR-KUNI-007. Neon is adapted not copied.
- **Alternatives:** colors inside each mesh file, CSS-only type rules, icons copied from the reference
- **Constraints:** RDR-KUNI-007, RDR-KUNI-008, RDR-KUNI-009
- **Failure modes:** scattered hex literals, pictograms from the reference, one color for every type
- **Validation:** legend matches rendered types; config is the only type-style owner
- **Supports:** `CRIT-KUNI-004`, `CRIT-KUNI-018`, `INV-KUNI-005`
- **Realized by:** `CMP-KUNI-CONFIG`

### PAT-KUNI-007 · Derived neighborhood

- **Kind:** pattern-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Adapter provenance:** generic
- **Problem:** Hover and select must emphasize first-degree neighbors without storing a second graph.
- **Forces:** INV-KUNI-007, update cost, correctness after Randomize
- **Choice:** Neighborhood is derived from the current graph plus hovered or selected id. Direction is ignored. Second-degree nodes are not neighbors.
- **Rationale:** Domain already defines neighborhood as one hop either way.
- **Alternatives:** precomputed adjacency written into every node, expanding to two hops, treating edges as one-way only
- **Constraints:** INV-KUNI-003, INV-KUNI-007
- **Failure modes:** stale adjacency after Randomize, emphasizing the whole graph, hiding unrelated nodes
- **Validation:** select a hub and a peripheral; only first-degree elements stay bright
- **Supports:** `CRIT-KUNI-008`, `CRIT-KUNI-009`, `CON-KUNI-NEIGHBOR`
- **Realized by:** `CMP-KUNI-STORE`, `CMP-KUNI-NODES`, `CMP-KUNI-EDGES`

### PAT-KUNI-008 · Restrained environment and bloom

- **Kind:** pattern-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Adapter provenance:** web-ui
- **Problem:** The scene needs depth without becoming a neon effects reel.
- **Forces:** cinematic depth, readability, CRIT-KUNI-016
- **Choice:** Deep navy radial background, sparse star particles, light fog, modest bloom, and a subtle vignette. Bloom stays subordinate to the graph.
- **Rationale:** RDR-KUNI-006 rejects flat black. The brief forbids excessive bloom.
- **Alternatives:** flat black clear color, heavy bloom, photographic HDR environment
- **Constraints:** RDR-KUNI-006, NFR-KUNI-001
- **Failure modes:** washed-out nodes, star field competing with labels, copying the reference void
- **Validation:** side-by-side with the reference at 1440x900; background is not flat black and glow is restrained
- **Supports:** `CRIT-KUNI-006`, `CRIT-KUNI-016`, `RDR-KUNI-006`
- **Realized by:** `CMP-KUNI-CANVAS`

### PAT-KUNI-009 · Single-screen HUD regions

- **Kind:** pattern-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Adapter provenance:** web-ui
- **Problem:** Explorers need title controls legend search and details without an admin dashboard.
- **Forces:** graph dominance, specified copy, tablet reach
- **Choice:** One screen. Full-bleed canvas. Top-left title. Top-center search placeholder. Top-right four controls. Bottom-left legend. Bottom-right details on select.
- **Rationale:** DEC-KUNI-009 and RDR-KUNI-017.
- **Alternatives:** multi-route app, settings drawer, in-canvas WebGL menus
- **Constraints:** REQ-KUNI-016, no extra modules
- **Failure modes:** dashboard cards, missing specified controls, chrome covering the graph center
- **Validation:** HUD inspection at 1440x900 and 1024x768
- **Supports:** `CRIT-KUNI-019`, `CRIT-KUNI-021`, `DEC-KUNI-009`
- **Realized by:** `CMP-KUNI-HUD`, `CMP-KUNI-DETAILS`

### PAT-KUNI-010 · Home camera and optional focus

- **Kind:** pattern-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Adapter provenance:** web-ui
- **Problem:** Explorers must orbit naturally and recover from deep views.
- **Forces:** damping, distance limits, Reset View, optional focus
- **Choice:** Orbit controls with damping, min and max distance, and a stored home framing. Selection may lerp the camera toward the node. Auto-rotate is off until opted in and yields to pointer input.
- **Rationale:** REQ-KUNI-006 and DEC-KUNI-015 DEC-KUNI-016.
- **Alternatives:** free-fly camera, default auto-spin, instant camera snaps
- **Constraints:** DEC-KUNI-014, INV-KUNI-010, INV-KUNI-009
- **Failure modes:** camera inside a node, infinite zoom-out, aggressive spin, snap cuts
- **Validation:** orbit zoom pan reset and optional select-focus
- **Supports:** `CRIT-KUNI-007`, `CRIT-KUNI-012`, `CRIT-KUNI-015`, `CRIT-KUNI-024`
- **Realized by:** `CMP-KUNI-CANVAS`, `ACT-KUNI-ORBIT`, `ACT-KUNI-RESET`
