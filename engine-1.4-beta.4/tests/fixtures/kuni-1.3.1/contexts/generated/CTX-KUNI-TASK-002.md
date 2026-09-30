# Generated Context Pack

> Generated view. Do not edit or treat as canonical.

- Manifest: `CTX-KUNI-TASK-002`
- Role: implementer
- Context tier: standard
- Project hash: `a6a7407b1109ae4b1b85dd29565aaa1d7efab20ee88dd24373eb0e0fbb218d57`
- Root IDs: `TASK-KUNI-002`
- Included IDs: `TASK-KUNI-002`, `CRIT-KUNI-002`, `CRIT-KUNI-003`, `CRIT-KUNI-018`, `DEC-KUNI-003`, `DEC-KUNI-005`, `DEC-KUNI-008`, `DEC-KUNI-013`, `PAT-KUNI-002`, `PAT-KUNI-005`, `PAT-KUNI-006`, `RDR-KUNI-004`, `RDR-KUNI-014`, `INV-KUNI-001`, `INV-KUNI-006`, `CMP-KUNI-CONFIG`, `CMP-KUNI-GENERATOR`, `CMP-KUNI-STORE`, `TEST-KUNI-002`
- Review IDs: `REV-KUNI-SQR-001`
- Overflow policy: fail-and-split

## Document · knowledge/04-design/data/graph-model.md

# In-memory graph

There is no database. The conceptual model is realized as local objects generated at runtime.

## Ownership

`CMP-KUNI-GENERATOR` owns creation of a graph instance. `CMP-KUNI-STORE` owns which instance is current and the explorer’s attention flags. Renderers never own source data.

## Node object

| Field | Meaning |
|-------|---------|
| id | stable string in the current instance |
| label | display name |
| type | one of the seven node types |
| description | short explainer |
| importance | number from 0 to 1 |
| position | three-number location after layout |

## Edge object

| Field | Meaning |
|-------|---------|
| id | stable string in the current instance |
| source | node id |
| target | node id |
| type | one of the eight relationship types |
| strength | optional 0–1 weight |

Connection count on the details panel is the number of distinct neighboring nodes (undirected degree). It is derived, not stored.

## Generation rules

- Seeded generator so Randomize is a new seed, not hand-edited names. Default first seed: `universe-0`.
- Exactly 5 topical clusters, centers at least 14 units apart inside a roughly 40-unit radius volume. Place centers on a ring of radius 22 at y in [-4, 4]:
  1. Concepts — Artificial Intelligence, Machine Learning, Neural Networks, Deep Learning, Natural Language Processing, Computer Vision, plus concept satellites
  2. Industry — OpenAI, Google, Microsoft, Apple, plus organization satellites
  3. People — Elon Musk, plus person satellites
  4. Places — Stanford University, MIT, Silicon Valley, plus place satellites
  5. Systems — Computer Science, Robotics, Mathematics, plus technology, event, and document satellites
- Default instance targets 180 nodes and 420 edges, always clamped to 100–300 nodes and 200–800 edges. Split nodes roughly evenly across the five clusters, ±8.
- All seven node types appear. Importance bands: hubs 0.75–1.00, mid 0.36–0.74, peripherals 0.15–0.35. Hubs receive 8–16 edges. Peripherals receive 1–3 edges. Mid nodes receive 3–7 edges.
- About 8–12% of edges are bridges between clusters. Remaining edges stay inside a cluster.
- Edge types from endpoint types, first match:
  - document → person or organization: `CREATED_BY`
  - person → organization: `WORKS_AT`
  - person → place: `STUDIED_AT`
  - organization → place: `LOCATED_IN`
  - technology → technology or concept: `DEPENDS_ON`
  - organization or person → concept: `INFLUENCES`
  - concept → concept in the same cluster: `PART_OF` if the target is a hub, otherwise `RELATED_TO`
  - any other pair: `RELATED_TO`
- Do not branch the renderer on those names. Strength may be omitted.
- Seed hub labels must include: Artificial Intelligence, Machine Learning, Neural Networks, OpenAI, Google, Microsoft, Apple, Elon Musk, Computer Science, Robotics, Mathematics, Deep Learning, Natural Language Processing, Computer Vision, Stanford University, MIT, Silicon Valley.
- Remaining satellite labels are composed from these closed lists. Do not free-write names.
  - person given: Ada, Grace, Alan, Fei, Yoshua, Demis, Ilya, Andrej, Satya, Jensen, Geoff, Yann, Andrew, Daphne
  - person family: Lovelace, Hopper, Turing, Li, Bengio, Hassabis, Sutskever, Karpathy, Nadella, Huang, Ng, Hinton, LeCun, Pearl
  - organization left: Open, Deep, Bright, North, Blue, Prime, Vector, Signal
  - organization right: Labs, Systems, Research, Institute, Foundry, Works
  - concept: Attention Mechanism, Embedding Space, Gradient Descent, Alignment, Abstraction, Causality, Emergence, Compression, Representation, Optimization Principle
  - technology: Transformer, CUDA, PyTorch, TensorFlow, Kubernetes, WebGL, GraphQL, LLVM, WASM, Ray
  - place: North Campus Lab, West Quad, Harbor Lab, Alpine Site, River Station, Desert Observatory
  - event: Annual Alignment Workshop, Systems Symposium, Model Release Day, Vision Keynote, Robotics Summit
  - document: Attention Whitepaper, Systems Handbook, Vision Survey, Graph Spec, Training Notes
- Reuse list items with a numeric suffix when the lists run out, for example `North Labs 2`. Never invent a name outside these lists.
- Description template only: `{label} is a {type} in this universe.`
- Do not use Government, Joe Rogan, Ukraine, Republicans, or Media.
- No retention, deletion policy, or migration. Refreshing the page or pressing Randomize replaces the instance.

## Content credibility

- Source class: generated dummy.
- Curation: recognizable public-topic hub seeds plus closed-list satellites so the graph feels populated.
- Completeness: every node has id, label, type, importance, position, and a description that may be short.
- Freshness: not applicable. Data is not live.
- Placeholder policy: search chrome is a placeholder. Graph entities are not placeholders; they are dummy records.
- Prohibited fabrication: do not present dummy names as live or authoritative knowledge. Do not copy the reference’s political-media entities.

## Classification

Dummy public-looking names only. No personal data collection.

## Mapping

- `CON-KUNI-NODE`, `CON-KUNI-EDGE`, `CON-KUNI-CLUSTER`, `CON-KUNI-IMPORTANCE`, `CON-KUNI-GRAPH`
- Invariants `INV-KUNI-001`, `INV-KUNI-004`, and `INV-KUNI-006`
## Document · knowledge/04-design/experience/experience.md

# Experience

Inspiration file: `docs/reference/3d-network-reference.png`. Do not copy it. Produce a cleaner, more cinematic result using `RDR-KUNI-001` through `RDR-KUNI-017`.

Do not reinterpret the quality bar. Observable anti-patterns stay in `CRIT-KUNI-016` and `NFR-KUNI-001`.

## Principles

1. The graph is the product. Chrome is subordinate.
2. Hierarchy is readable before a panel opens.
3. Attention adds light. The rest dims. Nothing vanishes.
4. Motion is damped. Nothing snaps unless the explorer resets.
5. Glow is restrained. Type color stays identifiable.

## Journey

1. Explorer lands in a dark universe of clustered nodes.
2. They orbit and notice hubs, colors, and faint stars.
3. Hover brightens a neighborhood and reveals a glass label.
4. Click opens a glass details panel and dims the rest. The camera may ease in.
5. Controls reset, relabel, rotate, or generate another universe.
6. Search field is visible and does nothing.

## First-view focus

Full-bleed 3D graph. Title is visible but quiet. No onboarding modal.

## Information

- Title: Knowledge Universe
- Subtitle: Interactive 3D Network
- Search placeholder: Search knowledge...
- Details: name, type, description, connection count. Connection count is undirected degree: distinct neighboring nodes one hop away in either direction.
- Legend: one mark per node type
- Controls: Reset View, Randomize, Toggle Labels, Toggle Auto Rotate

## Screen

One screen. Full-bleed canvas. Overlay chrome. See `PAT-KUNI-009`.

| Region | Content |
|--------|---------|
| Top left | Title and subtitle |
| Top center | Search placeholder |
| Top right | Reset View, Randomize, Toggle Labels, Toggle Auto Rotate |
| Bottom left | Type legend |
| Bottom right | Details panel when a node is selected |

On tablet, chrome may stack; the canvas stays full-bleed. Search may sit under the title. Controls remain tappable.

## Interaction states

| State | Canvas | Chrome |
|-------|--------|--------|
| Default | All visible, important labels only | Search inert, no details |
| Hover | Focus node scaled and brighter, neighbors lit, others slightly dim | Cursor indicates a target |
| Selected | Neighborhood emphasized, others dimmed | Details panel open |
| Focused | Camera eases toward the selected node | Details remain |
| Labels off | Importance labels hidden | Hover and selection labels remain |

Hover and selected may overlap. Selected wins for the panel. Empty-canvas click clears selection.

## Interface states

- Loading: brief if needed; generation is local and expected to succeed.
- Empty: not expected after generation. If generation failed, show the chrome line “Could not create the universe.” Do not leave a silent broken canvas.
- Success: graph visible.
- Unauthorized: not applicable.
- Validation: not applicable. Search does not validate or submit.

## Motion

- Camera damping on orbit. See `PAT-KUNI-010`.
- Smooth intensity and scale changes on hover and selection. No instant pops.
- Details panel eases in with Framer Motion.
- Auto-rotate is slow and opt-in.

## Typography

- Geometric sans-serif, Inter or the system UI stack.
- Title small and light, not a hero headline.
- Labels: one primary line, 13 px CSS, truncate after 28 characters.
- Type names in the panel may be uppercase tracking.

## Color and form

Deep navy space, not flat black (`RDR-KUNI-006`). Category color is restrained (`RDR-KUNI-007`). No pictograms (`RDR-KUNI-009`).

| Token | Value |
|-------|-------|
| Space near | `#070B14` |
| Space far | `#10182A` |
| Star | cool white at very low opacity |
| Edge default | cool white, opacity about 0.18 |
| Edge emphasized | same hue, opacity about 0.55 |
| Glass fill | `#10182A` at 50% with blur 12px |
| Glass stroke | white at 8% |

| Node type | Form | Hue | Base radius |
|-----------|------|-----|-------------|
| person | sphere | `#4F8F8A` | 0.28 |
| organization | sphere plus thin ring | `#4A6FA5` | 0.38 |
| concept | emissive sphere | `#6B5B8C` | 0.32 |
| technology | octahedron | `#3D8B9A` | 0.28 |
| place | sphere plus wider dim ring | `#A4844A` | 0.28 |
| event | short diamond / octahedron flattened on Y | `#A45B6A` | 0.26 |
| document | small rounded box | `#8A8478` | 0.20 |

Radius after importance: `baseRadius * (0.75 + 0.55 * importance)`. Do not invent other hues.

Hover scale: 1.12. Selected scale: 1.18. Hover/select ring radius is 1.35 times the drawn radius. Unrelated dim: multiply emissive and edge opacity by 0.28. Neighborhood stays at full emphasis.

Star particles: 280. Star opacity: 0.12. Fog color: `#070B14`. Fog near 18, far 90. Bloom strength 0.22, threshold 0.82, radius 0.4. Vignette is CSS or post, opacity about 0.18.

Default labels: importance ≥ 0.72 or among the 12 highest-importance nodes, whichever is fewer. Nearby labels: camera distance < 14. Hit area: 1.8 times visible radius.

Details panel: width 300px, bottom 24px, right 24px.

Auto-rotate: Drei/Three `autoRotateSpeed` 0.4. A 10-second watch is not a full spin.

Title: 13px, weight 500, color `#D7DCE6`. Subtitle: 11px, color `#8B93A7`.

Relationship types share the default thin cool-white edge `#C8D0DC` at opacity 0.18. Emphasized opacity 0.55. Do not assign a distinct neon color to each type.

## Labels

Glass background, upright, tracking the node. Default: important nodes only. Nearby nodes may appear when the camera approaches. Hovered and selected always show a label. No persistent edge captions (`RDR-KUNI-011`).

## Pointer

Node hit area is larger than the visible core so small peripherals remain pickable. Cursor becomes a pointer over a node.

## Accessibility and responsive

- Desktop 1440×900 is the visual target.
- Tablet 1024×768 keeps a full-bleed canvas and reachable controls.
- Contrast on labels and chrome must stay readable on the dark scene.
- HUD controls are keyboard-reachable. The canvas is pointer-first.
- No WCAG AA claim this slice (`ASM-KUNI-004`).

## Content tone

Dummy knowledge-topic names are illustrative fiction. They must not look like a copied political-media graph from the reference (`RDR-KUNI-014`). Descriptions are short and generic.

## Unacceptable

Engineering-demo finish, flat black void, excessive neon or bloom, labels on every node, thick edges, random scatter, admin dashboard, Reddit chrome, reference pictograms, persistent RELATED_TO captions.

## Evidence

Visual reviews record viewport, state (default hover selected), source revision, the reference file, expected criterion, reviewer, and limitations. See `CRIT-KUNI-016`.
## Artifact · TASK-KUNI-002

_Source: `changes/active/CHG-KUNI-001/execution-plan.md:60`_

### TASK-KUNI-002 · Create types config and dummy graph

- **Kind:** execution-task
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Goal:** A seeded generator produces a clustered dummy graph that the renderer can consume as generic objects.
- **Task class:** foundation
- **Context tier:** standard
- **Escalation:** Stop and return to design when a material decision is missing.
- **Depends on:** `TASK-KUNI-001`
- **Preconditions:** `TASK-KUNI-001` done
- **Inputs:** `knowledge/04-design/data/graph-model.md`, `PAT-KUNI-005`, `PAT-KUNI-006`, `INV-KUNI-006`
- **Allowed paths:** `src/features/graph/types`, `src/features/graph/data`, `src/features/graph/config`, `src/features/graph/state`
- **Forbidden inventions:** hardcoded reference entities, renderer branches on dummy names, years timelines path scores, a database
- **Outputs:** `CMP-KUNI-CONFIG`, `CMP-KUNI-GENERATOR`, `CMP-KUNI-STORE` graph value, first valid instance
- **Checks:** generated graph has 100-300 nodes, 200-800 edges, at least five types, more than one cluster
- **Done when:** `CRIT-KUNI-002` `CRIT-KUNI-003` `CRIT-KUNI-018` are structurally satisfied by data even if drawing is still a stub
- **Recovery:** replace the generator; do not hand-edit a one-off graph
- **Handoff:** `TASK-KUNI-003` may draw the current graph value
- **Implements:** `CRIT-KUNI-002`, `CRIT-KUNI-003`, `CRIT-KUNI-018`, `DEC-KUNI-003`, `DEC-KUNI-005`, `DEC-KUNI-008`, `DEC-KUNI-013`, `PAT-KUNI-002`, `PAT-KUNI-005`, `PAT-KUNI-006`, `RDR-KUNI-004`, `RDR-KUNI-014`, `CMP-KUNI-CONFIG`, `CMP-KUNI-GENERATOR`, `CMP-KUNI-STORE`
- **Verified by:** `TEST-KUNI-002`

Steps:

1. Add generic node and edge types from the data design. Importance is 0-1.
2. Put type forms hues sizes rings and edge defaults in `CMP-KUNI-CONFIG`. Copy the experience hex table and radius formula. No reference pictograms.
3. Implement a seeded clustered generator using the data-design rules exactly: the five named clusters on a radius-22 ring, default 180 nodes and 420 edges, listed hub seeds, closed satellite lists, importance bands, degree bands, and the edge-type table.
4. Compose satellite labels only from the closed lists in the data design. Use the description template. Do not copy the reference entity set.
5. Store the current graph value in Zustand. Do not store meshes.
6. Randomize must be a new seed that still satisfies `INV-KUNI-006`. The control can wait for `TASK-KUNI-006` but the function must exist.
## Artifact · CRIT-KUNI-002

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:109`_

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
## Artifact · CRIT-KUNI-003

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:123`_

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
## Artifact · CRIT-KUNI-018

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:333`_

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
## Artifact · DEC-KUNI-003

_Source: `changes/active/CHG-KUNI-001/change.md:175`_

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
## Artifact · DEC-KUNI-005

_Source: `changes/active/CHG-KUNI-001/change.md:199`_

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
## Artifact · DEC-KUNI-008

_Source: `changes/active/CHG-KUNI-001/change.md:235`_

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
## Artifact · DEC-KUNI-013

_Source: `changes/active/CHG-KUNI-001/change.md:295`_

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
## Artifact · PAT-KUNI-002

_Source: `changes/active/CHG-KUNI-001/pattern-decisions.md:38`_

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
## Artifact · PAT-KUNI-005

_Source: `changes/active/CHG-KUNI-001/pattern-decisions.md:101`_

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
## Artifact · PAT-KUNI-006

_Source: `changes/active/CHG-KUNI-001/pattern-decisions.md:122`_

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
## Artifact · RDR-KUNI-004

_Source: `changes/active/CHG-KUNI-001/reference-decisions.md:179`_

### RDR-KUNI-004 · Center density and sparse periphery

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** density
- **Disposition:** retain
- **Observation:** The mid-field is a dense web; outer space is thinner. See `FND-KUNI-014`.
- **Interpretation:** Keep that spatial rhythm, inside the approved 100–300 / 200–800 counts.
- **Rationale:** Uniform scatter was already named an unacceptable outcome.
- **Confidence:** high
- **Unacceptable opposite:** Even random spray, or a single unreadable scribble with no periphery.
- **Supports:** `CRIT-KUNI-002`, `CRIT-KUNI-003`
## Artifact · RDR-KUNI-014

_Source: `changes/active/CHG-KUNI-001/reference-decisions.md:369`_

### RDR-KUNI-014 · Literal reference entities

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** critical
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** content
- **Disposition:** reject
- **Observation:** Visible names are another author’s political and media entities. See `FND-KUNI-015`.
- **Interpretation:** Do not reproduce that entity set, layout, or captions.
- **Rationale:** Rights and `DEC-KUNI-008`: dummy knowledge-topic seeds are data, not a copy of this scene.
- **Confidence:** high
- **Unacceptable opposite:** Shipping Government / Joe Rogan / Ukraine as the demo graph, or branching the renderer on those names.
- **Supports:** `CRIT-KUNI-018`, `CRIT-KUNI-020`, `DEC-KUNI-008`, `DEC-KUNI-003`
## Artifact · INV-KUNI-001

_Source: `knowledge/03-domain/domain.md:176`_

### INV-KUNI-001 · Renderer stays generic

- **Kind:** invariant
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Rule:** presentation consumes arbitrary node and edge objects. Dummy names are data, never rendering branches.
- **Supports:** `REQ-KUNI-017`, `DEC-KUNI-008`
## Artifact · INV-KUNI-006

_Source: `knowledge/03-domain/domain.md:221`_

### INV-KUNI-006 · Graph size stays in range

- **Kind:** invariant
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Rule:** every generated graph, including after Randomize, has 100–300 nodes and 200–800 edges, at least five node types, and more than one cluster.
- **Supports:** `REQ-KUNI-002`, `REQ-KUNI-013`, `CRIT-KUNI-002`
## Artifact · CMP-KUNI-CONFIG

_Source: `knowledge/05-implementation/components/components.md:115`_

### CMP-KUNI-CONFIG · Visual and graph configuration

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** own node-type and edge-type visual tokens, camera constants, particle counts, and graph-size bounds.
- **Implements:** `REQ-KUNI-003`, `INV-KUNI-005`
- **Constrained by:** `PAT-KUNI-006`
## Artifact · CMP-KUNI-GENERATOR

_Source: `knowledge/05-implementation/components/components.md:104`_

### CMP-KUNI-GENERATOR · Dummy graph generator

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** create a seeded clustered dummy graph that satisfies count and structure invariants.
- **Depends on:** `CMP-KUNI-CONFIG`
- **Implements:** `REQ-KUNI-002`, `REQ-KUNI-005`, `REQ-KUNI-013`
- **Constrained by:** `PAT-KUNI-005`, `INV-KUNI-006`
## Artifact · CMP-KUNI-STORE

_Source: `knowledge/05-implementation/components/components.md:93`_

### CMP-KUNI-STORE · Graph and attention store

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** hold the current graph value and hovered selected label auto-rotate and focus flags. Derive neighborhood. Clear attention on Randomize and Reset.
- **Depends on:** `CMP-KUNI-GENERATOR`
- **Implements:** `DEC-KUNI-011`, `DEC-KUNI-013`
- **Constrained by:** `PAT-KUNI-002`, `PAT-KUNI-007`
## Artifact · TEST-KUNI-002

_Source: `knowledge/05-implementation/tests/tests.md:23`_

### TEST-KUNI-002 · Graph structure

- **Kind:** test
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Method:** count nodes edges and types; visually confirm clusters and size hierarchy
- **Covers:** `CRIT-KUNI-002`, `CRIT-KUNI-003`, `CRIT-KUNI-004`, `CRIT-KUNI-018`

## Manifest source

`contexts/manifests/CTX-KUNI-TASK-002.md`
