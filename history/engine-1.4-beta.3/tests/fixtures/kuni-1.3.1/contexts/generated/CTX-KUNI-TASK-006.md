# Generated Context Pack

> Generated view. Do not edit or treat as canonical.

- Manifest: `CTX-KUNI-TASK-006`
- Role: implementer
- Context tier: standard
- Project hash: `a6a7407b1109ae4b1b85dd29565aaa1d7efab20ee88dd24373eb0e0fbb218d57`
- Root IDs: `TASK-KUNI-006`
- Included IDs: `TASK-KUNI-006`, `CRIT-KUNI-011`, `CRIT-KUNI-012`, `CRIT-KUNI-013`, `CRIT-KUNI-014`, `CRIT-KUNI-019`, `CRIT-KUNI-022`, `DEC-KUNI-004`, `DEC-KUNI-007`, `DEC-KUNI-009`, `DEC-KUNI-012`, `PAT-KUNI-004`, `PAT-KUNI-009`, `RDR-KUNI-002`, `RDR-KUNI-011`, `RDR-KUNI-012`, `RDR-KUNI-017`, `INV-KUNI-002`, `INV-KUNI-008`, `INV-KUNI-009`, `CMP-KUNI-LABELS`, `CMP-KUNI-HUD`, `TEST-KUNI-001`, `TEST-KUNI-004`
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
## Artifact · TASK-KUNI-006

_Source: `changes/active/CHG-KUNI-001/execution-plan.md:186`_

### TASK-KUNI-006 · Add labels chrome and view controls

- **Kind:** execution-task
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Goal:** Selective glass labels and the specified HUD let the explorer control the view without a dashboard.
- **Task class:** foundation
- **Context tier:** standard
- **Escalation:** Stop and return to design when a material decision is missing.
- **Depends on:** `TASK-KUNI-005`
- **Preconditions:** `TASK-KUNI-005` done
- **Inputs:** `PAT-KUNI-009`, `DEC-KUNI-009`, `DEC-KUNI-012`, `knowledge/04-design/experience/experience.md`
- **Allowed paths:** `src/features/graph/components`, `src/components/layout`, `src/components/ui`
- **Forbidden inventions:** labels on every node, persistent edge captions, Reddit chrome, extra settings modules, search execution
- **Outputs:** `CMP-KUNI-LABELS` `CMP-KUNI-HUD` and working Reset Labels AutoRotate Randomize controls
- **Checks:** title and subtitle match; four controls work; legend lists seven types; search field is visible and does not filter; 1440x900 and 1024x768 remain usable
- **Done when:** `CRIT-KUNI-011` `CRIT-KUNI-012` `CRIT-KUNI-013` `CRIT-KUNI-014` `CRIT-KUNI-019` `CRIT-KUNI-022` hold. Search presence holds; polish may wait for `TASK-KUNI-007`
- **Recovery:** hide default labels if the view is noisy; keep hover and selection labels
- **Handoff:** `TASK-KUNI-007` may polish search and select-to-focus
- **Implements:** `CRIT-KUNI-011`, `CRIT-KUNI-012`, `CRIT-KUNI-013`, `CRIT-KUNI-014`, `CRIT-KUNI-019`, `CRIT-KUNI-022`, `DEC-KUNI-004`, `DEC-KUNI-007`, `DEC-KUNI-009`, `DEC-KUNI-012`, `PAT-KUNI-004`, `PAT-KUNI-009`, `RDR-KUNI-002`, `RDR-KUNI-011`, `RDR-KUNI-012`, `RDR-KUNI-017`, `CMP-KUNI-LABELS`, `CMP-KUNI-HUD`, `INV-KUNI-002`, `INV-KUNI-008`, `INV-KUNI-009`
- **Verified by:** `TEST-KUNI-001`, `TEST-KUNI-004`

Steps:

1. Add Drei HTML glass labels for important nearby hovered and selected nodes. Default labels: importance ≥ 0.72 or the 12 highest-importance nodes, whichever is fewer. Nearby labels when camera distance < 14. Upright. Not every node.
2. Place HUD: top-left title Knowledge Universe 13px weight 500 `#D7DCE6` and subtitle Interactive 3D Network 11px `#8B93A7`; top-center search field; top-right Reset View Randomize Toggle Labels Toggle Auto Rotate; bottom-left type legend.
3. Reset View restores home camera and clears attention and the panel.
4. Toggle Labels changes default importance labels only.
5. Toggle Auto Rotate enables interruptible motion at `autoRotateSpeed` 0.4 from `TASK-KUNI-004`.
6. Randomize calls the new-seed generator and clears attention.
7. Search field placeholder is Search knowledge... Typing does not filter. Polish may be basic here.
8. If generation fails, show Could not create the universe.
## Artifact · CRIT-KUNI-011

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:235`_

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
## Artifact · CRIT-KUNI-012

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:249`_

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
## Artifact · CRIT-KUNI-013

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:263`_

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
## Artifact · CRIT-KUNI-014

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:277`_

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
## Artifact · CRIT-KUNI-019

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:347`_

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
## Artifact · CRIT-KUNI-022

_Source: `changes/active/CHG-KUNI-001/quality-design-contract.md:389`_

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
## Artifact · DEC-KUNI-004

_Source: `changes/active/CHG-KUNI-001/change.md:187`_

### DEC-KUNI-004 · Product chrome copy

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** title is “Knowledge Universe”. Subtitle is “Interactive 3D Network”.
## Artifact · DEC-KUNI-007

_Source: `changes/active/CHG-KUNI-001/change.md:223`_

### DEC-KUNI-007 · Search is a visual placeholder

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** a polished search field is visible and architecture-ready. It does not search, filter, or query.
## Artifact · DEC-KUNI-009

_Source: `changes/active/CHG-KUNI-001/change.md:247`_

### DEC-KUNI-009 · Chrome composition

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20 plus recommendation authority for placement
- **Statement:** top-left title and subtitle; top-right Reset View, Randomize, Toggle Labels, and Toggle Auto Rotate; bottom-left type legend; top-center search placeholder; bottom-right glass details panel on selection. The graph dominates. This is not an admin dashboard.
## Artifact · DEC-KUNI-012

_Source: `changes/active/CHG-KUNI-001/change.md:283`_

### DEC-KUNI-012 · Label visibility policy

- **Kind:** decision
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Decision status:** decided
- **Materiality:** material
- **Authority:** product-owner
- **Source:** stakeholder-brief-2026-08-20
- **Statement:** default labels appear for important nodes only. Hovered and selected nodes always show a readable glass label. Nearby nodes may reveal labels as the camera approaches. Toggle Labels hides or shows default importance labels without removing hover and selection labels. Persistent edge labels are not required in this milestone.
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
## Artifact · PAT-KUNI-009

_Source: `changes/active/CHG-KUNI-001/pattern-decisions.md:185`_

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
## Artifact · RDR-KUNI-002

_Source: `changes/active/CHG-KUNI-001/reference-decisions.md:141`_

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
## Artifact · RDR-KUNI-011

_Source: `changes/active/CHG-KUNI-001/reference-decisions.md:312`_

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
## Artifact · RDR-KUNI-012

_Source: `changes/active/CHG-KUNI-001/reference-decisions.md:331`_

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
## Artifact · RDR-KUNI-017

_Source: `changes/active/CHG-KUNI-001/reference-decisions.md:426`_

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
## Artifact · INV-KUNI-002

_Source: `knowledge/03-domain/domain.md:185`_

### INV-KUNI-002 · Labels follow importance and attention

- **Kind:** invariant
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Rule:** default labels are reserved for important or nearby nodes. Hover or selection always earns a label. Persistent edge labels are not part of this milestone.
- **Supports:** `REQ-KUNI-010`, `DEC-KUNI-012`
## Artifact · INV-KUNI-008

_Source: `knowledge/03-domain/domain.md:239`_

### INV-KUNI-008 · Search does not change the graph

- **Kind:** invariant
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Rule:** the search field is visible and may accept typing. It does not filter, query, or replace the graph.
- **Supports:** `REQ-KUNI-015`, `DEC-KUNI-007`
## Artifact · INV-KUNI-009

_Source: `knowledge/03-domain/domain.md:248`_

### INV-KUNI-009 · Clear and reset restore default view

- **Kind:** invariant
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** product-owner
- **Rule:** empty-canvas click clears hover, selection, focus, and the details panel. Reset View does the same and restores home camera framing.
- **Supports:** `REQ-KUNI-008`, `REQ-KUNI-011`, `DEC-KUNI-014`
## Artifact · CMP-KUNI-LABELS

_Source: `knowledge/05-implementation/components/components.md:60`_

### CMP-KUNI-LABELS · Node labels

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** show readable glass labels for important, nearby, hovered, and selected nodes.
- **Depends on:** `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-010`
- **Constrained by:** `INV-KUNI-002`, `PAT-KUNI-004`
## Artifact · CMP-KUNI-HUD

_Source: `knowledge/05-implementation/components/components.md:71`_

### CMP-KUNI-HUD · Overlay chrome

- **Kind:** component
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Responsibility:** title, search placeholder, view controls, and legend. Must stay visually quiet.
- **Depends on:** `CMP-KUNI-STORE`, `CMP-KUNI-DETAILS`
- **Implements:** `REQ-KUNI-011`, `REQ-KUNI-012`, `REQ-KUNI-013`, `REQ-KUNI-014`, `REQ-KUNI-015`, `REQ-KUNI-016`
- **Constrained by:** `PAT-KUNI-009`
## Artifact · TEST-KUNI-001

_Source: `knowledge/05-implementation/tests/tests.md:14`_

### TEST-KUNI-001 · Launch and chrome

- **Kind:** test
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Method:** launch at 1440×900 and 1024×768; photograph first view and HUD regions
- **Covers:** `CRIT-KUNI-001`, `CRIT-KUNI-019`, `CRIT-KUNI-021`, `CRIT-KUNI-022`
## Artifact · TEST-KUNI-004

_Source: `knowledge/05-implementation/tests/tests.md:41`_

### TEST-KUNI-004 · Controls and labels

- **Kind:** test
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Method:** Reset View, Toggle Labels, Toggle Auto Rotate, Randomize twice
- **Covers:** `CRIT-KUNI-011`, `CRIT-KUNI-012`, `CRIT-KUNI-013`, `CRIT-KUNI-014`, `CRIT-KUNI-015`

## Manifest source

`contexts/manifests/CTX-KUNI-TASK-006.md`
