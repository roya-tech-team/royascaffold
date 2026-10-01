# Pages — Knowledge Universe Web · GraphScene

### Graph Universe Scene `PG-GRAPHSCENE-01`

- Route: `/` (primary canvas within App Root Shell)
- Status: done
- Components: `GraphCanvas`, `GraphNode`(s)/instanced nodes, `GraphEdge`(s), `GraphLabels`, background particles, post-processing (restrained bloom)
- Service: reads `GraphDataset` from GraphData modules; visual configs from `nodeTypeConfig` / `edgeTypeConfig` — no HTTP
- Guard: `none`
- Notes: Full-screen R3F scene. Dark immersive atmosphere (radial gradient, stars/particles, fog). Glowing category-aware nodes, thin glowing edges, selective glass labels. Performance-minded (instancing/buffer geometry where appropriate). Visual quality above `docs/reference/3d-network-reference.png`. UI states: loading (brief canvas init), success (graph visible), empty (generator failure — show minimal error toast), error (WebGL unsupported message).
