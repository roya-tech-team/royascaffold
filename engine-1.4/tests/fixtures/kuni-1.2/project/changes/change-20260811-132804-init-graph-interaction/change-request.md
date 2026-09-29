# Change Request

## Metadata
- **date**: 2026-08-11
- **change-type**: new-module
- **target-app**: web
- **affected-repos**: frontend
- **priority**: high
- **request-id**: REQ-INIT
- **part**: 4/5
- **depends-on**: change-20260811-132803
- **blocks**: change-20260811-132805
- **pack-status**: merged

## Scope
- Module(s): GraphInteraction
- Feature(s): Hover Interaction, Selection & Neighborhood, Focus Camera, Camera Controls, Interaction State Store
- Endpoint(s): —
- Page(s)/View(s): web: Graph Interaction Layer (`PG-GRAPHINTERACTION-01`)
- Service(s): local adjacency lookups from `GraphDataset`

## Description
Fourth REQ-INIT pack. Adds the behavior layer on the Graph Universe Scene at `/`. Implements DEFAULT / HOVER / SELECTED / FOCUS / DIMMED visual states with smooth transitions. Hover intensifies node, scales, highlights connected edges/neighbors, shows label, and updates cursor. Click selects a node, emphasizes first-degree neighborhood, dims unrelated graph, and drives details panel + optional smooth camera focus. OrbitControls with damping, zoom/pan/rotate, distance limits, and subtle toggleable auto-rotate. Zustand store holds hover/select/labels/autoRotate/focus — not the Three.js scene graph.

## Acceptance Criteria
1. Zustand `graphStore` (or equivalent) manages `selectedNodeId`, `hoveredNodeId`, `showLabels`, `autoRotate`, `focusedNodeId`.
2. Hover state intensifies node, scales, highlights neighborhood edges/nodes, shows label, updates cursor.
3. Selection emphasizes first-degree graph and dims unrelated nodes/edges (they do not hard-disappear).
4. Smooth camera transition toward selected node on focus (optional but supported).
5. OrbitControls with damping, zoom/pan/rotate, min/max distance, good initial pose.
6. Auto-rotate is subtle, user-toggleable, and never annoying.
7. Interaction hooks (`useGraphInteraction`, `useGraphCamera`) integrate cleanly with GraphScene components.
8. States transition smoothly (DEFAULT → HOVER → SELECTED → FOCUS → DIMMED).

## Notes
- Blocked until GraphScene pack (change-20260811-132803) is verified/merged.
- Details panel UI chrome deferred to GraphChrome pack; store fields must be ready for it.
