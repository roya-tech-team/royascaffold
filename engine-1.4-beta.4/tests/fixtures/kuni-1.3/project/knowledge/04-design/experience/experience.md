---
document_id: DOC-KUNI-EXPERIENCE
title: Knowledge Universe experience
layer: design
schema_version: 1
document_status: approved
owners: [knowledge-universe-team]
---

# Experience

Inspiration file: `docs/reference/3d-network-reference.png`. Do not copy it. Produce a cleaner, more cinematic result: glowing but restrained nodes, thin edges, fewer labels, deeper space, and quieter chrome.

## Journey

1. Explorer lands in a dark universe of clustered nodes.
2. They orbit and notice hubs, colors, and faint stars.
3. Hover brightens a neighborhood and reveals a glass label.
4. Click opens a glass details panel and dims the rest.
5. Controls reset, relabel, rotate, or generate another universe.
6. Search field is visible and does nothing.
7. Path mode traces a walk and a semantic chain.
8. Influence mode makes central nodes read stronger.
9. The timeline playhead lets later knowledge fade into the future.

## Information

- Title: Knowledge Universe
- Subtitle: Interactive 3D Network
- Search placeholder: Search knowledge...
- Details: name, type, description, connection count, year, influence, typed neighbors
- Legend: one mark per node type
- Edge filters: one chip per relationship type
- Timeline: year playhead with play and pause

## Screens

One screen. Full-bleed canvas. Overlay chrome.

| Region | Content |
|--------|---------|
| Top left | Title and subtitle |
| Top center | Search placeholder |
| Top right | Reset View, Randomize, Toggle Labels, Toggle Auto Rotate, Inspect, Path, Influence |
| Bottom left | Type legend and relationship filters |
| Bottom center | Year timeline |
| Trailing side | Details panel and semantic path chain |

## Interaction states

| State | Canvas | Chrome |
|-------|--------|--------|
| Default | All visible, important labels only | Search inert, no details |
| Hover | Focus node scaled and brighter, neighbors lit, others slightly dim | Cursor indicates a target |
| Selected | Neighborhood emphasized, others dimmed | Details panel open |
| Focused | Camera eases toward the selected node | Details remain |
| Labels off | Importance labels hidden | Hover and selection labels remain |

## Interface states

- Loading: brief, if any; generation is local.
- Empty: not expected after generation. If generation failed, show a quiet error in chrome.
- Success: graph visible.
- Unauthorized: not applicable.

## Motion

- Camera damping on orbit.
- Smooth intensity and scale changes on hover and selection.
- Details panel eases in with Framer Motion.
- Auto-rotate is slow.

## Accessibility and responsive

- Desktop is the visual target.
- Tablet keeps full-bleed canvas and reachable controls.
- Contrast on labels and chrome must stay readable on the dark scene.
- Node picking needs a generous hit area relative to the visible sphere.

## Visual rules

- Deep navy space, radial falloff, sparse stars.
- Nodes are dimensional, not flat discs.
- Edges stay thin; bloom stays modest.
- No dashboard cards, no thick neon webs, no label forest.
