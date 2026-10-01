# Generated Context Pack

> Generated view. Do not edit or treat as canonical.

- Manifest: `CTX-KUNI-TASK-007`
- Role: implementer
- Context tier: standard
- Project hash: `a6a7407b1109ae4b1b85dd29565aaa1d7efab20ee88dd24373eb0e0fbb218d57`
- Root IDs: `TASK-KUNI-007`
- Included IDs: `TASK-KUNI-007`, `CRIT-KUNI-021`, `CRIT-KUNI-024`, `CRIT-KUNI-025`, `DEC-KUNI-016`, `PAT-KUNI-003`, `ACT-KUNI-FOCUS`, `TEST-KUNI-003`, `TEST-KUNI-005`
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
## Artifact · TASK-KUNI-007

_Source: `changes/active/CHG-KUNI-001/execution-plan.md:220`_

### TASK-KUNI-007 · Polish optional search focus and scale

- **Kind:** execution-task
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Goal:** Optional finish: polished inert search, smooth select-to-focus, and a rendering structure that can grow.
- **Task class:** optional
- **Context tier:** standard
- **Escalation:** Stop and return to design when a material decision is missing.
- **Depends on:** `TASK-KUNI-006`
- **Preconditions:** `TASK-KUNI-006` done
- **Inputs:** `CRIT-KUNI-021`, `CRIT-KUNI-024`, `CRIT-KUNI-025`, `DEC-KUNI-016`, `PAT-KUNI-003`
- **Allowed paths:** `src/features/graph`, `src/components/ui`
- **Forbidden inventions:** real search, backend, new chrome regions, weakening foundation quality to chase effects
- **Outputs:** polished search placeholder, `ACT-KUNI-FOCUS`, instancing or shared-geometry review note
- **Checks:** search looks finished and still does not filter; select eases camera; node forms remain shared or instanced
- **Done when:** `CRIT-KUNI-021` `CRIT-KUNI-024` `CRIT-KUNI-025` hold or are explicitly deferred with owner note
- **Recovery:** leave foundation behavior in place; do not add dashboard chrome
- **Handoff:** verification against the QDC
- **Implements:** `CRIT-KUNI-021`, `CRIT-KUNI-024`, `CRIT-KUNI-025`, `DEC-KUNI-016`, `PAT-KUNI-003`, `ACT-KUNI-FOCUS`
- **Verified by:** `TEST-KUNI-003`, `TEST-KUNI-005`

Steps:

1. Finish the search field visually. Keep it inert.
2. On select, lerp the camera toward the node without a snap.
3. Review node and edge drawing. If per-element meshes remain, convert repeated forms to instanced or shared geometry.
4. Do not start the next product layer.
## Artifact · CRIT-KUNI-021

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:375`_

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
## Artifact · CRIT-KUNI-024

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:417`_

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
## Artifact · CRIT-KUNI-025

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:431`_

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
## Artifact · DEC-KUNI-016

_Source: `changes/active/CHG-KUNI-001/change.md:331`_

### DEC-KUNI-016 · Selection may focus the camera

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** non-material
- **Authority:** product-owner
- **Source:** recommendation authorized 2026-08-20
- **Statement:** selecting a node smoothly approaches the camera toward that node. This is in-scope polish, not a later-phase feature.
## Artifact · PAT-KUNI-003

_Source: `changes/active/CHG-KUNI-001/pattern-decisions.md:59`_

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
## Artifact · ACT-KUNI-FOCUS

_Source: `knowledge/05-implementation/actions/actions.md:87`_

### ACT-KUNI-FOCUS · Ease camera to selection

- **Kind:** action
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** NodeSelected
- **Actor:** system
- **Output:** smooth camera approach
- **Called components:** `CMP-KUNI-CANVAS`, `CMP-KUNI-STORE`
- **Success:** framing approaches the selected node without a snap
- **Implements:** `CRIT-KUNI-024`, `DEC-KUNI-016`
## Artifact · TEST-KUNI-003

_Source: `knowledge/05-implementation/tests/tests.md:32`_

### TEST-KUNI-003 · Interaction

- **Kind:** test
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Method:** hover three types; select a hub and a peripheral; click empty canvas; observe panel fields
- **Covers:** `CRIT-KUNI-007`, `CRIT-KUNI-008`, `CRIT-KUNI-009`, `CRIT-KUNI-010`, `CRIT-KUNI-024`
## Artifact · TEST-KUNI-005

_Source: `knowledge/05-implementation/tests/tests.md:50`_

### TEST-KUNI-005 · Static quality and locality

- **Kind:** test
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Method:** `npm run typecheck`; review dependencies for no backend or identity; orbit 10 seconds
- **Covers:** `CRIT-KUNI-017`, `CRIT-KUNI-020`, `CRIT-KUNI-023`, `CRIT-KUNI-025`

## Manifest source

`contexts/manifests/CTX-KUNI-TASK-007.md`
