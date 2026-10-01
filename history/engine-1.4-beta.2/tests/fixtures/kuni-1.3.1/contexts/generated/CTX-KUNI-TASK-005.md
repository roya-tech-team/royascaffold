# Generated Context Pack

> Generated view. Do not edit or treat as canonical.

- Manifest: `CTX-KUNI-TASK-005`
- Role: implementer
- Context tier: standard
- Project hash: `a6a7407b1109ae4b1b85dd29565aaa1d7efab20ee88dd24373eb0e0fbb218d57`
- Root IDs: `TASK-KUNI-005`
- Included IDs: `TASK-KUNI-005`, `CRIT-KUNI-008`, `CRIT-KUNI-009`, `CRIT-KUNI-010`, `DEC-KUNI-011`, `DEC-KUNI-014`, `PAT-KUNI-004`, `PAT-KUNI-007`, `RDR-KUNI-013`, `INV-KUNI-003`, `INV-KUNI-007`, `WF-KUNI-INSPECT`, `CMP-KUNI-DETAILS`, `TEST-KUNI-003`
- Review IDs: `REV-KUNI-SQR-001`
- Overflow policy: fail-and-split

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
## Artifact · TASK-KUNI-005

_Source: `changes/active/CHG-KUNI-001/execution-plan.md:154`_

### TASK-KUNI-005 · Add hover selection and details

- **Kind:** execution-task
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Goal:** Hover and select emphasize a first-degree neighborhood and a glass panel shows required facts.
- **Task class:** foundation
- **Context tier:** standard
- **Escalation:** Stop and return to design when a material decision is missing.
- **Depends on:** `TASK-KUNI-004`
- **Preconditions:** `TASK-KUNI-004` done
- **Inputs:** `WF-KUNI-INSPECT`, `PAT-KUNI-007`, `knowledge/04-design/experience/experience.md`
- **Allowed paths:** `src/features/graph/components`, `src/features/graph/state`, `src/features/graph/hooks`, `src/components/ui`
- **Forbidden inventions:** hiding unrelated nodes, two-hop neighborhoods, admin forms, stored adjacency that goes stale
- **Outputs:** `ACT-KUNI-HOVER` `ACT-KUNI-SELECT` `ACT-KUNI-CLEAR` `CMP-KUNI-DETAILS`
- **Checks:** hover scales and lights a neighborhood; select is distinct and dims the rest; panel shows name type description and undirected degree; empty canvas clears
- **Done when:** `CRIT-KUNI-008` `CRIT-KUNI-009` `CRIT-KUNI-010` hold
- **Recovery:** derive neighborhood from the current graph plus one id
- **Handoff:** `TASK-KUNI-006` may add labels and chrome
- **Implements:** `CRIT-KUNI-008`, `CRIT-KUNI-009`, `CRIT-KUNI-010`, `DEC-KUNI-011`, `DEC-KUNI-014`, `PAT-KUNI-004`, `PAT-KUNI-007`, `RDR-KUNI-013`, `CMP-KUNI-DETAILS`, `INV-KUNI-003`, `INV-KUNI-007`
- **Verified by:** `TEST-KUNI-003`

Steps:

1. Keep hoveredNodeId and selectedNodeId in the store. Derive neighbors either direction one hop.
2. Hover: scale 1.12, ring 1.35x, hit area 1.8x, emphasized edges and neighbors, pointer cursor, smooth transition. Dim unrelated by 0.28.
3. Select: scale 1.18, ring 1.35x, dim unrelated elements, keep them visible.
4. Show a bottom-right glass panel, 300px wide, 24px from bottom and right, with name, type, description, and undirected degree.
5. Empty-canvas click clears hover selection focus and the panel.
6. Do not implement search filtering.
## Artifact · CRIT-KUNI-008

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:193`_

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
## Artifact · CRIT-KUNI-009

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:207`_

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
## Artifact · CRIT-KUNI-010

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:221`_

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
## Artifact · DEC-KUNI-011

_Source: `changes/active/CHG-KUNI-001/change.md:271`_

### DEC-KUNI-011 · Visual interaction states

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** the graph has default, hover, selected, focus, and dimmed states. Unrelated elements dim and remain visible. Transitions are smooth.
## Artifact · DEC-KUNI-014

_Source: `changes/active/CHG-KUNI-001/change.md:307`_

### DEC-KUNI-014 · Basic mobile and empty-canvas clear

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** recommendation authorized 2026-08-20
- **Statement:** mobile keeps a usable touch-orbit canvas; chrome may stack. Clicking empty canvas clears selection, hover, focus, and the details panel. Reset View also restores the initial camera framing.
## Artifact · PAT-KUNI-004

_Source: `changes/active/CHG-KUNI-001/pattern-decisions.md:80`_

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
## Artifact · PAT-KUNI-007

_Source: `changes/active/CHG-KUNI-001/pattern-decisions.md:143`_

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
## Artifact · RDR-KUNI-013

_Source: `changes/active/CHG-KUNI-001/reference-decisions.md:350`_

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
## Artifact · INV-KUNI-003

_Source: `knowledge/03-domain/domain.md:194`_

### INV-KUNI-003 · Unrelated elements dim rather than vanish

- **Kind:** invariant
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Rule:** hover and selection emphasize a neighborhood by dimming the rest. The rest remains present.
- **Supports:** `REQ-KUNI-007`, `REQ-KUNI-008`, `DEC-KUNI-011`
## Artifact · INV-KUNI-007

_Source: `knowledge/03-domain/domain.md:230`_

### INV-KUNI-007 · Neighborhood is first-degree

- **Kind:** invariant
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Rule:** a neighborhood is the focus node plus nodes and edges one hop away in either direction. Second-degree nodes are not emphasized as neighbors.
- **Supports:** `REQ-KUNI-007`, `REQ-KUNI-008`
## Artifact · WF-KUNI-INSPECT

_Source: `knowledge/03-domain/workflows/explorer.md:49`_

### WF-KUNI-INSPECT · Inspect a neighborhood

- **Kind:** workflow
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Purpose:** reveal a node’s meaning and first-degree relationships without leaving the universe.
- **Actors:** Explorer
- **Trigger:** the explorer clicks a node
- **Preconditions:** a graph is visible
- **States:** default, selected, focused, dimmed-background
- **Happy path:**
  1. The explorer clicks a node.
  2. The node becomes selected and is distinct from hover.
  3. First-degree neighbors and connecting edges stay bright.
  4. Unrelated elements dim and remain visible.
  5. A glass panel shows name, type, description, and connection count.
  6. The camera may ease toward the node.
  7. Empty-canvas click or Reset View returns to default.
- **Alternatives:** hover-only inspection emphasizes a neighborhood and shows a label but does not open the panel.
- **Failures:** clicking a non-node does not select. A node without a description still shows name, type, and connection count.
- **Events:** `NodeSelected`, `SelectionCleared`
- **Invariants:** `INV-KUNI-002`, `INV-KUNI-003`, `INV-KUNI-007`, `INV-KUNI-009`
- **Satisfies:** `UC-KUNI-002`, `CAP-KUNI-002`

```mermaid
stateDiagram-v2
  [*] --> default
  default --> selected: NodeSelected
  selected --> focused: camera eases in
  focused --> selected: ease complete
  selected --> default: SelectionCleared
  focused --> default: SelectionCleared
```
## Artifact · CMP-KUNI-DETAILS

_Source: `knowledge/05-implementation/components/components.md:82`_

### CMP-KUNI-DETAILS · Node details panel

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** show name, type, description, and connection count for the selected node in a glass panel.
- **Depends on:** `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-009`
- **Constrained by:** `PAT-KUNI-004`
## Artifact · TEST-KUNI-003

_Source: `knowledge/05-implementation/tests/tests.md:32`_

### TEST-KUNI-003 · Interaction

- **Kind:** test
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Method:** hover three types; select a hub and a peripheral; click empty canvas; observe panel fields
- **Covers:** `CRIT-KUNI-007`, `CRIT-KUNI-008`, `CRIT-KUNI-009`, `CRIT-KUNI-010`, `CRIT-KUNI-024`

## Manifest source

`contexts/manifests/CTX-KUNI-TASK-005.md`
