# Modules & Features (excerpt) — GraphInteraction

## 4. GraphInteraction
- Scope: FE `src/features/graph/hooks/`, `state/`, interaction-aware scene updates
- Audience: public
- Entities: GraphUiState fields
- Depends on: `GraphScene`, `GraphData`

### Features
1. **Hover Interaction** [frontend] — intensify node, scale, highlight connected edges/neighbors, show label, cursor
2. **Selection & Neighborhood** [frontend] — select node, emphasize first-degree graph, dim unrelated
3. **Focus Camera** [frontend] — smooth camera transition toward selected node
4. **Camera Controls** [frontend] — OrbitControls with damping, zoom/pan/rotate, min/max distance, good initial pose; subtle optional auto-rotate
5. **Interaction State Store** [frontend] — Zustand store for hover/select/labels/autoRotate/focus (not the Three.js scene graph)

### Notes
- States: DEFAULT, HOVER, SELECTED, FOCUS, DIMMED — smooth transitions
