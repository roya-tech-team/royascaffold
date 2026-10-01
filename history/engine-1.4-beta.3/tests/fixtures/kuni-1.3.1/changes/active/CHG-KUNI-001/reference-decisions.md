---
document_id: DOC-CHG-KUNI-001-RDR
title: Reference decisions — 3D network visual source
layer: change-quality
schema_version: 2
document_status: in-review
owners: [product-owner]
change_id: CHG-KUNI-001
source: docs/reference/3d-network-reference.png
source_fingerprint: sha256:3e9816da3280619d1cf21dec4e56c24645e7bee392a91cb4466a82489b77f679
source_bytes: 467716
source_format: PNG 1024x666 RGB
---

# Reference decisions

## Source identity

| Field | Value |
|-------|-------|
| Location | `docs/reference/3d-network-reference.png` |
| Fingerprint | `sha256:3e9816da3280619d1cf21dec4e56c24645e7bee392a91cb4466a82489b77f679` |
| Format | PNG, 1024×666, 8-bit RGB, 467716 bytes |
| Apparent origin | Reddit `r/threejs` post by `rassl_ivan`, titled “Working on 3d knowledge graph. Would be glad to hear feedback for ui” |
| Intended use | Inspiration for density, dark environment, relationship visualization, label placement, and spatial feeling |
| Authority | Stakeholder brief 20 August 2026; `DEC-KUNI-010` |
| Rights / usage limits | Third-party screenshot of another author’s prototype, captured inside Reddit chrome. Inspiration only. Do not copy entities, icons, typography assets, Reddit UI, or a literal scene reconstruction |

These records belong to `CHG-KUNI-001` until reconciliation. They do not replace `CRIT-*` outcomes.

## Observations

Separated from interpretation. Confidence notes ambiguity of a still frame.

### FND-KUNI-009 · Host chrome is Reddit, not a product HUD

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Confidence:** high
- **Observation:** The graph sits inside a dark Reddit shell: left navigation, top search, right `r/threejs` rail, post title, and a small GIF badge on the canvas.
- **Ambiguity:** none for host identity. The still does not show a first-party product HUD.

### FND-KUNI-010 · Background is flat black

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Confidence:** high
- **Observation:** The canvas field behind the graph is an unvaried near-black. No radial gradient, fog, or star field is visible.

### FND-KUNI-011 · Nodes are circular, sized, and color-coded

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Confidence:** high
- **Observation:** Nodes read as circles or spheres. Sizes vary. Colors include neon green, bright blue, red, and muted yellow. Some larger nodes carry white pictograms. Some nodes have a thin matching outer ring. One red node has a larger concentric ring.

### FND-KUNI-012 · Edges are thin; some carry RELATED_TO

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Confidence:** high
- **Observation:** Connections are thin, straight, gray-white lines. Several mid-graph edges show uppercase `RELATED_TO` sitting on the line.

### FND-KUNI-013 · Labels are selective and color-matched

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Confidence:** medium
- **Observation:** Sans-serif labels sit near prominent nodes and often match node color. Many small nodes have no label. A few labels include a secondary line of smaller text.
- **Ambiguity:** a still cannot prove the label rule for hover, camera distance, or every node in motion.

### FND-KUNI-014 · The graph has center density and perspective

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Confidence:** high
- **Observation:** Line density is highest near the center. Foreground nodes read larger and sharper than distant nodes. The camera is a slightly angled perspective view.

### FND-KUNI-015 · Content is another author’s entity set

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Confidence:** high
- **Observation:** Visible labels include entities such as Government, Joe Rogan, Ukraine, Republicans, and Media. These are not the approved dummy seed topics.

### FND-KUNI-016 · Motion is implied, not specified

- **Kind:** finding
- **Knowledge status:** in-review
- **Implementation status:** not-applicable
- **Owner:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Confidence:** medium
- **Observation:** A GIF badge is visible. The still does not record orbit speed, damping, idle rotation, or hover timing.
- **Ambiguity:** interaction and motion must come from the brief and `DEC-KUNI-011`, not from this frame.

## Decisions

Each material aspect has a retain, adapt, or reject disposition. Recommendation authority from 20 August 2026 is used where the still is ambiguous. No RDR is left unresolved.

### RDR-KUNI-001 · Graph occupies the visual field

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** composition
- **Disposition:** retain
- **Observation:** Inside the embed, the network fills the canvas. There is no first-party form or dashboard over the graph.
- **Interpretation:** The product’s first view must be the universe itself.
- **Rationale:** Matches `DEC-KUNI-009` and the brief’s “graph is the product” rule.
- **Confidence:** high
- **Unacceptable opposite:** Landing on marketing chrome, a table, or a graph that is a small inset.
- **Supports:** `CRIT-KUNI-001`, `DEC-KUNI-009`

### RDR-KUNI-002 · Host-application chrome

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** composition
- **Disposition:** reject
- **Observation:** Reddit navigation, community rail, post metadata, and the GIF badge surround the graph. See `FND-KUNI-009`.
- **Interpretation:** Host chrome is capture context, not product UI.
- **Rationale:** Copying it would make Knowledge Universe look like an embed, not a product.
- **Confidence:** high
- **Unacceptable opposite:** Recreating Reddit sidebars, post titles, or a GIF badge.
- **Supports:** `CRIT-KUNI-019`, `DEC-KUNI-009`

### RDR-KUNI-003 · Size hierarchy

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** hierarchy
- **Disposition:** retain
- **Observation:** Larger nodes sit among smaller satellites. See `FND-KUNI-011`.
- **Interpretation:** Importance and centrality must be readable from size before a panel opens.
- **Rationale:** The brief already requires important nodes to be larger.
- **Confidence:** high
- **Unacceptable opposite:** Uniform node size, or size used only for decoration.
- **Supports:** `CRIT-KUNI-004`, `DEC-KUNI-005`

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

### RDR-KUNI-005 · Perspective depth

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** scale
- **Disposition:** retain
- **Observation:** Distant nodes shrink and soften. The camera is perspective, slightly angled.
- **Interpretation:** The universe must read as volume, not a flat diagram.
- **Rationale:** The brief requires depth and perspective; the still confirms the desired spatial feeling.
- **Confidence:** high
- **Unacceptable opposite:** Orthographic flatness or no size change with distance.
- **Supports:** `CRIT-KUNI-006`

### RDR-KUNI-006 · Flat black void

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** color
- **Disposition:** reject
- **Observation:** The field behind nodes is flat near-black. See `FND-KUNI-010`.
- **Interpretation:** Keep a dark immersive field, but not this unvaried void.
- **Rationale:** The brief forbids a completely flat black background and asks for navy, gradient, and subtle particles.
- **Confidence:** high
- **Unacceptable opposite:** Copying the reference’s flat black, or a bright/busy sky that competes with the graph.
- **Supports:** `CRIT-KUNI-006`, `CRIT-KUNI-016`, `DEC-KUNI-010`

### RDR-KUNI-007 · Neon category colors

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** color
- **Disposition:** adapt
- **Observation:** Categories use saturated neon green, blue, red, and yellow.
- **Interpretation:** Keep color as a type signal. Lower saturation and brightness so glow stays restrained.
- **Rationale:** Type identity is required; excessive neon is an unacceptable outcome.
- **Confidence:** high
- **Unacceptable opposite:** One color for every type, or unreadable neon bloom.
- **Supports:** `CRIT-KUNI-004`, `CRIT-KUNI-016`, `NFR-KUNI-001`

### RDR-KUNI-008 · Circular nodes and optional rings

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** hierarchy
- **Disposition:** adapt
- **Observation:** Nodes are circular; some important ones have a thin outer ring. See `FND-KUNI-011`.
- **Interpretation:** Spheres or slightly geometric 3D forms may replace flat discs. Subtle rings may mark important or selected nodes.
- **Rationale:** The brief asks for glowing spheres or futuristic geometry and allows some outer rings. Flat 2D discs are named as something to avoid.
- **Confidence:** high
- **Unacceptable opposite:** Literal flat billboard dots only, or rings on every node.
- **Supports:** `CRIT-KUNI-004`, `REQ-KUNI-003`

### RDR-KUNI-009 · Pictograms inside nodes

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** content
- **Disposition:** reject
- **Observation:** Large nodes contain white icons, such as a building on Government.
- **Interpretation:** Those icons are another author’s asset language and are not required by the brief.
- **Rationale:** Rights limit copying. Type identity will come from color, form, size, and the legend.
- **Confidence:** high
- **Unacceptable opposite:** Reusing the reference pictograms, or requiring icons to recognize a type.
- **Supports:** `CRIT-KUNI-004`, `DEC-KUNI-010`

### RDR-KUNI-010 · Thin low-contrast edges

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
- **Observation:** Edges are thin, straight, and gray-white. See `FND-KUNI-012`.
- **Interpretation:** Keep thin, slightly glowing lines that stay visible without becoming tubes or a scribble.
- **Rationale:** Matches the brief and `CRIT-KUNI-005`.
- **Confidence:** high
- **Unacceptable opposite:** Thick tubes, invisible hairlines, or a solid mid-field scribble.
- **Supports:** `CRIT-KUNI-005`

### RDR-KUNI-011 · Persistent RELATED_TO edge labels

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** typography
- **Disposition:** reject
- **Observation:** Several edges show uppercase `RELATED_TO` on the line.
- **Interpretation:** Persistent edge labels add noise in a dense graph. Relationship type may later appear as subtle edge appearance, not floating captions on many edges.
- **Rationale:** `DEC-KUNI-012` already says persistent edge labels are not required this milestone.
- **Confidence:** high
- **Unacceptable opposite:** RELATED_TO captions on many default edges.
- **Supports:** `CRIT-KUNI-005`, `CRIT-KUNI-016`, `DEC-KUNI-012`

### RDR-KUNI-012 · Selective node labels

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** typography
- **Disposition:** adapt
- **Observation:** Prominent nodes have nearby color-matched labels; many small nodes do not. See `FND-KUNI-013`.
- **Interpretation:** Keep selective labeling. Replace raw colored text on black with readable glass labels that stay upright.
- **Rationale:** The brief requires glass/readable labels and forbids labeling every node.
- **Confidence:** medium
- **Unacceptable opposite:** A label on every node, or huge unreadable captions.
- **Supports:** `CRIT-KUNI-011`, `DEC-KUNI-012`

### RDR-KUNI-013 · Concentric ring on an active node

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** interaction
- **Disposition:** adapt
- **Observation:** One red node is marked by a larger concentric ring. The still does not prove hover versus select. See `FND-KUNI-011` and `FND-KUNI-016`.
- **Interpretation:** Keep a clear active-node mark. Add neighborhood highlight, dimming of the rest, a glass panel, and distinct hover versus selected states from the brief.
- **Rationale:** The reference shows emphasis; the product interaction model is already decided in `DEC-KUNI-011`.
- **Confidence:** medium
- **Unacceptable opposite:** No visible selection, or only a ring with no neighborhood or panel.
- **Supports:** `CRIT-KUNI-008`, `CRIT-KUNI-009`, `CRIT-KUNI-010`, `DEC-KUNI-011`

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

### RDR-KUNI-015 · Engineering-demo tone

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** critical
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** tone
- **Disposition:** reject
- **Observation:** The post asks for UI feedback on a Three.js prototype. The still looks like a technical demo: flat black, neon, raw labels, no product chrome.
- **Interpretation:** Use the spatial idea, not the demo finish.
- **Rationale:** `CRIT-KUNI-016` requires a more cinematic, product-like first view.
- **Confidence:** high
- **Unacceptable opposite:** A result a reviewer would classify as a generic Three.js demo.
- **Supports:** `CRIT-KUNI-016`, `NFR-KUNI-001`, `FND-KUNI-005`

### RDR-KUNI-016 · Implied GIF motion

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** motion
- **Disposition:** adapt
- **Observation:** A GIF badge implies the graph moves. Speed and idle behavior are not visible. See `FND-KUNI-016`.
- **Interpretation:** Motion comes from damped orbit, zoom, and pan, plus opt-in auto-rotate. Do not invent an aggressive default spin from the badge.
- **Rationale:** Already decided in `DEC-KUNI-015` and `CRIT-KUNI-007`.
- **Confidence:** medium
- **Unacceptable opposite:** Uncontrollable auto-spin, or a static image with no camera.
- **Supports:** `CRIT-KUNI-007`, `CRIT-KUNI-015`, `DEC-KUNI-015`

### RDR-KUNI-017 · Missing first-party HUD

- **Kind:** reference-decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** `docs/reference/3d-network-reference.png`
- **Source aspect:** composition
- **Disposition:** adapt
- **Observation:** The still has no product title, view controls, type legend, search field, or details panel on the canvas.
- **Interpretation:** Add the approved thin HUD. Do not fill the gap with dashboard modules.
- **Rationale:** `DEC-KUNI-009` already specifies chrome regions. The reference is not a HUD source.
- **Confidence:** high
- **Unacceptable opposite:** No chrome at all, or an admin dashboard copied from elsewhere.
- **Supports:** `CRIT-KUNI-019`, `CRIT-KUNI-010`, `CRIT-KUNI-021`, `DEC-KUNI-009`

## Dimensions not decided from this source

| Dimension | Why unused |
|-----------|------------|
| Responsiveness | The still is a desktop Reddit embed. Responsive rules stay with `DEC-KUNI-006` and `CRIT-KUNI-022`. |
| Accessibility | No accessible names, contrast policy, or keyboard path is visible. `ASM-KUNI-004` stands. |
| Exact palette, camera pose, node count | Not measurable as product truth from this frame. Design must satisfy criteria, not match pixels. |

## Summary

| Disposition | Aspects |
|-------------|---------|
| Retain | Graph-first composition, size hierarchy, center density, perspective depth, thin edges |
| Adapt | Category color (restrained), node form and rings, glass labels, active-node mark plus neighborhood, camera motion, specified HUD |
| Reject | Reddit chrome, flat black void, node pictograms, persistent RELATED_TO labels, literal entities, demo tone |
| Unresolved | None |
