# Modules & Features

Frontend-only MVP. No backend modules. Scopes refer to intended client paths under the workspace Vite app.

## 1. Foundation
- Scope: FE `src/` app bootstrap (Vite + React + TS + Tailwind + Framer Motion + R3F deps)
- Audience: public
- Entities: —
- Depends on: —

### Features
1. **App Bootstrap** [frontend] — Vite/React/TS strict project, entry, global styles, Tailwind
2. **Dependency Scaffold** [frontend] — R3F, Drei, Three, Zustand, Framer Motion installed and wired
3. **App Shell Layout** [frontend] — full-viewport shell that hosts graph + chrome overlays without dashboard chrome

### Notes
- First implementation pack; no product graph logic yet beyond empty host route

## 2. GraphData
- Scope: FE `src/features/graph/types/`, `config/`, `data/`
- Audience: public
- Entities: `GraphNode`, `GraphEdge`, `NodeType`, `EdgeType`, visual configs
- Depends on: `Foundation`

### Features
1. **Graph Domain Types** [frontend] — strict TypeScript models for nodes/edges/enums
2. **Visual Type Config** [frontend] — centralized `nodeTypeConfig` / `edgeTypeConfig` (colors, shapes, sizes, opacities)
3. **Mock Graph Dataset** [frontend] — curated seed entities (AI/tech/knowledge themes) plus generated fill to ≥100 nodes
4. **Cluster Graph Generator** [frontend] — reusable layout/relationship generator producing clusters, hubs, peripherals in 3D

### Notes
- Renderer must never hardcode specific dummy entity IDs/labels

## 3. GraphScene
- Scope: FE `src/features/graph/components/` (canvas, nodes, edges, labels, background, effects)
- Audience: public
- Entities: `GraphNode`, `GraphEdge`
- Depends on: `Foundation`, `GraphData`

### Features
1. **Graph Canvas** [frontend] — full-screen R3F canvas with lighting, fog, camera defaults
2. **Node Rendering** [frontend] — category-aware glowing spheres/geometry; importance sizing; rings where configured; scale-ready approach
3. **Edge Rendering** [frontend] — thin glowing connections; relationship-type appearance; efficient geometry
4. **Selective Labels** [frontend] — HTML/CSS or Drei Html labels for important/hovered/selected/near nodes with glass styling
5. **Environment & Effects** [frontend] — radial atmosphere, star/particle field, restrained bloom/vignette/depth cues

### Notes
- Visual bar: more polished than `docs/reference/3d-network-reference.png`

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

## 5. GraphChrome
- Scope: FE `src/features/graph/components/` + `src/components/ui/` overlays
- Audience: public
- Entities: —
- Depends on: `GraphInteraction`, `GraphData`

### Features
1. **Product Header** [frontend] — “Knowledge Universe” + “Interactive 3D Network”
2. **Graph Controls** [frontend] — Reset View, Randomize, Toggle Labels, Toggle Auto Rotate
3. **Node Details Panel** [frontend] — glass panel: name, type, description, connection count
4. **Type Legend** [frontend] — bottom-left legend for node types
5. **Search Placeholder** [frontend] — polished non-functional search field, architecture-ready

### Notes
- Minimal UI; graph remains the hero composition
