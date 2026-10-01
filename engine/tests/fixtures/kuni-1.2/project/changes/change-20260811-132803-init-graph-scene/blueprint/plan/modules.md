# Modules & Features (excerpt) — GraphScene

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
