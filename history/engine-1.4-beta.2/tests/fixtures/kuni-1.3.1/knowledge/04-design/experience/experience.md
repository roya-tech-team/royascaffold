---
document_id: DOC-KUNI-EXPERIENCE
title: Knowledge Universe experience
layer: design
schema_version: 2
document_status: in-review
owners: [product-owner]
---

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
